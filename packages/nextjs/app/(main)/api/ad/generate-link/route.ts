import { NextRequest, NextResponse } from "next/server";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // try {
  //   const { adId, userId, linkId } = await req.json();
  //   // 保存链接到数据库
  //   await prisma.adClick.create({
  //     data: {
  //       adId,
  //       linkId: parseInt(linkId),
  //       userId,
  //     },
  //   });
  //   return NextResponse.json({
  //     success: true,
  //     linkId,
  //   });
  // } catch (error) {
  //   console.error("Failed to save ad link:", error);
  //   return NextResponse.json({ success: false, error: "Failed to save link" }, { status: 500 });
  // }

  return NextResponse.json({ message: "Ad link generated" }, { status: 200 });
}
