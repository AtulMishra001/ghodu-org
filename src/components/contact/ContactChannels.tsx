import type { Icon } from "@phosphor-icons/react";
import { EnvelopeSimpleIcon, MapPinIcon, PhoneIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import type { ContactChannel, ContactContent } from "@/data/contact";

const icons: Record<ContactChannel["kind"], Icon> = {
  whatsapp: WhatsappLogoIcon,
  phone: PhoneIcon,
  email: EnvelopeSimpleIcon,
  address: MapPinIcon,
};

// Direct ways to reach us. Renders nothing until real details exist in site.ts.
export default function ContactChannels({ channels }: Pick<ContactContent, "channels">) {
  if (channels.length === 0) return null;

  return (
    <Section id="reach-us">
      <ul className="grid gap-2 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {channels.map((channel, i) => {
          const ChannelIcon = icons[channel.kind];
          const body = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-surface-muted text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <ChannelIcon size={22} weight="duotone" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{channel.label}</span>
                <span className="mt-0.5 block break-words font-semibold">{channel.value}</span>
              </span>
            </>
          );
          return (
            <li key={channel.kind}>
              <Reveal delay={i * 0.06} className="h-full">
                {channel.href ? (
                  <a
                    href={channel.href}
                    target={channel.kind === "whatsapp" ? "_blank" : undefined}
                    rel={channel.kind === "whatsapp" ? "noreferrer" : undefined}
                    className="group flex h-full items-center gap-3 rounded-card border bg-surface p-4 transition-[border-color,transform] duration-200 hover:border-foreground/40 active:scale-[0.98]"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="group flex h-full items-center gap-3 rounded-card border bg-surface p-4">{body}</div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
