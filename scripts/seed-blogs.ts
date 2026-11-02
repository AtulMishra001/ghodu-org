/**
 * Adds data/seed/blog-*.json posts to MongoDB. See data/seed/README.md.
 *
 *   npm run seed:blogs -- [slug] [--dry-run] [--draft] [--image <url or .webp path>]
 *
 * Insert only: existing slugs are skipped and never changed, so re-running is
 * safe. Every file is validated, and every image resolved, before the first
 * write, so a bad file can't leave the import half done.
 *
 * A draft may have no image yet: add it in /admin/blogs, which requires one
 * before it saves or publishes the post.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { BLOG_HERO_MAX_BYTES, BLOG_IMAGE_FOLDER } from "@/data/blog";
import { isWebpBytes, IMAGE_MIME } from "@/lib/image-rules";
import { BlogWriteError, prepareBlog } from "@/lib/server/blogs";
import { uploadToFolder } from "@/lib/server/cloudinary";
import { env } from "@/lib/server/env";
import { connectDB } from "@/lib/server/mongoose";
import { BlogModel } from "@/models/Blog";

const SEED_DIR = path.resolve("data/seed");

function parseArgs(argv: string[]) {
  const args = { dryRun: false, draft: false, image: undefined as string | undefined, slugs: [] as string[] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--draft") args.draft = true;
    else if (argv[i] === "--image") args.image = argv[++i];
    else if (argv[i].startsWith("--")) throw new Error(`Unknown flag ${argv[i]}`);
    else args.slugs.push(argv[i]);
  }
  if (args.image === "") throw new Error("--image needs a URL or a .webp path");
  return args;
}

const isOurs = (url: string) => url.startsWith(`https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/`);

function checkLocalImage(file: string) {
  if (!/\.webp$/i.test(file)) throw new Error(`${file}: only .webp files can be uploaded`);
  const bytes = readFileSync(path.resolve(file));
  if (!isWebpBytes(bytes)) throw new Error(`${file}: this isn't a real WebP file`);
  if (statSync(path.resolve(file)).size > BLOG_HERO_MAX_BYTES) throw new Error(`${file}: larger than 2 MB`);
  return bytes;
}

/** Local file or remote URL → a URL in our Cloudinary folder, the same one the admin form uses. */
async function resolveImage(image: string, dryRun: boolean) {
  if (isOurs(image)) return image;
  if (/^https:\/\//i.test(image)) return dryRun ? image : (await uploadToFolder(image, BLOG_IMAGE_FOLDER)).url;
  const bytes = checkLocalImage(image);
  return dryRun ? image : (await uploadToFolder(new Blob([bytes], { type: IMAGE_MIME }), BLOG_IMAGE_FOLDER)).url;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = readdirSync(SEED_DIR).filter((f) => /^blog-.*\.json$/.test(f)).sort();
  if (!files.length) {
    console.log(`No blog-*.json files in ${SEED_DIR}. Nothing to do.`);
    return;
  }

  // 1. Read and pick.
  const problems: string[] = [];
  let seeds = files.flatMap((file) => {
    try {
      return [{ file, data: JSON.parse(readFileSync(path.join(SEED_DIR, file), "utf8")) as Record<string, unknown> }];
    } catch (err) {
      problems.push(`${file}: ${(err as Error).message}`);
      return [];
    }
  });
  if (args.slugs.length) {
    const missing = args.slugs.filter((s) => !seeds.some((seed) => seed.data.slug === s));
    if (missing.length) problems.push(`No seed file has the slug: ${missing.join(", ")}`);
    seeds = seeds.filter((seed) => args.slugs.includes(String(seed.data.slug)));
  }
  if (args.image && seeds.length !== 1) problems.push("--image can only be used when one post is selected.");

  // 2. Validate everything, using a stand-in hero image until the real one is resolved.
  const standIn = `https://res.cloudinary.com/${env("CLOUDINARY_CLOUD_NAME")}/image/upload/validation.webp`;
  for (const seed of seeds) {
    if (args.draft) seed.data.status = "draft";
    const image = args.image ?? (typeof seed.data.image === "string" ? seed.data.image : "");
    const mayLackImage = seed.data.status !== "published";
    try {
      prepareBlog({ ...seed.data, image: image || mayLackImage ? standIn : "" });
      if (image && !isOurs(image) && !/^https:\/\//i.test(image)) checkLocalImage(image);
    } catch (err) {
      problems.push(`${seed.file}: ${err instanceof BlogWriteError ? err.message : (err as Error).message}`);
    }
  }
  if (problems.length) {
    console.error(`Nothing was written. Fix these first:\n- ${problems.join("\n- ")}`);
    process.exitCode = 1;
    return;
  }

  // 3. See what already exists, so images aren't uploaded for posts that will be skipped.
  await connectDB();
  console.log(`Database "${mongoose.connection.db!.databaseName}"${args.dryRun ? " (dry run: nothing will be written)" : ""}`);
  const slugs = seeds.map((seed) => String(seed.data.slug));
  const existing = new Set((await BlogModel.find({ slug: { $in: slugs } }).select("slug").lean()).map((d) => String(d.slug)));
  const toCreate = seeds.filter((seed) => !existing.has(String(seed.data.slug)));

  // 4. Resolve all images before touching the database.
  const prepared = [];
  for (const seed of toCreate) {
    const source = args.image ?? (typeof seed.data.image === "string" ? seed.data.image : "");
    const image = source ? await resolveImage(source, args.dryRun) : "";
    const ready = prepareBlog({ ...seed.data, image: standIn });
    ready.input.image = image;
    prepared.push({ seed, prepared: ready });
  }

  // 5. Insert.
  for (const { prepared: p } of prepared) {
    if (args.dryRun) {
      console.log(`would create  ${p.input.slug} (${p.input.status})`);
      continue;
    }
    await BlogModel.create({ ...p.input, wordCount: p.wordCount, readTime: p.readTime, publishedAt: p.input.status === "published" ? new Date() : undefined });
    console.log(`created       ${p.input.slug} (${p.input.status})`);
  }
  for (const slug of existing) console.log(`skipped       ${slug} (already exists)`);
  console.log(`\n${args.dryRun ? "Would create" : "Created"} ${prepared.length}, skipped ${existing.size}.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
