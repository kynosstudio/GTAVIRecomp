const test = require('node:test');
const assert = require('node:assert/strict');
const scoring = require('../data/portwatch-scoring.js');

test('scores the GTA VI milestone ladder from 10% to 50%', () => {
  const cases = [
    [{ groundwork: { loader: 1, shaders: 1, graphics: 1, proven: 1 } }, 10],
    [{ gta: { loads: 1 } }, 10],
    [{ gta: { loads: 1, boots: 1 } }, 20],
    [{ gta: { loads: 1, boots: 1, menu: 1 } }, 30],
    [{ gta: { loads: 1, boots: 1, menu: 1, world: 1 } }, 40],
    [{ gta: { loads: 1, boots: 1, menu: 1, world: 1, playable: 1 } }, 50]
  ];

  for (const [effort, expected] of cases) {
    assert.equal(scoring.scoreEffort(effort).score, expected);
  }
});

test('uses quality tracks only after the project is playable', () => {
  const unfinished = scoring.scoreEffort({
    gta: { loads: 1, boots: 1, menu: 1, world: 1, playable: 1 }
  });
  const complete = scoring.scoreEffort({
    gta: {
      loads: 1,
      boots: 1,
      menu: 1,
      world: 1,
      playable: 1,
      story: 1,
      render: 1,
      fps: 30,
      stability: 'stable'
    }
  });

  assert.equal(unfinished.score, 50);
  assert.equal(complete.score, 100);
  assert.equal(complete.reached, 'complete');
});

test('scores numeric stability values from tracker snapshots', () => {
  const result = scoring.scoreEffort({
    gta: {
      loads: 1,
      boots: 1,
      menu: 1,
      world: 1,
      playable: 1,
      story: 0.5,
      render: 0.85,
      fps: 3,
      stability: 0.7
    }
  });

  assert.equal(result.score, 77.4);
  assert.equal(result.tracks.stability, 0.7);
});

test('honors manual scores and ranks ties by stars, excluding nuked efforts', () => {
  const result = scoring.overall([
    { id: 'manual', manualScore: 75, stats: { stars: 2 } },
    { id: 'tie-less-stars', manualScore: 65, stats: { stars: 3 } },
    { id: 'tie-more-stars', manualScore: 65, stats: { stars: 8 } },
    { id: 'offline', manualScore: 100, nuked: true }
  ]);

  assert.equal(result.leader.effort.id, 'manual');
  assert.deepEqual(result.ranked.map(({ effort }) => effort.id), ['manual', 'tie-more-stars', 'tie-less-stars']);
  assert.equal(result.top3, 68.3);
  assert.equal(result.ranked.length, 3);
});

test('applies the newest published tracker value without mutating the local snapshot', () => {
  const snapshot = {
    efforts: [{ id: 'xlaunchvi', name: 'XLaunchVI', manualScore: 78.7, summary: 'Snapshot local' }]
  };
  const result = scoring.applyPublishedTrackerUpdates(snapshot, [
    {
      project_id: 'xlaunchvi',
      project_name: 'XLaunchVI',
      percent: 62,
      milestone: 'Shaders',
      summary: 'Valor antigo',
      published_at: '2026-01-01T10:00:00Z'
    },
    {
      project_id: 'xlaunchvi',
      project_name: 'XLaunchVI',
      percent: 83.5,
      milestone: 'Otimização',
      summary: 'Valor mais recente',
      published_at: '2026-01-02T10:00:00Z'
    },
    {
      project_id: 'novo-projeto',
      project_name: 'Novo projeto',
      percent: 45,
      milestone: 'Mundo',
      summary: 'Projeto publicado',
      published_at: '2026-01-02T09:00:00Z'
    },
    { project_id: 'inválido', percent: null, published_at: '2026-01-03T10:00:00Z' }
  ]);

  assert.equal(result.efforts.find(({ id }) => id === 'xlaunchvi').manualScore, 83.5);
  assert.equal(result.efforts.find(({ id }) => id === 'xlaunchvi').summary, 'Snapshot local');
  assert.equal(result.efforts.find(({ id }) => id === 'novo-projeto').percent, 45);
  assert.equal(result.efforts.some(({ id }) => id === 'inválido'), false);
  assert.equal(snapshot.efforts[0].manualScore, 78.7);
});

test('distinguishes public repositories from private builds', () => {
  assert.equal(scoring.isPrivateBuild({ repo: null }), true);
  assert.equal(scoring.isPrivateBuild({ repo: 'owner/project' }), false);
});
