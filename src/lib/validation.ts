export const limits = {
  name: { min: 2, max: 40 },
  brand: { min: 2, max: 60 },
  description: { min: 10, max: 500 },
  phone: { length: 10 },
  address: { min: 2, max: 80 },
  pincode: { length: 6 },
  password: { min: 8, max: 128 },
} as const;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const phonePattern = /^\d{10}$/;
export const pincodePattern = /^\d{6}$/;

export function sentenceCase(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
}

export function validText(value: unknown, min: number, max: number) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

export function validIntegerString(value: unknown) {
  return typeof value === "string" && /^\d+$/.test(value.trim()) && Number.parseInt(value, 10) > 0;
}
