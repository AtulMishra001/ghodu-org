import type { StaticImageData } from "next/image";
import almonds from "@/assets/photos/almonds.jpg";
import apples from "@/assets/photos/apples.jpg";
import cherries from "@/assets/photos/cherries.jpg";
import chilli from "@/assets/photos/kashmiri-chilli.jpg";
import orchard from "@/assets/photos/orchard-aragam.jpg";
import pears from "@/assets/photos/pears.jpg";
import saffronField from "@/assets/photos/saffron-field-pampore.jpg";
import saffron from "@/assets/photos/saffron.jpg";
import valley from "@/assets/photos/valley-pahalgam.jpg";
import walnuts from "@/assets/photos/walnuts.jpg";

export type PhotoCredit = { author: string; license: string; url: string };

// A bundled photo (StaticImageData) or an uploaded one (Cloudinary URL).
export type Photo = {
  src: StaticImageData | string;
  alt: string;
  /** Tiny base64 preview for uploaded photos; bundled photos make their own. */
  blurDataURL?: string;
  credit?: PhotoCredit;
};

// Stock photography from Wikimedia Commons (free licences that require a credit;
// the footer lists them). TODO: swap for Ghodu Agro's own photos when available.
export const photos = {
  orchard: {
    src: orchard,
    alt: "An apple orchard in Aragam, Kashmir, with snow-capped mountains in the distance",
    credit: { author: "Revoshots", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Apple_Orchard_in_Aragam.jpg" },
  },
  valley: {
    src: valley,
    alt: "The Pahalgam valley: a river winding between pine-covered slopes",
    credit: { author: "KennyOMG", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Pahalgam_Valley.jpg" },
  },
  saffronField: {
    src: saffronField,
    alt: "Purple saffron crocuses flowering in a field at Pampore, Kashmir",
    credit: { author: "Umarsami", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Saffron_From_Pampore.jpg" },
  },
  saffron: {
    src: saffron,
    alt: "Close-up of saffron flowers with their red stigmas",
    credit: { author: "Yasir Yousuf Ahanger", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Bunch_of_blooming_saffron_flowers.jpg" },
  },
  chilli: {
    src: chilli,
    alt: "A heap of dried Kashmiri red chillies",
    credit: { author: "Inu06", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Kashmiri_Red_Chilies.jpg" },
  },
  walnuts: {
    src: walnuts,
    alt: "Light-coloured walnut kernels piled together",
    credit: { author: "FADIND SOUL", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Walnut_kernels.jpg" },
  },
  almonds: {
    src: almonds,
    alt: "Almonds in the shell, cracked open, shelled and blanched",
    credit: { author: "Ivar Leidus", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Almonds_-_in_shell,_shell_cracked_open,_shelled,_blanched.jpg" },
  },
  apples: {
    src: apples,
    alt: "Red apples ripening on a tree in a Kashmir orchard",
    credit: { author: "Auli Raha", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Apple_Garden_in_Kashmir,_India.jpg" },
  },
  pears: {
    src: pears,
    alt: "Four pears in a row, from green to russet",
    credit: { author: "Rhododendrites", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Four_pears.jpg" },
  },
  cherries: {
    src: cherries,
    alt: "A wicker basket full of dark red sweet cherries on grass",
    credit: { author: "George Chernilevsky", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Sweet_cherries_in_basket_2018_G1.jpg" },
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Credits for the footer: the site's own stock photos plus any credited product photos. */
export function photoCredits(products: { image: Photo }[]) {
  const all = [...Object.values(photos), ...products.map((p) => p.image)];
  const seen = new Set<string>();
  return all.filter((p): p is Photo & { credit: PhotoCredit } => {
    if (!p.credit || seen.has(p.credit.url)) return false;
    seen.add(p.credit.url);
    return true;
  });
}
