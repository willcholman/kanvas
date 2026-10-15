import { Reveal } from "../Reveal";
import { icons } from "./FeatureIcons";

const FEATURES = [
  { icon: icons.log, title: "Log every session.", body: "Discipline, time, gym, notes, and photos in seconds.", span: "md:col-span-2" },
  { icon: icons.progress, title: "See your progress.", body: "Weekly time on the mats and trends over months.", span: "" },
  { icon: icons.friends, title: "Train with your friends.", body: "A feed of your teammates' sessions, with likes and comments.", span: "" },
  { icon: icons.gym, title: "Join your gym.", body: "Find your gym and train alongside your team on Kanvas.", span: "" },
  { icon: icons.badges, title: "Earn badges.", body: "Milestones and a trophy case for the work you put in.", span: "" },
  { icon: icons.share, title: "Share to your Story.", body: "One tap turns any session into an Instagram Story with your stats.", span: "md:col-span-2 lg:col-span-3" },
];

export function Features() {
  return (
    <section id="what-you-get" aria-labelledby="features-title" className="relative isolate scroll-mt-24 px-5 py-28 sm:py-36">
      <div className="mx-auto max-w-[1120px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <h2 id="features-title" className="t-h2">
            Built for how you train.
          </h2>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={(i % 3) * 0.08} className={`${f.span}`}>
              <div className="glass flex h-full flex-col rounded-[24px] p-7 sm:p-8">
                <span className="grid size-11 place-items-center rounded-full border border-ink/10 bg-white/70 text-ink">
                  {f.icon}
                </span>
                <h3 className="t-h3 mt-10 sm:mt-14">{f.title}</h3>
                <p className="t-body mt-2 max-w-[42ch] text-ash">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
