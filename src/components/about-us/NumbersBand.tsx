import { CountUp } from "@/components/shared/CountUp";
import ParallaxPhoto from "@/components/shared/ParallaxPhoto";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { AboutContent } from "@/data/about";

export default function NumbersBand({ numbers }: Pick<AboutContent, "numbers">) {
  return (
    <Section id="numbers">
      <div className="relative isolate overflow-hidden rounded-card bg-inverse p-5 text-inverse-foreground md:p-10">
        <ParallaxPhoto photo={numbers.image} sizes="100vw" className="-z-20" />
        <div className="absolute inset-0 -z-10 bg-inverse/80" />
        <SectionHeader index="05" kicker="In numbers" title={numbers.title} inverse />
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 md:mt-10 lg:grid-cols-4 lg:gap-10">
          {numbers.stats.map((stat, i) => (
            <li key={stat.label}>
              <Reveal delay={i * 0.08} className="h-full border-t border-inverse-foreground/25 pt-4">
                <p className="font-display text-[44px] leading-none font-medium text-accent md:text-[64px] xl:text-[80px]">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-inverse-foreground/80 md:text-base">{stat.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
