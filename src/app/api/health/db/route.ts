import { NextResponse } from "next/server";
import { databaseHealth } from "@/lib/mongodb";

export async function GET() {
  try {
    return NextResponse.json(await databaseHealth());
  } catch {
    return NextResponse.json({ connected: false, message: "MongoDB is unavailable. Check MONGODB_URI and the database service." }, { status: 503 });
  }
}
