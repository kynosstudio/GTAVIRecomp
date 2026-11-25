const test = require('node:test');
const assert = require('node:assert/strict');
const hardware = require('../data/hardware.json');

test('community reference data includes the 30 FPS and optimization targets', () => {
  const community = hardware.communityBuild;
  const base = hardware.targets.find((target) => target.id === community.base30FpsTargetId);
  const optimized = hardware.targets.find((target) => target.id === community.optimized60FpsTargetId);
  const playStation = hardware.consoles.find((consoleItem) => consoleItem.name === 'PlayStation 5');

  assert.equal(base.fps.average, 30);
  assert.equal(optimized.fps.average, 60);
  assert.match(playStation.architecture, /Zen 2 \(8C\/16T até 3,5 GHz\)/);
  assert.match(playStation.architecture, /RDNA 2 \(10,3 TFLOPS\)/);
  assert.deepEqual(community.minimumRamGb, { ddr4: 32, ddr5: 24 });
  assert.equal(community.recommendedMemoryChannel, 'dual');
});

test('potential compatibility lists only reference hardware present in the catalogs', () => {
  const community = hardware.communityBuild;
  const cpuIds = new Set(hardware.cpus.map((cpu) => cpu.id));
  const gpuIds = new Set(hardware.gpus.map((gpu) => gpu.id));
  const expectedCpuIds = [
    'ryzen-7-5700x', 'ryzen-7-5800x', 'ryzen-7-5800x3d', 'ryzen-7-7700', 'ryzen-7-7800x3d',
    'ryzen-7-9700x', 'ryzen-7-9800x3d', 'ryzen-5-7600', 'ryzen-9-7900x', 'ryzen-9-7950x',
    'ryzen-9-9950x', 'i5-12600k', 'i5-13400', 'i5-13600k', 'i5-14400', 'i5-14600k',
    'i7-11700k', 'i7-12700k', 'i7-13700k', 'i7-14700k', 'i9-12900k', 'i9-13900k'
  ];
  const expectedGpuIds = [
    'rx-6700xt', 'rx-6750xt', 'rx-6800', 'rx-6800xt', 'rx-6900xt', 'rx-6950xt', 'rx-7700xt',
    'rx-7800xt', 'rx-7900gre', 'rx-7900xt', 'rx-9070', 'rx-9070xt', 'rtx-3050', 'rtx-3060',
    'rtx-3060ti', 'rtx-3070', 'rtx-3070ti', 'rtx-3080', 'rtx-3080ti', 'rtx-3090', 'rtx-3090ti',
    'rtx-4070', 'rtx-4070s', 'rtx-4070ti', 'rtx-4070tis', 'rtx-5070', 'rtx-5070ti', 'rtx-4080',
    'rtx-4080s', 'rtx-5080', 'rtx-4090', 'rtx-5090', 'arc-b580', 'arc-a770'
  ];

  assert.deepEqual(community.potentialCpuIds, expectedCpuIds);
  assert.deepEqual(community.potentialGpuIds, expectedGpuIds);
  assert.ok(community.potentialCpuIds.every((id) => cpuIds.has(id)));
  assert.ok(community.potentialGpuIds.every((id) => gpuIds.has(id)));
  assert.ok(community.notices.some((notice) => /não são requisitos oficiais/i.test(notice)));
  assert.ok(community.notices.some((notice) => /TFLOPS isolados/i.test(notice)));
  assert.ok(community.notices.some((notice) => /Intel Arc/i.test(notice)));
});
