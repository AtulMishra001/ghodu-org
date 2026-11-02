import * as motion from "motion/react-client";
import ParallaxPhoto from "@/components/shared/ParallaxPhoto";
import { Reveal } from "@/components/shared/Reveal";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import type { HomeContent } from "@/data/home";

export default function OrderingSteps({ steps, image }: { steps: HomeContent["steps"]; image: HomeContent["stepsImage"] }) {
  return (
    <Section id="ordering">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div className="flex flex-col">
          <SectionHeader index="04" kicker="How ordering works" title="Three steps from enquiry to dispatch" />
          <ol className="relative mt-6 flex flex-col">
            {/* the line draws itself as the steps come into view */}
            <motion.span
              aria-hidden
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-5 bottom-5 left-5 w-px origin-top bg-primary/30"
            />
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <Reveal delay={i * 0.12} className="flex gap-4 pb-6 last:pb-0">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-background font-display text-lg font-medium text-primary tabular">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-[15px] text-muted-foreground">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative hidden min-h-[420px] overflow-hidden rounded-card md:block">
          <ParallaxPhoto photo={image} sizes="(min-width: 1024px) 50vw, 100vw" />
          <p className="absolute bottom-3 left-4 rounded-md bg-inverse/60 px-2 py-0.5 text-xs text-inverse-foreground backdrop-blur-sm">
            Apple orchard, Aragam
          </p>
        </div>
      </div>
    </Section>
  );
}
