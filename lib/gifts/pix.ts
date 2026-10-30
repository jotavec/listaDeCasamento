export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PIX_KEY_TYPES = ["random", "email", "cpf", "cnpj", "phone"] as const;
export type PixKeyType = (typeof PIX_KEY_TYPES)[number];
export type PixSettings = {
  id: boolean;
  key_type: PixKeyType;
  pix_key: string;
  receiver_name: string;
  receiver_city: string;
  enabled: boolean;
  updated_at: string;
};
export type PixPayment = {
  id: string;
  gift_id: string;
  gift_title: string;
  amount_cents: number;
  guest_name: string;
  payer_name: string;
  pix_key: string;
  receiver_name: string;
  reference: string;
  code: string;
  qr_image: string;
};
export type PaymentStatus = "reported" | "confirmed" | "not_found";
export type PaymentReport = {
  id: string;
  gift_id: string | null;
  gift_title: string;
  amount_cents: number;
  guest_name: string;
  payer_name: string;
  pix_key: string;
  reference: string;
  status: PaymentStatus;
  reported_at: string;
  confirmed_at: string | null;
  updated_at: string;
};
export const REPORT_COLUMNS = "id,gift_id,gift_title,amount_cents,guest_name,payer_name,pix_key,reference,status,reported_at,confirmed_at,updated_at";
export const STATUS_LABELS: Record<PaymentStatus, string> = {
  reported: "Pagamento informado",
  confirmed: "Recebimento confirmado",
  not_found: "Não localizado",
};

export function normalizePixKey(type: PixKeyType, value: string): string | null {
  const key = value.trim();
  if (type === "random") return UUID.test(key) ? key.toLowerCase() : null;
  if (type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key) && key.length <= 77 && /^[\x21-\x7e]+$/.test(key) ? key : null;
  if (type === "phone") {
    const digits = key.replace(/[\s()+.-]/g, "");
    const normalized = digits.startsWith("55") && digits.length >= 12 ? `+${digits}` : `+55${digits}`;
    return /^\+55\d{10,11}$/.test(normalized) ? normalized : null;
  }
  const digits = key.replace(/[.\/-]/g, "");
  const length = type === "cpf" ? 11 : 14;
  if (!new RegExp(`^\\d{${length}}$`).test(digits) || /^(\d)\1+$/.test(digits)) return null;
  const base = digits.slice(0, -2);
  const check = (value: string) => {
    let sum = 0;
    for (let i = 0; i < value.length; i++) {
      const weight = type === "cpf" ? value.length + 1 - i : (value.length - 1 - i) % 8 + 2;
      sum += Number(value[i]) * weight;
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const first = check(base);
  return digits === `${base}${first}${check(`${base}${first}`)}` ? digits : null;
}

export function pixText(value: string, max: number) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function field(id: string, value: string) {
  const bytes = new TextEncoder().encode(value).length;
  if (bytes > 99) throw new Error("Campo Pix muito longo.");
  return id + String(bytes).padStart(2, "0") + value;
}

// BR Code CRC-16/CCITT-FALSE (polynomial 0x1021, initial value 0xffff).
export function crc16(value: string) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(value)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function makePixCode(settings: Pick<PixSettings, "pix_key" | "receiver_name" | "receiver_city">, cents: number, reference: string) {
  if (!Number.isSafeInteger(cents) || cents < 1 || cents > 100_000_000 || !/^[a-zA-Z0-9]{1,25}$/.test(reference)) throw new Error("Dados Pix inválidos.");
  const name = pixText(settings.receiver_name, 25);
  const city = pixText(settings.receiver_city, 15);
  if (!name || !city || !settings.pix_key || settings.pix_key.length > 77) throw new Error("Configure os dados do Pix.");
  const payload = field("00", "01")
    + field("26", field("00", "br.gov.bcb.pix") + field("01", settings.pix_key))
    + field("52", "0000") + field("53", "986") + field("54", (cents / 100).toFixed(2))
    + field("58", "BR") + field("59", name) + field("60", city)
    + field("62", field("05", reference)) + "6304";
  return payload + crc16(payload);
}

export function validName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 120 && !/[\x00-\x1f]/.test(value);
}

export function paymentSummary(reports: PaymentReport[]) {
  return reports.reduce((summary, report) => {
    if (report.status === "confirmed") summary.confirmedCents += report.amount_cents;
    if (report.status === "reported") { summary.pendingCount++; summary.pendingCents += report.amount_cents; }
    return summary;
  }, { confirmedCents: 0, pendingCount: 0, pendingCents: 0 });
}
