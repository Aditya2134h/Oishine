import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const existingAdmin = await db.admin.findUnique({
      where: { email: "admin@oishine.com" }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin user already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await db.admin.create({
      data: {
        email: "admin@oishine.com",
        name: "Admin OISHINE",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully"
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
