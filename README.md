# Hold'em Dojo

A personal trainer for Texas Hold'em cash games. It takes someone who knows the
rules but cannot yet price a decision, and over a year — fifteen to forty-five
minutes a day — makes them able to work out the right play in about five
seconds, from counting.

**Cash games only. Six to ten players. 100 big blinds.** No tournaments, no ICM,
no short stacks. Narrowing the world means every drill is a spot you will
actually face.

It runs entirely in your browser. There is no build step, no account, no server,
and no dependencies. Your progress lives in local storage and is never sent
anywhere.

## Getting it

**Offline, no install, nothing to run.** Download
[`dist/holdem-dojo.html`](dist/holdem-dojo.html) and double-click it. One file,
355 KB, opens in any browser. It makes zero network requests — verified by
`npm run verify:offline`, which loads it with the browser forced offline and
fails if anything reaches out. Once it is on your disk it works on a plane, and
it keeps working if this repository disappears.

**In a browser, via GitHub Pages.** Pushes publish the app automatically. Enable
it once under Settings → Pages → Source → GitHub Actions; after that it lives at
`https://<user>.github.io/poker/`.

**From source**, if you want to change it:

```bash
npm start              # http://localhost:8080
npm test               # 122 unit tests, no dependencies
npm run build          # regenerate the single-file build
npm run smoke          # 27 browser checks (needs playwright + a running server)
npm run verify:offline # prove the built file needs no network (9 checks)
```

The dev server exists only because ES modules will not load from `file://`;
`tools/serve.js` is sixty lines of Node with no dependencies. The app and the
unit tests need nothing installed. Playwright is required only for the two
browser checks.

---

## The idea

The odds charts and equity tools already exist, and they are unusable at the
table: far too complicated, and impossible to memorise. That is not a flaw in
you, it is a flaw in the format.

So this course never asks you to recall a number. It teaches you to *derive*
one, from counting, fast enough to use. Every number in poker turns out to be
either a count or a single division.

**Everything aims at five questions**, which are the only questions poker has:

> **Bet or check? Call or fold? Raise — and how much?**

Every level is one of those decisions. Each is answered the same way: work out
what each action is worth in big blinds, and take the biggest number. Folding is
always worth exactly zero, which is the baseline everything else is measured
against.

Three principles run through the whole thing.

**Break the decision, not the concept.** A beginner cannot answer "should you
call here?" But they can answer "how many cards have you not seen?" and then
"how many of those help you?" and then "what fraction is that?" and then "is
that bigger than the price?". Same decision, four questions, each one
answerable. That is the *step chain*, and it is the format most of the course is
built around.

**Count, do not calculate.** There is no algebra in this course. Pot odds are
"what share of the final pot is your own money?". Combinatorics is "there are
four aces, so six ways to pick two of them". Equity is "count the good cards,
divide by the cards you haven't seen". The maths is real, complete, and never
presented as a formula to apply.

**Derive the shortcut, then use it.** The rule of 2 and 4 appears in level 1,
lesson 8 — after four lessons of counting outs and dividing by 47 by hand. By
then you have effectively discovered it, and, crucially, you know where it
breaks (it runs several points high above about eight outs). A shortcut whose
error bounds you know is safe to use at speed. A shortcut you were handed is a
liability, because you cannot tell when it is lying to you.

---

## What a day looks like

Open it, press the button, and it assembles a session that fits your time
budget:

1. **Skills that have gone rusty**, first, while attention is freshest.
2. **One new lesson** — two or three short ideas, then drills that use them
   immediately.
3. **Extra practice** on your weakest skills, to fill whatever time is left.

You never choose what to review. The scheduler tracks 58 individual skills and
brings each one back just before you would have forgotten it. Get something
wrong and it returns tomorrow. Get it right repeatedly and it goes to three
days, then a week, then a month.

**Difficulty adapts.** Every drill is rated 2 to 5, and the app holds you near
75% accuracy — right often enough to stay motivated, wrong often enough to be
learning. Cruise through a session and the ceiling rises on its own. Being bored
is treated as a failure, not as success.

Every drill is generated fresh from a seed, so you never see the same hand
twice and cannot pattern-match an answer key. Because the generator has the
poker engine available, the explanation is computed from that exact hand — the
feedback is always true for what is actually on your screen, never a generic
paragraph.

---

## The year

