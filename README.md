# Hold'em Dojo

A learning system that takes a Texas Hold'em beginner to genuine competence over
a year, fifteen to forty-five minutes a day, without books and without
memorising odds tables.

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
npm test               # 83 unit tests, no dependencies
npm run build          # regenerate the single-file build
npm run smoke          # 27 browser checks (needs playwright + a running server)
npm run verify:offline # prove the built file needs no network
```

The dev server exists only because ES modules will not load from `file://`;
`tools/serve.js` is sixty lines of Node with no dependencies. The app and the
unit tests need nothing installed. Playwright is required only for the two
browser checks.

---

## The idea

Most poker teaching hands you a chart and tells you to memorise it. That works
until the situation differs slightly from the chart, at which point you have
nothing, because you never learned what generated it.

This does the opposite. Every number is derived by counting, and every shortcut
is withheld until you have worked it out the long way often enough that the
shortcut feels like something you noticed rather than something you were told.

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

**Derive the shortcut, then use it.** The rule of 2 and 4 appears in level 2,
lesson 5 — after four lessons of counting outs and dividing by 47 by hand. By
then a learner has effectively discovered it, and, crucially, they know where it
breaks. A shortcut you understand the error bounds of is safe to use at speed. A
shortcut you were handed is not.

---

## What a day looks like

Open it, press the button, and it assembles a session that fits your time
budget:

1. **Skills that have gone rusty**, first, while attention is freshest.
2. **One new lesson** — two or three short ideas, then drills that use them
   immediately.
3. **Extra practice** on your weakest skills, to fill whatever time is left.

You never choose what to review. The scheduler tracks 48 individual skills and
brings each one back just before you would have forgotten it. Get something
wrong and it returns tomorrow. Get it right repeatedly and it goes to three
days, then a week, then a month.

Every drill is generated fresh from a seed, so you never see the same hand
twice and cannot pattern-match an answer key. Because the generator has the
poker engine available, the explanation is computed from that exact hand — the
feedback is always true for what is actually on your screen, never a generic
paragraph.

---

## The year

| Days | Level | What you can do by the end |
|---|---|---|
| 1–30 | Foundations | Name any hand instantly, find the nuts, read a board, know why position matters |
| 31–90 | The Maths | Count outs honestly, price any bet in seconds, compute EV, separate decisions from results |
| 91–150 | Before the Flop | Rebuild every opening chart from principles, defend the big blind correctly, 3-bet with a plan |
| 151–240 | After the Flop | Bet with a reason and a size, defend at the right frequency, extract value on rivers |
| 241–320 | The Opponent | Classify a player in an orbit, name the exploit, read ranges through three streets |
| 321–365 | Independence | Run your own study loop and no longer need this |

114 lessons, roughly 51 hours of material, spread deliberately thin. The gaps
between new lessons are not padding — repetition on those days is where a skill
actually consolidates.

Miss a fortnight and nothing is lost. The calendar is a promise about pace, not
a debt. Sessions resume from what you actually know.

---

## What is in here

```
src/engine/      the poker mathematics — no teaching, no UI
  cards.js       card representation, seeded RNG
  evaluator.js   5-to-7 card hand evaluation, plain-English descriptions
  equity.js      exact enumeration from the flop, Monte Carlo preflop
  odds.js        pot odds, EV, MDF, implied odds — each returns its own derivation
  board.js       texture, draw detection, exact outs counting
  ranges.js      the 169-hand grid, range parsing, combinatorics
  preflop.js     reference ranges, each with the reasoning that generates it

src/learn/       the teaching layer
  skills.js      48 skills in a prerequisite graph
  exercises.js   35 procedural drill generators
  curriculum/    114 authored lessons across 6 levels
  srs.js         spaced repetition, scheduling skills rather than flashcards
  plan.js        the 365-day map, and today's session
  progress.js    profile state, streaks, mastery

src/ui/          a dependency-free browser app
test/            83 unit tests
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
with weak skills recycled back into their sessions. Every one of the 35
generators is checked across 40 seeds for a question that is well formed,
solvable, and graded consistently with its own stated answer.

---

## Honest limitations

- **Ranges are simplified.** They are solver-adjacent, not solver output, and
  they are deliberately reconstructible from principles. A serious tournament
  player needs proper solver work; this gets you to the point where solver work
  would mean something.
- **6-max cash, 100 big blinds.** Tournaments, ICM, and full-ring are barely
  touched.
- **No hand-history import.** The sandbox lets you set up any spot by hand, but
  nothing reads your actual play.
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
