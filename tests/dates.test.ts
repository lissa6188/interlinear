import test from 'node:test';
import assert from 'node:assert/strict';
import { latestIso } from '../src/lib/dates.ts';

test('발행 순서와 무관하게 가장 최신 수정일을 고른다', () => {
  assert.equal(latestIso(['2026-09-02', '2026-09-10', '2026-08-30']), '2026-09-10');
});

test('빈 값은 무시하고 유효한 날짜가 없으면 undefined를 반환한다', () => {
  assert.equal(latestIso([undefined, '2026-09-01']), '2026-09-01');
  assert.equal(latestIso([]), undefined);
});
