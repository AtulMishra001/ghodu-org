import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { CountUp } from "@/components/shared/CountUp";
import ParallaxPhoto from "@/components/shared/ParallaxPhoto";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { HomeContent } from "@/data/home";

export default function OriginStory({ origin }: Pick<HomeContent, "origin">) {
  return (
    <Section id="origin">
      <div className="grid overflow-hidden rounded-card bg-inverse text-inverse-foreground lg:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-64 md:min-h-96 lg:min-h-[560px]">
          <ParallaxPhoto photo={origin.image} sizes="(min-width: 1024px) 52vw, 100vw" />
          <div className="absolute inset-0 bg-linear-to-t from-inverse/70 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-inverse/40" />
          <p className="absolute bottom-3 left-4 text-xs text-inverse-foreground/80">Saffron in flower, Pampore</p>
        </div>

        <div className="flex flex-col justify-center p-5 md:p-10">
          <SectionHeader index="03" kicker="Origin" title={origin.title} summary={origin.summary} inverse />

          <ul className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {origin.facts.map((fact, i) => (
              <li key={fact.label}>
                <Reveal delay={i * 0.08} className="h-full border-t border-inverse-foreground/20 pt-4">
                  <p className="font-display text-[40px] leading-none font-medium text-accent xl:text-[48px]">
                    <CountUp to={fact.value} suffix={fact.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-inverse-foreground/75">{fact.label}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-start gap-2 text-sm text-inverse-foreground/85">
            <SealCheckIcon size={20} weight="duotone" className="shrink-0 text-accent" />
            {origin.note}
          </p>
        </div>
      </div>
    </Section>
  );
}
