import Image from "next/image";
import logo from "../../../public/ghodu-logo.webp";

export default function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={logo}
      alt="Ghodu Agro — higher Standards"
      sizes="(min-width: 1280px) 180px, (min-width: 768px) 160px, 112px"
      className={className ?? "h-9 w-auto md:h-12 xl:h-14"}
      {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
    />
  );
}
