# Chinese poker terminology

The first Chinese version of this app was translated word by word from English.
It was grammatical and it was wrong: it described concepts that the Chinese
poker community already has established names for. A learner reading it would
not have recognised the vocabulary used at a real table or in any Chinese
strategy discussion, which defeats the purpose of translating at all.

This file records what was checked and what remains a judgement call, so the
terminology can be argued with rather than trusted blindly.

## Verified against Chinese poker glossaries

| English | Chinese | Note |
|---|---|---|
| outs | 补牌 | Also written as "outs" directly in Chinese text |
| flush draw | 同花听牌 | |
| open-ended straight draw | 两头顺听牌 | |
| gutshot | 卡顺 | Not 内侧顺子听牌, which is a description, not a term |
| bluff | 诈唬 | |
| semi-bluff | 半诈唬 | |
| value bet | 价值下注 | |
| continuation bet | 持续下注 | Often just "C-bet" |
| blocker | 阻断牌 | |
| pot odds | 底池赔率 | |
| pot | 底池 | |
| rule of 2 and 4 | 二四法则 | This has a real Chinese name — the first version invented a description instead |
| under the gun | 枪口位 (UTG) | Literally "at gunpoint" |
| cutoff | 关煞位 (CO) | |
| button | 按钮位 (BTN) | |
| hijack | 劫持位 (HJ) | |
| lojack | 劫机位 (LJ) | |
| middle position | 中位 (MP) | |
| preflop / flop / turn / river | 翻牌前 / 翻牌圈 / 转牌 / 河牌 | |

Sources consulted: Chinese poker glossaries at legendpoker.cn, dpskill.com,
dpgod.com and gtopuke.com, plus 知乎 and 豆瓣 terminology posts. Several of
these domains are unreachable from this environment, so terms were taken from
search result summaries rather than fetched pages.

## Corrections made

- **德州扑克道场 → 德扑训练营.** 道场 is a Japanese word (dojo). Chinese players
  say 德扑 colloquially, and 训练营 is the natural word for a training course.
- **二四法则** now used by name, instead of describing "multiply by two or four".
- **Positions** now use 枪口位 / 关煞位 / 按钮位 with the English abbreviation in
  brackets, instead of leaving bare English or inventing descriptions.
- **抓诈唬牌** for bluff-catcher, 跟注站 for calling station, 暗三条 for a set.

## Deliberate choices

**English is kept in brackets on first use.** 底池赔率（pot odds）, 补牌（outs）.
This is not clutter. Chinese players mix English constantly — "这里 pot odds
不够" is ordinary table speech — and every training video, solver and forum is in
English. A learner who only knows the Chinese is stranded the moment they leave
this app.

**胜率 for equity** is a compromise. 胜率 more precisely means win rate, and
equity is often left untranslated in Chinese discussion. 胜率 was chosen because
it is immediately comprehensible to a beginner, with the English shown alongside.

## Still to do

The drill text — question prompts, hints and explanations — is still English.
It is generated at runtime with numbers interpolated, so translating it means
restructuring the generators rather than adding a table entry.
