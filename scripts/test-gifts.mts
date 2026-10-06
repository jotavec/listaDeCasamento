import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
// Node executes these source-only tests without a second build tool.
// @ts-expect-error Node's type stripping requires explicit source extensions.
import { parsePrice, formatPrice } from '../lib/gifts/shared.ts';
// @ts-expect-error Node's type stripping requires explicit source extensions.
import { processGiftPhoto } from '../lib/gifts/photo.ts';

test('BRL input preserves cents and rejects ambiguous/invalid values', () => {
  for (const [input, expected] of [['250',25000],['250,50',25050],['1.250,5',125050],['R$ 0,01',1],['1.000.000,00',100000000]] as const) assert.equal(parsePrice(input),expected);
  for (const value of ['', '0','-1','1.20','12,345','1e5','NaN','1.000.000,01','2,5,0']) assert.equal(parsePrice(value),null,value);
  assert.match(formatPrice(12345),/123,45/);
});
test('photos become compact WebP, resize and strip metadata', async () => {
  const input = await sharp({create:{width:2400,height:1800,channels:3,background:'#d2b077'}}).jpeg().withMetadata().toBuffer();
  const result = await processGiftPhoto(input);
  const meta = await sharp(result).metadata();
  assert.equal(meta.format,'webp'); assert.equal(meta.width,1600); assert.equal(meta.height,1200); assert.equal(meta.exif,undefined); assert.ok(result.length < 2*1024*1024);
});
test('fake images, SVG and oversized uploads are rejected', async () => {
  await assert.rejects(processGiftPhoto(Buffer.from('not a photo')));
  await assert.rejects(processGiftPhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20"/></svg>')));
  await assert.rejects(processGiftPhoto(Buffer.alloc(2*1024*1024+1)));
});
