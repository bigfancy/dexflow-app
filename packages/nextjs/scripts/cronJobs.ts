import settleClicks from "./settleClicks";
import cron from "node-cron";

// 每天凌晨3点执行结算
cron.schedule("0 3 * * *", async () => {
  console.log("Running daily click settlement...");
  await settleClicks();
});

// 也可以手动触发结算
process.on("SIGTERM", async () => {
  console.log("Manually triggering settlement...");
  await settleClicks();
  process.exit(0);
});

console.log("Cron jobs started...");
