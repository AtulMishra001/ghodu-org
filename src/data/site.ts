// Site-wide facts. Everything marked TODO must come from Ghodu Agro —
// never fill these with placeholder numbers or addresses.
export const site = {
  name: "Ghodu Agro",
  shortName: "Ghodu",
  tagline: "higher Standards",
  description:
    "Ghodu Agro supplies agricultural produce from Kashmir to businesses — saffron, walnuts, almonds, apples and more, in bulk.",
  // TODO: real contact details. While these are null, the enquiry sheet
  // and contact actions fall back gracefully instead of showing fake numbers.
  phone: null as string | null, // e.g. "+91 …"
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || null) as string | null, // digits only, with country code, e.g. "91XXXXXXXXXX"
  email: null as string | null,
  address: null as string | null,
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about-us", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
