# Blog seed files

`npm run seed:blogs` reads every `blog-*.json` file in this folder and adds the posts to MongoDB. It only inserts: a slug that already exists is skipped and never changed.

Copy `example.blog.json` to `blog-your-post.json` to start one. Its content is sample text, so replace all of it. Fields match the admin form. `image` is an https URL or a path to a local `.webp` file. A draft can leave it out and get its image in the admin; a published post can't.

```
npm run seed:blogs -- --dry-run                   # validate only, write nothing
npm run seed:blogs                                # add all posts
npm run seed:blogs -- --draft                     # add them as drafts
npm run seed:blogs -- my-post-slug                # only this post
npm run seed:blogs -- my-post-slug --image ./hero.webp
```
