import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { linkId } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Find the ad link
    const adLink = await prisma.adLink.findUnique({
      where: { linkId: parseInt(linkId) },
    });

    if (!adLink) {
      return NextResponse.json({ success: false, error: "Link not found" }, { status: 404 });
    }

    // Update click count
    await prisma.adLink.update({
      where: { id: adLink.id },
      data: {
        clicks: { increment: 1 },
        lastClick: new Date(),
      },
    });

    // Log click details
    await prisma.clickLog.create({
      data: {
        adLinkId: adLink.id,
        ip,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record click:", error);
    return NextResponse.json({ success: false, error: "Failed to record click" }, { status: 500 });
  }
}