| Days | Level | The decision it settles |
|---|---|---|
| 1–30 | What a Decision Is Worth | Put a number on any call, and know it beats folding |
| 31–90 | Call or Fold | Never call because the pot is big, or fold because the hand feels weak |
| 91–150 | Bet or Check | Know before acting whether betting beats checking, and by how much |
| 151–240 | How Much | Justify every bet size with a number, before and after the flop |
| 241–320 | Raise or Call | Know which is worth more with the same two cards, and how much to raise |
| 321–365 | The Full Table | Do all of it in five seconds, six to ten handed |

74 lessons, roughly 32 hours of material, spread deliberately thin. The gaps
between new lessons are not padding — repetition on those days is where a skill
actually consolidates.

**Day one starts at the maths.** There are no hand-ranking quizzes and no card
notation drills; the course assumes you know the rules. Those exist only as
warm-ups if you actually get something wrong.

Miss a fortnight and nothing is lost. The calendar is a promise about pace, not
a debt. Sessions resume from what you actually know.

---

## What is in here

```
src/engine/      the poker mathematics — no teaching, no UI
  decisions.js   EV of fold/check/call/bet/raise, and sizing ladders
  cards.js       card representation, seeded RNG
  evaluator.js   5-to-7 card hand evaluation, plain-English descriptions
  equity.js      exact enumeration from the flop, Monte Carlo preflop
  odds.js        pot odds, EV, MDF, implied odds — each returns its own derivation
  board.js       texture, draw detection, exact outs counting
  ranges.js      the 169-hand grid, range parsing, combinatorics
  preflop.js     reference ranges, each with the reasoning that generates it

src/learn/       the teaching layer
  skills.js      58 skills in a prerequisite graph
  exercises.js   51 procedural drill generators, difficulty-tiered
  drills-decisions.js  the bet/check/call/raise/fold drills
  curriculum/    74 authored lessons across 6 levels
  srs.js         spaced repetition, scheduling skills rather than flashcards
  plan.js        the 365-day map, and today's session
  progress.js    profile state, streaks, mastery

src/ui/          a dependency-free browser app
test/            122 unit tests
tools/           static server, Playwright smoke test
```

### The engine is separately correct

Everything the learner is graded against comes from a tested engine, not from
hardcoded answers. Equity is enumerated exactly from the flop onward — all 990
runouts on a flop, all 44 rivers on a turn — so the number you are marked
against is the true number.

Outs counting is exact against a specific opponent hand, and reports the cards
that *look* like outs but are not. That gap between the count a beginner
produces by eye and the real one is the single most useful correction available,
and showing it card by card is worth more than any amount of warning about it.

### The tests take the promises seriously

Beyond the usual unit tests, the suite simulates a learner doing a session every
day for a year and asserts the course actually completes with real mastery, and
a second learner who gets roughly half of everything wrong and still advances,
with weak skills recycled back into their sessions. Every one of the 51
generators is checked across 40 seeds for a question that is well formed,
solvable, and graded consistently with its own stated answer.

Three assertions guard the brief specifically: no rules-level drill may appear
anywhere on the path, the majority of lessons must touch one of the five
decisions, and no lesson may mention tournament play.

---

## Honest limitations

- **Ranges are simplified.** They are solver-adjacent, not solver output, and
  deliberately reconstructible from principles. This gets you to the point where
  real solver work would mean something.
- **The EV model stops at the current street.** It does not price the money you
  win on later streets, which means semi-bluffs are worth *more* than it says.
  The lessons state this rather than hiding it — a model whose limits you know
  is usable; a black box is not.
- **Fold frequencies are assumptions, not facts.** Drills state the villain's
  fold rate out loud, because the honest lesson is that EV depends on a read.
- **No hand-history import.** The sandbox lets you set up any spot by hand, but
  nothing reads your actual play.
- **Progress is per-browser** unless you export it. Progress → *Download backup
  file* gives you a JSON file you can restore anywhere.
- **It cannot make you play.** The study loop only works alongside real hands.
  Roughly three parts play to one part study.

---

## Extending it

Adding a drill type is one function in `src/learn/exercises.js` returning plain
data; the test suite will immediately check it across 40 seeds and the UI will
render it without changes. Adding lessons is plain objects in
`src/learn/curriculum/`, validated structurally on every test run. Neither
requires touching the scheduler.

MIT licensed.
