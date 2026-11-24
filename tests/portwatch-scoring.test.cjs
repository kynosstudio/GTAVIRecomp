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

test('distinguishes public repositories from private builds', () => {
  assert.equal(scoring.isPrivateBuild({ repo: null }), true);
  assert.equal(scoring.isPrivateBuild({ repo: 'owner/project' }), false);
});
