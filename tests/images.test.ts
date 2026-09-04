import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizedImageUrl } from '../src/lib/images.ts';

test('로컬 PNG와 JPEG만 WebP 파생본 주소로 바꾼다', () => {
  assert.equal(optimizedImageUrl('/cards/a/card.png'), '/cards/a/card.optimized.webp');
  assert.equal(optimizedImageUrl('/captures/photo.JPG'), '/captures/photo.optimized.webp');
  assert.equal(optimizedImageUrl('/captures/already.webp'), '/captures/already.webp');
  assert.equal(optimizedImageUrl('https://example.com/photo.png'), 'https://example.com/photo.png');
});
