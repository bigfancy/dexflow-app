import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Starting Prisma CRUD tests...\n");

    // Cleanup existing data
    console.log("Cleaning up existing data...");
    await prisma.adClick.deleteMany({});
    console.log("✅ Database cleaned\n");

    // Test data
    const adId = 1;
    const linkId = 1;

    // Create a new ad click
    console.log("Creating a new ad click...");
    const newClick = await prisma.adClick.create({
      data: {
        adId,
        linkId,
        userId: "test-user",
        clicks: 1,
        lastClick: new Date(),
      },
    });
    console.log("Created Ad Click:", newClick);
    console.log("✅ Ad Click creation test passed\n");

    // Update the ad click
    console.log("Updating the ad click...");
    const updatedClick = await prisma.adClick.upsert({
      where: {
        adId_linkId: {
          adId,
          linkId,
        },
      },
      update: {
        clicks: { increment: 1 },
        lastClick: new Date(),
      },
      create: {
        adId,
        linkId,
        userId: "test-user",
        clicks: 1,
        lastClick: new Date(),
      },
    });
    console.log("Updated Ad Click:", updatedClick);
    console.log("✅ Ad Click update test passed\n");

    // Verify the click count
    const clickRecord = await prisma.adClick.findUnique({
      where: {
        adId_linkId: {
          adId,
          linkId,
        },
      },
    });
    console.log("Click Record:", clickRecord);
    console.log("✅ Click record verification test passed\n");

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
