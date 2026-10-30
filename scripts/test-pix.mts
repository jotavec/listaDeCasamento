import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type stripping requires explicit source extensions.
import { crc16, makePixCode, normalizePixKey, paymentSummary, type PaymentReport } from '../lib/gifts/pix.ts';

function fields(payload: string) {
  const result: Record<string,string> = {};
  for (let offset = 0; offset < payload.length;) {
    const id = payload.slice(offset, offset + 2);
    const size = Number(payload.slice(offset + 2, offset + 4));
    result[id] = payload.slice(offset + 4, offset + 4 + size);
    offset += 4 + size;
  }
  return result;
}
test('Pix has correct merchant account, integer cents, reference and standard CRC', () => {
  assert.equal(crc16('123456789'), '29B1');
  const key = '123e4567-e12b-12d1-a456-426655440000';
  const code = makePixCode({pix_key:key,receiver_name:'João & Jéssica',receiver_city:'Goiânia'},20001,'a123456789');
  const parsed = fields(code);
  assert.equal(parsed['00'],'01');
  assert.deepEqual(fields(parsed['26']), {'00':'br.gov.bcb.pix','01':key});
  assert.equal(parsed['54'],'200.01');
  assert.equal(parsed['53'],'986');
  assert.equal(parsed['59'],'JOAO JESSICA');
  assert.equal(parsed['60'],'GOIANIA');
  assert.equal(fields(parsed['62'])['05'],'a123456789');
  assert.equal(parsed['63'],crc16(code.slice(0,-4)));
  assert.throws(()=>makePixCode({pix_key:key,receiver_name:'A',receiver_city:'B'},1.5,'123'));
  assert.throws(()=>makePixCode({pix_key:key,receiver_name:'A',receiver_city:'B'},100,'x'.repeat(26)));
});
test('Pix keys validate documents and normalize phones without assuming a destination', () => {
  assert.equal(normalizePixKey('email','teste@example.com'),'teste@example.com');
  assert.equal(normalizePixKey('email','inválido'),null);
  assert.equal(normalizePixKey('phone','(62) 99999-0000'),'+5562999990000');
  assert.equal(normalizePixKey('phone','+55 (62) 99999-0000'),'+5562999990000');
  assert.equal(normalizePixKey('phone','(55) 99999-0000'),'+5555999990000');
  assert.equal(normalizePixKey('cpf','529.982.247-25'),'52998224725');
  assert.equal(normalizePixKey('cpf','529.982.247-26'),null);
  assert.equal(normalizePixKey('cpf','111.111.111-11'),null);
  assert.equal(normalizePixKey('cnpj','11.222.333/0001-81'),'11222333000181');
  assert.equal(normalizePixKey('random','not-a-key'),null);
});
test('guest reports and not-found entries never increase received funds', () => {
  const reports = [{status:'reported',amount_cents:20000},{status:'confirmed',amount_cents:15050},{status:'not_found',amount_cents:80000}] as PaymentReport[];
  assert.deepEqual(paymentSummary(reports),{confirmedCents:15050,pendingCount:1,pendingCents:20000});
});
