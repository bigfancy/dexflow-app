import { NextRequest, NextResponse } from "next/server";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const adId = searchParams.get("adId");
  const adLinkId = searchParams.get("adLinkId");
  const imageUrl = searchParams.get("imageUrl");
  if (!adId || !adLinkId) {
    return NextResponse.json({ error: "Missing adId or adLinkId" }, { status: 400 });
  }

  console.log("adId", adId);
  console.log("adLinkId", adLinkId);

  return NextResponse.json({ message: "Ad click recorded" }, { status: 200 });

  // try {
  //   // 检查记录是否存在
  //   const existingClick = await prisma.adClick.findUnique({
  //     where: {
  //       adId_linkId: {
  //         adId: parseInt(adId),
  //         linkId: parseInt(adLinkId),
  //       },
  //     },
  //   });

  //   if (existingClick) {
  //     // 如果记录存在，进行更新
  //     const updatedClick = await prisma.adClick.update({
  //       where: {
  //         adId_linkId: {
  //           adId: parseInt(adId),
  //           linkId: parseInt(adLinkId),
  //         },
  //       },
  //       data: {
  //         clicks: { increment: 1 },
  //         lastClick: new Date(),
  //       },
  //     });
  //     console.log("Updated Ad Click:", updatedClick);
  //   } else {
  //     // 如果记录不存在，返回错误或处理逻辑
  //     return NextResponse.json({ error: "Ad click record not found" }, { status: 404 });
  //   }

  //   // 记录成功后重定向到目标URL
  //   return NextResponse.redirect(imageUrl || "");
  // } catch (error) {
  //   console.error("Failed to record click:", error);
  //   return NextResponse.json({ error: "Failed to process click" }, { status: 500 });
  // }
}
