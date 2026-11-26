(function (root, factory) {
  const scoring = factory();
  if (typeof module === 'object' && module.exports) module.exports = scoring;
  else root.PortWatchScoring = scoring;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  const MILESTONES = [
    { key: 'groundwork', label: 'Groundwork', at: 0 },
    { key: 'loads', label: 'Exe runs', at: 10 },
    { key: 'boots', label: 'First frame', at: 20 },
    { key: 'menu', label: 'Main menu', at: 30 },
    { key: 'world', label: 'In the world', at: 40 },
    { key: 'playable', label: 'Playable', at: 50 },
    { key: 'complete', label: 'Complete', at: 100 }
  ];
  const TRACKS = [
    { key: 'story', weight: 0.35 },
    { key: 'render', weight: 0.25 },
    { key: 'perf', weight: 0.2 },
    { key: 'stability', weight: 0.2 }
  ];
  const GROUNDWORK = [
    { key: 'loader', weight: 0.2 },
    { key: 'shaders', weight: 0.28 },
    { key: 'graphics', weight: 0.32 },
    { key: 'proven', weight: 0.2 }
  ];
  const STABILITY = {
    unknown: 0,
    constant: 0,
    often: 0.25,
    sometimes: 0.55,
    rarely: 0.8,
    stable: 1
  };
  const LADDER = ['loads', 'boots', 'menu', 'world', 'playable'];
  const TICK = Object.fromEntries(MILESTONES.map((milestone) => [milestone.key, milestone.at]));
  const clamp01 = (value) => (Number.isFinite(+value) ? Math.min(1, Math.max(0, +value)) : 0);

  function ladderValue(value) {
    if (value === true) return 1;
    if (value === false || value == null) return 0;
    return clamp01(value);
  }

  function groundworkFraction(groundwork) {
    return GROUNDWORK.reduce((total, part) => total + part.weight * clamp01(groundwork && groundwork[part.key]), 0);
  }

  function trackValues(gta) {
    return {
      story: clamp01(gta.story),
      render: clamp01(gta.render),
      perf: clamp01((+gta.fps || 0) / 30),
      stability: typeof gta.stability === 'number'
        ? clamp01(gta.stability)
        : STABILITY[gta.stability] || 0
    };
  }

  function scoreEffort(effort) {
    const gta = effort.gta || {};
    const groundwork = groundworkFraction(effort.groundwork);
    let score = TICK.loads * groundwork;
    let reached = 'groundwork';
    let previousTick = score;

    for (const key of LADDER) {
      const value = ladderValue(gta[key]);
      if (value >= 1) {
        score = TICK[key];
        previousTick = score;
        reached = key;
        continue;
      }
      if (value > 0) score = Math.max(score, previousTick + value * (TICK[key] - previousTick));
      break;
    }

    const tracks = trackValues(gta);
    const quality = TRACKS.reduce((total, track) => total + track.weight * tracks[track.key], 0);
    if (reached === 'playable') {
      score = TICK.playable + quality * (TICK.complete - TICK.playable);
      if (quality >= 1) reached = 'complete';
    }
    if (Number.isFinite(effort.manualScore)) score = Math.min(100, Math.max(0, effort.manualScore));

    return {
      score: Math.round(score * 10) / 10,
      groundwork,
      reached,
      reachedLabel: MILESTONES.find((milestone) => milestone.key === reached).label,
      tracks,
      playable: reached === 'playable' || reached === 'complete'
    };
  }

  function applyPublishedTrackerUpdates(snapshot, updates) {
    const base = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const efforts = Array.isArray(base.efforts) ? base.efforts.map((effort) => ({ ...effort })) : [];
    const latestByProject = new Map();
    (Array.isArray(updates) ? updates : []).forEach((update) => {
      if (!update || typeof update.project_id !== 'string' || !update.project_id.trim()
        || update.percent === null || update.percent === undefined || String(update.percent).trim() === '') return;
      const projectId = update.project_id.trim();
      const percent = Number(update.percent);
      if (!Number.isFinite(percent) || percent < 0 || percent > 100) return;
      const timestamp = Date.parse(update.published_at || update.created_at || '');
      const current = latestByProject.get(projectId);
      if (!current || (Number.isFinite(timestamp) && timestamp > current.timestamp)) {
        latestByProject.set(projectId, {
          update,
          timestamp: Number.isFinite(timestamp) ? timestamp : 0
        });
      }
    });

    latestByProject.forEach(({ update }) => {
      const percent = Number(update.percent);
      const projectId = update.project_id.trim();
      const index = efforts.findIndex((effort) => effort && effort.id === projectId);
      const existing = index >= 0 ? efforts[index] : {};
      const project = {
        ...existing,
        id: projectId,
        name: update.project_name || existing.name || projectId,
        percent,
        manualScore: percent,
        stage: update.milestone || existing.stage,
        status: existing.status || 'acompanhado',
        managedProgress: {
          percent,
          milestone: update.milestone || '',
          summary: update.summary || '',
          sourceUrl: update.source_url || '',
          publishedAt: update.published_at || update.created_at || ''
        }
      };
      if (index >= 0) efforts[index] = project;
      else efforts.push(project);
    });

    return {
      ...base,
      efforts,
      managedTrackerUpdates: [...latestByProject.values()].map(({ update }) => update)
    };
  }

  const byStars = (left, right) => (right.stats && right.stats.stars || 0) - (left.stats && left.stats.stars || 0);
  const isPrivateBuild = (effort) => !(typeof effort.repo === 'string' && effort.repo.includes('/'));

  function overall(efforts) {
    const ranked = efforts
      .filter((effort) => !effort.nuked)
      .map((effort) => ({ effort, ...scoreEffort(effort) }))
      .sort((left, right) => right.score - left.score || byStars(left.effort, right.effort));
    const top = ranked.slice(0, 3);
    const leader = ranked[0] || null;
    const furthestIndex = ranked.reduce((best, item) => Math.max(
      best,
      MILESTONES.findIndex((milestone) => milestone.key === item.reached)
    ), 0);
    return {
      leader,
      score: leader ? leader.score : 0,
      top3: top.length ? Math.round((top.reduce((sum, item) => sum + item.score, 0) / top.length) * 10) / 10 : 0,
      furthest: MILESTONES[furthestIndex],
      ranked
    };
  }

  return {
    MILESTONES,
    TRACKS,
    GROUNDWORK,
    STABILITY,
    ladderValue,
    groundworkFraction,
    trackValues,
    scoreEffort,
    applyPublishedTrackerUpdates,
    byStars,
    isPrivateBuild,
    overall
  };
}));
