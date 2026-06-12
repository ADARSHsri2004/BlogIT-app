import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { AnimatedLinkButton } from '../components/animate-ui/button';

const showcaseSlides = [
  {
    id: 'compose',
    image: '/one.png',
    alt: 'BlogIT focused writing editor'
  },
  {
    id: 'publish',
    image: '/two.png',
    alt: 'BlogIT publishing workflow'
  },
  {
    id: 'grow',
    image: '/three.png',
    alt: 'BlogIT insights workspace'
  }
];

const showcaseAnimationDuration = 3;
const showcaseRestDuration = (showcaseSlides.length - 1) * showcaseAnimationDuration;

const workflow = [
  {
    step: '01',
    title: 'Capture the first version',
    copy: 'Start with a draft that stays readable while you think out loud and shape the story.'
  },
  {
    step: '02',
    title: 'Refine the structure',
    copy: 'Tighten headings, adjust pacing, and keep the piece flowing before you hit publish.'
  },
  {
    step: '03',
    title: 'Share and return',
    copy: 'Publish when it feels ready, then revisit drafts and published work from one place.'
  }
];

const supportPanels = [
  {
    title: 'Reader-friendly publishing',
    copy: 'Keep articles clean on the page with visuals and structure that feel polished from the start.',
    image: 'four.png'
  },
  {
    title: 'A workspace built for makers',
    copy: 'Draft, format, and ship from one place without losing sight of what the piece needs next.',
    image: 'five.png'
  }
];

const communityCards = [
  {
    title: 'Clear workflow',
    copy: 'Move from rough idea to finished post with drafts, previews, and publishing steps kept close together.'
  },
  {
    title: 'Fast publishing',
    copy: 'Keep the path to publish short, so edits, formatting, and final review do not slow the writing down.'
  },
  {
    title: 'Better continuity',
    copy: 'Return to older ideas, active drafts, and published work without rebuilding context every time.'
  }
];

const LandingPage = () => {
  const [openCommunityCard, setOpenCommunityCard] = useState(0);

  return (
    <MainLayout>
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 px-5 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950 sm:px-7 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,0.98fr)] xl:gap-8">
          <div className="max-w-xl xl:max-w-2xl">
            <motion.h1
              className="mt-4 max-w-[10.5ch] font-serif text-[2.65rem] font-semibold leading-[0.98] text-ink dark:text-slate-100 sm:text-[3.2rem] lg:text-[4rem] xl:text-[4.45rem]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              Publish sharper stories without slowing down your thinking.
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55, ease: 'easeOut' }}
            >
              BlogIT gives writers a focused place to draft, refine, and share work with a reading experience that
              stays calm, clear, and easy to return to.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5, ease: 'easeOut' }}
            >
              <AnimatedLinkButton to="/write" size="lg">
                Start a draft
              </AnimatedLinkButton>
              <AnimatedLinkButton
                to="/feed"
                variant="secondary"
                size="lg"
              >
                Explore published work
              </AnimatedLinkButton>
            </motion.div>
          </div>

          <div className="relative min-h-[360px] min-w-0 overflow-hidden py-2 sm:min-h-[430px] lg:min-h-[500px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 sm:w-24" />
            {showcaseSlides.map((item, index) => (
              <motion.div
                key={item.id}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, x: '-64%', scale: 0.78 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: ['-64%', '0%', '0%', '64%'],
                  scale: [0.78, 1.08, 1, 0.84],
                  rotate: [-2, 1, 0, 2]
                }}
                transition={{
                  delay: index * showcaseAnimationDuration,
                  duration: showcaseAnimationDuration,
                  ease: ['easeOut', 'backOut', 'easeIn'],
                  repeat: Infinity,
                  repeatDelay: showcaseRestDuration,
                  times: [0, 0.42, 0.72, 1]
                }}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="max-h-[360px] max-w-[280px] object-contain drop-shadow-[0_30px_70px_rgba(15,23,42,0.2)] sm:max-h-[430px] sm:max-w-[340px] lg:max-h-[500px] lg:max-w-[390px]"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.78fr)] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Workflow</p>
          <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight text-ink dark:text-slate-100 sm:text-[2.35rem]">
            A writing setup that stays useful from the first line to the final revision.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The experience is built to keep you oriented. Drafts stay accessible, published pieces stay clean, and the
            interface keeps your attention on the writing itself.
          </p>
          <div className="mt-6 space-y-3">
            {workflow.map((item, index) => (
              <motion.div
                key={item.step}
                className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-[68px_minmax(0,1fr)]"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.07, duration: 0.45 }}
              >
                <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">{item.step}</div>
                <div>
                  <h3 className="text-base font-semibold text-ink dark:text-slate-100 sm:text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <div className="relative flex min-h-[360px] items-center justify-center px-5 py-6 sm:min-h-[430px]">
            <img
              src="/four.png"
              alt="BlogIT publishing workspace"
              className="max-h-[320px] w-full max-w-[430px] object-contain drop-shadow-[0_26px_58px_rgba(15,23,42,0.18)] sm:max-h-[390px]"
            />
          </div>
        </motion.div>
      </section>

      <section className="mt-12">
        <div className="grid items-center gap-7 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950 sm:p-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(340px,0.9fr)] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">More to Explore</p>
            <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight text-ink dark:text-slate-100 sm:text-[2.35rem]">
              Dedicated spaces for the people, posts, and momentum around your writing.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              These sections highlight the human side of the product too: the maker&apos;s workspace and the social
              shape of publishing once your stories are out in the world.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-base font-semibold text-ink dark:text-slate-100 sm:text-lg">{supportPanels[0].title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{supportPanels[0].copy}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                <h3 className="text-base font-semibold text-ink dark:text-slate-100 sm:text-lg">{supportPanels[1].title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{supportPanels[1].copy}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-center p-4"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
          >
            <img
              src={supportPanels[0].image}
              alt={supportPanels[0].title}
              className="w-full max-w-[410px] object-contain drop-shadow-[0_26px_52px_rgba(15,23,42,0.14)] lg:max-w-[430px]"
            />
          </motion.div>
        </div>

        <div className="mt-6 grid items-center gap-7 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950 sm:p-7 lg:grid-cols-[minmax(280px,0.82fr)_minmax(340px,0.9fr)] lg:gap-8">
          <motion.div
            className="self-start"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Community Layer</p>
            <h2 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight text-ink dark:text-slate-100 sm:text-[2.35rem]">
              {supportPanels[1].title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">{supportPanels[1].copy}</p>
            <div className="mt-6 max-w-xl space-y-3">
              {communityCards.map((item, index) => {
                const isOpen = openCommunityCard === index;

                return (
                  <motion.div
                    key={item.title}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      onClick={() => setOpenCommunityCard(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold text-ink dark:text-slate-100">{item.title}</span>
                      <motion.span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm dark:bg-slate-950"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26, ease: 'easeOut' }}
                        >
                          <p className="px-5 pb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.06, duration: 0.45 }}
            whileHover={{ y: -4 }}
          >
            <img
              src={supportPanels[1].image}
              alt={supportPanels[1].title}
              className="w-full max-w-[410px] object-contain drop-shadow-[0_26px_52px_rgba(15,23,42,0.14)] lg:max-w-[430px]"
            />
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
