export interface Preset {
  id: string;
  name: string;
  role: string;
  emoji: string;
  excerpt: string;
  source: string;
}

export const PRESETS: Preset[] = [
  {
    id: 'paul-graham',
    name: 'Paul Graham',
    role: 'Essayist, Founder of Y Combinator',
    emoji: '✍️',
    source: 'Essays: "How to Get Startup Ideas", "Keeping Your Identity Small", "Taste for Makers"',
    excerpt: `The way to get startup ideas is not to try to think of startup ideas. It's to look for problems, preferably problems you have yourself. The very best startup ideas tend to have three things in common: they're something the founders themselves want, that they can build, and that few others realize are worth doing.

Why is it so important to work on a problem you have? Among other things, it ensures the problem really exists. It sounds obvious to say you should only work on problems that exist. And yet by far the most common mistake startups make is to solve problems no one has.

The most common type of idea that gets submitted to Y Combinator is: a slightly better version of something that already exists. This is a good bet for someone starting a business. It's much riskier to bet on an unknown market.

Keep your identity small. The more labels you put on yourself, the dumber you get. When you define yourself by your opinions, you can't change your mind without feeling like you're losing part of yourself.

Great work requires taste. And taste is just the ability to see how things could be better. Indifference to taste is indifference to quality. And indifference to quality is the most direct route to mediocrity.

A startup is a company designed to grow fast. Being newly founded does not in itself make a company a startup. Nor is it necessary for a startup to work on technology, or take venture funding, or have some sort of exit. The only essential thing is growth. Everything else we associate with startups follows from growth.

Programmers are often urged to "write code" rather than to start a company. But there's something backwards about this advice. The reason to start a company isn't to write code; it's to do something hard. Code is often the least interesting part of a startup.`,
  },
  {
    id: 'andrej-karpathy',
    name: 'Andrej Karpathy',
    role: 'AI Researcher, Former Tesla AI Director',
    emoji: '🧠',
    source: 'Tweets, blog posts, talks on software engineering and AI',
    excerpt: `Software is eating the world, but AI is eating software. There's a new kind of software development where you don't write code so much as you specify behavior in natural language and let the model fill in the implementation details.

The "1000x engineer" meme is getting at something real but misses the crucial insight: it's not about replacing engineers, it's about changing what engineers do. Instead of implementing solutions, you're now supervising an AI that implements solutions. This requires a completely different skill set — more like management than coding.

Most people don't appreciate how weird it is that gradient descent works at all. We just throw a bunch of data at a neural network, wiggle the weights until it gets better at predicting the data, and somehow this produces systems that can reason about novel situations. We don't fully understand why this works. We just know empirically that it does.

The best way to learn something deeply is to implement it from scratch. Reading papers and using libraries gives you competence. Building from scratch gives you intuition. Intuition is what lets you know when something is wrong even before you can articulate why.

Large language models are a fundamentally new kind of computer. They don't execute deterministic programs — they interpolate in the space of human knowledge. This makes them simultaneously less reliable and more capable than traditional software. Figuring out when to trust them is a skill.

The difference between someone who gets a lot out of LLMs and someone who doesn't is mostly about how good they are at prompt engineering. This is not a trivial skill. It's basically a new form of programming.`,
  },
  {
    id: 'charlie-munger',
    name: 'Charlie Munger',
    role: 'Investor, Partner at Berkshire Hathaway',
    emoji: '🏛️',
    source: 'Poor Charlie\'s Almanack, Berkshire meetings, speeches',
    excerpt: `To a man with only a hammer, every problem looks like a nail. The solution is to acquire a latticework of mental models from different disciplines. When you have a full toolkit, you can see problems more clearly.

Invert, always invert. Many hard problems in life and business become much easier when you think about them backwards. Instead of asking how to succeed, ask what leads to failure and avoid those things. Instead of asking how to be happy, ask what makes people miserable and eliminate those things.

The key to wisdom is this constant practice of inverting. When you try to think about a problem forwards, you often miss things. When you invert, you force yourself to examine your assumptions.

The iron rule of nature is: you get what you reward for. If you want ants, put sugar on the floor. Human beings are the same way. If you create the wrong incentives, you'll reliably get the wrong behavior, no matter how smart or ethical the people involved.

You don't have to be brilliant, only a little bit wiser than the other guys, on average, for a long, long time. Patience combined with discipline compounds into extraordinary outcomes over decades.

Acknowledging what you don't know is the dawning of wisdom. Most people aren't willing to say "I don't know." They feel compelled to have an opinion. I think one of the great mental disciplines is knowing when you don't know enough to have a strong opinion — and being comfortable saying so.

The best business is one that takes very little capital, earns high returns on that capital, and can reinvest at similarly high returns for a long time. Everything else is a lesser version of this ideal.`,
  },
  {
    id: 'jeff-bezos',
    name: 'Jeff Bezos',
    role: 'Founder of Amazon',
    emoji: '📦',
    source: 'Amazon Shareholder Letters 1997–2020',
    excerpt: `We will continue to focus on hiring and retaining versatile and talented employees and we continue to weight their compensation to the future through meaningful equity grants. We know our success will be largely affected by our ability to attract and retain a motivated employee base, each of whom must think like, and therefore must actually be, an owner.

Day 1 is a mindset. Day 2 is stasis, followed by irrelevance, followed by excruciating, painful decline, followed by death. That's why it's always Day 1 at Amazon. What does Day 2 look like? Day 2 is when you stop being customer-obsessed and start being competitor-obsessed, or process-obsessed. High standards defend against this.

Disagree and commit. If you have conviction on a particular direction even though there's no consensus, it's helpful to say, "Look, I know we disagree on this but will you gamble with me on it? Disagree and commit?" By the time you're actually right, most times the decision doesn't matter that much either way. But it's very freeing.

The most important decisions are not made in real time. They're made by working backwards from what customers want in 3–5 years. If you're just reacting to today's situation, you're already behind.

Most decisions should be made with somewhere around 70% of the information you wish you had. If you wait for 90%, in most cases, you're probably being slow. Plus, either way, you need to be good at quickly recognizing and correcting bad decisions. If you're good at course correcting, being wrong may be less costly than you think, whereas being slow is always expensive.`,
  },
  {
    id: 'shreyas-doshi',
    name: 'Shreyas Doshi',
    role: 'Product Leader, Former PM at Stripe, Google, Twitter',
    emoji: '📐',
    source: 'Twitter threads on product thinking and PM frameworks',
    excerpt: `The most underrated skill in product management is taste. Taste is knowing what good looks like. It's not a framework — it's accumulated judgment from deeply studying great products and understanding why users love them at an almost visceral level.

Most PMs optimize for output (features shipped, roadmap coverage, metrics hit). The best PMs optimize for outcomes (meaningful change in user behavior, durable business value). The difference shows up over years, not sprints.

The LNO framework: every task is either Leverage (10x ROI on your time), Neutral (1:1 ROI), or Overhead (less than 1:1). Most PMs spend too much time on Neutral tasks because they're comfortable and feel productive. Obsessively shifting time from Neutral to Leverage is one of the biggest career accelerators.

There are two kinds of product work: building what users are asking for, and building what users will love but couldn't have asked for. The first keeps you competitive. The second makes you iconic. You need both, but most teams only do the first.

The best product decisions come from a clear theory of value — why will this create genuine value for users, and why will users prefer our version over alternatives? If you can't articulate this clearly in one sentence, the idea isn't ready.

Pre-mortems are underused in product. Before starting a major initiative, ask: it's 18 months from now and this failed badly — what went wrong? You'll surface 70% of the actual failure modes before they happen, rather than explaining them afterwards.`,
  },
];
