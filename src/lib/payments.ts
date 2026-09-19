export type PaymentMethod = "cod" | "online";

export async function createPaymentIntent(input: { amount: number; method: PaymentMethod }) {
  if (input.method === "cod") return { status: "pending", provider: "cod", reference: `COD-${Date.now()}` };
  if (!process.env.PAYMENT_PROVIDER_SECRET) throw new Error("Online payments require PAYMENT_PROVIDER_SECRET.");
  return { status: "pending", provider: process.env.PAYMENT_PROVIDER ?? "configured-provider", reference: `ONLINE-${Date.now()}` };
}
