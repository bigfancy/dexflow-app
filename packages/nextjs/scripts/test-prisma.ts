import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Starting Prisma CRUD tests...\n");

    // Cleanup existing data
    console.log("Cleaning up existing data...");
    await prisma.clickLog.deleteMany({});
    await prisma.adLink.deleteMany({});
    console.log("✅ Database cleaned\n");

    // Create AdLink
    console.log("Testing AdLink creation...");
    const adLink = await prisma.adLink.create({
      data: {
        adId: 1,
        linkId: 12345,
        userId: "0x123...abc",
        clicks: 0,
      },
    });
    console.log("Created AdLink:", adLink);
    console.log("✅ AdLink creation test passed\n");

    // Create ClickLog
    console.log("Testing ClickLog creation...");
    const clickLog = await prisma.clickLog.create({
      data: {
        adLinkId: adLink.id,
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0 Test Browser",
      },
    });
    console.log("Created ClickLog:", clickLog);
    console.log("✅ ClickLog creation test passed\n");

    // Update AdLink clicks
    console.log("Testing AdLink update...");
    const updatedAdLink = await prisma.adLink.update({
      where: { id: adLink.id },
      data: { clicks: { increment: 1 } },
    });
    console.log("Updated AdLink:", updatedAdLink);
    console.log("✅ AdLink update test passed\n");

    // Read AdLink with related ClickLogs
    console.log("Testing AdLink read with relations...");
    const adLinkWithLogs = await prisma.adLink.findUnique({
      where: { id: adLink.id },
      include: { clickLogs: true },
    });
    console.log("AdLink with ClickLogs:", adLinkWithLogs);
    console.log("✅ AdLink read test passed\n");

    // Query ClickLogs for specific AdLink
    console.log("Testing ClickLog query...");
    const clickLogs = await prisma.clickLog.findMany({
      where: { adLinkId: adLink.id },
      include: { adLink: true },
    });
    console.log("Found ClickLogs:", clickLogs);
    console.log("✅ ClickLog query test passed\n");

    // Test statistics
    console.log("Testing statistics queries...");
    const stats = await prisma.adLink.findMany({
      select: {
        adId: true,
        clicks: true,
        _count: {
          select: { clickLogs: true },
        },
      },
      where: {
        clicks: { gt: 0 },
      },
    });
    console.log("Statistics:", stats);
    console.log("✅ Statistics query test passed\n");

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
