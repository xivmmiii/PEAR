import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCollection } from "@/lib/mongodb";
import { createSessionToken, isRole, type Role } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string; role?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !body.password || (body.role && !isRole(body.role))) return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
    const users = await usersCollection();
    const user = await users.findOne<{ _id: { toString(): string }; email: string; passwordHash?: string; role: Role; firstName: string }>({ email });
    if (!user?.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) return NextResponse.json({ message: "Email or password is incorrect." }, { status: 401 });
    if (body.role && body.role !== user.role) return NextResponse.json({ message: `This account is registered as a ${user.role}.` }, { status: 403 });
    const token = await createSessionToken({ id: user._id.toString(), email: user.email, firstName: user.firstName, role: user.role });
    const response = NextResponse.json({ user: { firstName: user.firstName, email: user.email, role: user.role } });
    response.cookies.set("pear_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return NextResponse.json({ message: "Sign-in is temporarily unavailable because the database cannot be reached." }, { status: 503 });
  }
}
