/**
 * Chinese poker terminology.
 *
 * The first Chinese version of this app was translated word by word from the
 * English, which produced text that was grammatical and wrong: it used
 * descriptions where the Chinese poker community has actual established terms.
 * A learner reading it would not recognise the vocabulary used on a real table
 * or in any Chinese strategy discussion.
 *
 * So this file is the authority, and every Chinese string in the app draws from
 * it. Terms were checked against Chinese poker glossaries rather than invented
 * — see docs/TERMINOLOGY.md for what was verified and what remains a judgement
 * call.
 *
 * Two rules:
 *
 * 1. Where the community has a term, use it. 枪口位, not "前面的位置". 二四法则,
 *    not "乘二乘四的规则". 卡顺, not "内侧顺子听牌".
 *
 * 2. Keep the English alongside on first use in a screen. Chinese players mix
 *    English constantly — "我有 flush draw", "这里 pot odds 不够" — and every
 *    training video and forum uses it. A learner who only knows the Chinese is
 *    stranded outside this app.
 */

export const TERMS = {
  // --- Streets 街 ---
  preflop: { zh: '翻牌前', en: 'preflop' },
  flop: { zh: '翻牌圈', en: 'flop' },
  turn: { zh: '转牌', en: 'turn' },
  river: { zh: '河牌', en: 'river' },
  showdown: { zh: '摊牌', en: 'showdown' },

  // --- Actions 动作 ---
  fold: { zh: '弃牌', en: 'fold' },
  check: { zh: '过牌', en: 'check' },
  call: { zh: '跟注', en: 'call' },
  bet: { zh: '下注', en: 'bet' },
  raise: { zh: '加注', en: 'raise' },
  threeBet: { zh: '再加注', en: '3-bet' },
  allIn: { zh: '全下', en: 'all-in' },
  cbet: { zh: '持续下注', en: 'c-bet' },
  checkRaise: { zh: '过牌加注', en: 'check-raise' },

  // --- Positions 位置 ---
  // Chinese has vivid established names for these, and the English abbreviation
  // is what people actually say out loud, so both are kept.
  utg: { zh: '枪口位', en: 'UTG' },
  mp: { zh: '中位', en: 'MP' },
  lj: { zh: '劫机位', en: 'LJ' },
  hj: { zh: '劫持位', en: 'HJ' },
  co: { zh: '关煞位', en: 'CO' },
  btn: { zh: '按钮位', en: 'BTN' },
  sb: { zh: '小盲位', en: 'SB' },
  bb: { zh: '大盲位', en: 'BB' },
  position: { zh: '位置', en: 'position' },
  inPosition: { zh: '有位置', en: 'in position' },
  outOfPosition: { zh: '没位置', en: 'out of position' },

  // --- Money 筹码 ---
  pot: { zh: '底池', en: 'pot' },
  bigBlind: { zh: '大盲', en: 'big blind / bb' },
  smallBlind: { zh: '小盲', en: 'small blind' },
  stack: { zh: '筹码量', en: 'stack' },
  effectiveStack: { zh: '有效筹码', en: 'effective stack' },

  // --- The maths 数学 ---
  potOdds: { zh: '底池赔率', en: 'pot odds' },
  equity: { zh: '胜率', en: 'equity' },
  ev: { zh: '期望值', en: 'EV' },
  outs: { zh: '补牌', en: 'outs' },
  ruleOf24: { zh: '二四法则', en: 'rule of 2 and 4' },
  spr: { zh: '底池筹码比', en: 'SPR' },
  impliedOdds: { zh: '隐含赔率', en: 'implied odds' },
  combos: { zh: '组合数', en: 'combos' },
  blocker: { zh: '阻断牌', en: 'blocker' },
  range: { zh: '范围', en: 'range' },
  mdf: { zh: '最小防守频率', en: 'MDF' },

  // --- Draws 听牌 ---
  draw: { zh: '听牌', en: 'draw' },
  flushDraw: { zh: '同花听牌', en: 'flush draw' },
  openEnded: { zh: '两头顺听牌', en: 'open-ended straight draw' },
  gutshot: { zh: '卡顺', en: 'gutshot' },
  backdoor: { zh: '后门听牌', en: 'backdoor draw' },

  // --- Hands 牌型 ---
  highCard: { zh: '高牌', en: 'high card' },
  pair: { zh: '一对', en: 'pair' },
  topPair: { zh: '顶对', en: 'top pair' },
  overpair: { zh: '超对', en: 'overpair' },
  twoPair: { zh: '两对', en: 'two pair' },
  set: { zh: '暗三条', en: 'set' },
  trips: { zh: '三条', en: 'trips' },
  straight: { zh: '顺子', en: 'straight' },
  flush: { zh: '同花', en: 'flush' },
  fullHouse: { zh: '葫芦', en: 'full house' },
  quads: { zh: '四条', en: 'quads' },
  straightFlush: { zh: '同花顺', en: 'straight flush' },
  nuts: { zh: '坚果牌', en: 'the nuts' },
  kicker: { zh: '踢脚牌', en: 'kicker' },

  // --- Play 打法 ---
  bluff: { zh: '诈唬', en: 'bluff' },
  semiBluff: { zh: '半诈唬', en: 'semi-bluff' },
  valueBet: { zh: '价值下注', en: 'value bet' },
  bluffCatcher: { zh: '抓诈唬牌', en: 'bluff-catcher' },
  foldEquity: { zh: '弃牌率价值', en: 'fold equity' },
  potControl: { zh: '控池', en: 'pot control' },
  multiway: { zh: '多人底池', en: 'multiway' },
  boardTexture: { zh: '牌面结构', en: 'board texture' },
  wetBoard: { zh: '湿润牌面', en: 'wet board' },
  dryBoard: { zh: '干燥牌面', en: 'dry board' },

  // --- Players 玩家类型 ---
  callingStation: { zh: '跟注站', en: 'calling station' },
  nit: { zh: '岩石型玩家', en: 'nit' },
  maniac: { zh: '疯子型玩家', en: 'maniac' },
  fish: { zh: '鱼', en: 'fish' },
  cashGame: { zh: '现金局', en: 'cash game' },
};

/**
 * Render a term with its English on first use: 底池赔率（pot odds）.
 *
 * The bracketed English is the point, not decoration — it is what lets the
 * learner carry the concept out of this app and into an English-language
 * training video or a mixed-language table.
 */
export function term(key, { withEnglish = true } = {}) {
  const entry = TERMS[key];
  if (!entry) return key;
  return withEnglish ? `${entry.zh}（${entry.en}）` : entry.zh;
}

/** Just the Chinese, for repeat mentions within the same passage. */
export function zh(key) {
  return TERMS[key]?.zh ?? key;
}

/** Position name in Chinese with its abbreviation: 关煞位（CO）. */
export function positionName(abbrev) {
  const key = String(abbrev).toLowerCase();
  const entry = TERMS[key];
  return entry ? `${entry.zh}（${entry.en}）` : abbrev;
}
