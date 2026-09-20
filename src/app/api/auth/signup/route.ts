import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/lib/mongodb";
import { createSessionToken, isRole, type Role } from "@/lib/auth";
import { emailPattern, limits, sentenceCase, validText } from "@/lib/validation";

type SignUpBody = { firstName?: string; lastName?: string; email?: string; password?: string; role?: string; brandName?: string };

export async function POST(request: Request) {
  const body = await request.json() as SignUpBody;
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role ?? "shopper";
  const brandName = body.brandName?.trim();
  if (!validText(firstName, limits.name.min, limits.name.max) || !validText(lastName, limits.name.min, limits.name.max) || !email || !emailPattern.test(email) || !password || password.length < limits.password.min || password.length > limits.password.max || !isRole(role) || role === "admin" || (role === "seller" && !validText(brandName, limits.brand.min, limits.brand.max))) {
    return NextResponse.json({ message: "Please provide valid account details." }, { status: 400 });
  }
  const users = await usersCollection();
  const existing = await users.findOne({ email }, { projection: { _id: 1 } });
  if (existing) return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await users.insertOne({ firstName: sentenceCase(firstName!), lastName: sentenceCase(lastName!), email, passwordHash, role: role as Role, brandName: role === "seller" ? sentenceCase(brandName!) : undefined, createdAt: new Date(), updatedAt: new Date() });
  const token = await createSessionToken({ id: result.insertedId.toString(), email: email!, firstName: firstName!, role: role as Role });
  const response = NextResponse.json({ user: { firstName, email, role } }, { status: 201 });
  response.cookies.set("pear_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
