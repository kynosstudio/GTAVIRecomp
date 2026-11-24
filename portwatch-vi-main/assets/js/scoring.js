// Scoring model shared by the website (assets/js/app.js) and the scout (scripts/).
// Keep this file dependency-free so it runs unchanged in browsers and in Node.
//
// A project's score is "how close is it to playing GTA VI on PC", 0-100.
// It climbs a ladder of milestones. Before anyone has the executable, the only
// thing a project can do is groundwork, which fills the first 25%.
//
//   0 ──── 25 ───── 40 ───── 55 ───── 70 ───── 85 ───── 100
//   Groundwork │ Exe runs │ First frame │ Main menu │ In-game │ 30 FPS │ Stable

export const MILESTONES = [
  { key: 'groundwork', label: 'Groundwork', at: 0, desc: 'Loader, system libraries, shader translation and graphics layer, built before the executable exists.' },
  { key: 'loads', label: 'Exe runs', at: 25, desc: "GTA VI's executable is mapped, its imports resolve and its own code starts running." },
  { key: 'boots', label: 'First frame', at: 40, desc: 'The game draws its first real frames: logos, a loading screen or the intro.' },
  { key: 'menu', label: 'Main menu', at: 55, desc: 'The title screen / main menu is reached and responds to input.' },
  { key: 'ingame', label: 'In-game', at: 70, desc: 'Story mode loads and you can move around the world.' },
  { key: 'fps30', label: '30 FPS', at: 85, desc: 'In-game performance reaches a 30 FPS average on a reported PC.' },
  { key: 'stable', label: 'Stable', at: 100, desc: 'Plays for long sessions without crashing.' },
];

// Groundwork parts and their share of the first 25%.
export const GROUNDWORK = [
  { key: 'loader', label: 'Loader & system libraries', weight: 0.2, desc: 'PE loading plus stand-ins for the console-only DLLs (kernelx, xgameruntime, xmem…).' },
  { key: 'shaders', label: 'Shader translation', weight: 0.28, desc: "Share of GTA VI's ~26,500 precompiled RDNA2 shaders translated to PC formats (SPIR-V / DXIL)." },
  { key: 'graphics', label: 'Graphics layer', weight: 0.32, desc: 'Xbox D3D12.X → PC D3D12 / Vulkan: devices, command lists, pipelines, draws, present.' },
  { key: 'proven', label: 'Proven on another game', weight: 0.2, desc: 'The same layer already runs a different retail Xbox Series game (menu, in-game…).' },
];

export const STABILITY = {
  unknown: { label: 'Unknown', value: 0 },
  constant: { label: 'Crashes constantly', value: 0 },
  often: { label: 'Crashes often', value: 0.25 },
  sometimes: { label: 'Crashes sometimes', value: 0.55 },
  rarely: { label: 'Rarely crashes', value: 0.8 },
  stable: { label: 'Stable', value: 1 },
};

const LADDER = ['loads', 'boots', 'menu', 'ingame'];
const TICK = Object.fromEntries(MILESTONES.map((m) => [m.key, m.at]));

const clamp01 = (v) => (Number.isFinite(+v) ? Math.min(1, Math.max(0, +v)) : 0);

// GTA ladder values are 0 (no), 0.5 (partially, e.g. "reaches the menu but it is broken") or 1 (yes).
export function ladderValue(v) {
  if (v === true) return 1;
  if (v === false || v == null) return 0;
  return clamp01(v);
}

export function groundworkFraction(gw) {
  // An effort with no public code has no groundwork to rate (the field is missing or null).
  return GROUNDWORK.reduce((sum, g) => sum + g.weight * clamp01(gw?.[g.key]), 0);
}

export function scoreEffort(effort) {
  const gw = groundworkFraction(effort.groundwork);
  const gta = effort.gta || {};
  let score = TICK.loads * gw;
  let reached = 'groundwork';
  let prevTick = score;

  for (const key of LADDER) {
    const v = ladderValue(gta[key]);
    if (v >= 1) {
      score = TICK[key];
      prevTick = score;
      reached = key;
      continue;
    }
    if (v > 0) score = Math.max(score, prevTick + v * (TICK[key] - prevTick));
    break;
  }

  if (reached === 'ingame') {
    const fps = clamp01((+gta.fps || 0) / 30);
    const stab = (STABILITY[gta.stability] || STABILITY.unknown).value;
    score = TICK.ingame + fps * (TICK.fps30 - TICK.ingame) + stab * (TICK.stable - TICK.fps30);
    if (fps >= 1) reached = 'fps30';
    if (fps >= 1 && stab >= 1) reached = 'stable';
  }

  return {
    score: Math.round(score * 10) / 10,
    groundwork: gw,
    reached,
    reachedLabel: MILESTONES.find((m) => m.key === reached).label,
  };
}

// Equal scores rank the effort with more GitHub stars first.
export const byStars = (a, b) => (b.stats?.stars || 0) - (a.stats?.stars || 0);

// The headline number: how close the leading effort is, plus the top-3 average.
export function overall(efforts) {
  const scored = efforts
    .filter((e) => !e.nuked) // taken offline: still shown on the board, no longer ranked
    .map((e) => ({ effort: e, ...scoreEffort(e) }))
    .sort((a, b) => b.score - a.score || byStars(a.effort, b.effort));
  const top = scored.slice(0, 3);
  const leader = scored[0] || null;
  const furthest = scored.reduce((best, s) => {
    const idx = MILESTONES.findIndex((m) => m.key === s.reached);
    return idx > best ? idx : best;
  }, 0);
  return {
    leader,
    score: leader ? leader.score : 0,
    top3: top.length ? Math.round((top.reduce((a, s) => a + s.score, 0) / top.length) * 10) / 10 : 0,
    furthest: MILESTONES[furthest],
    ranked: scored,
  };
}
