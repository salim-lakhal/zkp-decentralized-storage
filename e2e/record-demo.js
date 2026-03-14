const { chromium } = require("@playwright/test");
const path = require("path");

const FRONTEND_URL = "http://localhost:3000";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function recordDemo() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    recordVideo: {
      dir: path.join(__dirname, "../videos"),
      size: { width: 1400, height: 900 },
    },
  });

  const page = await context.newPage();

  // Landing page
  await page.goto(FRONTEND_URL);
  await sleep(2000);

  // Scroll down to see features
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(2000);

  // Click Dashboard nav (will redirect to landing since no wallet)
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);

  // Navigate to different pages to show the UI
  const navLinks = ["Dashboard", "Upload", "My Files", "Access Control"];
  for (const link of navLinks) {
    try {
      await page.click(`a:has-text("${link}")`, { timeout: 3000 });
      await sleep(1500);
    } catch {
      // May redirect to landing without wallet
    }
  }

  // Back to landing
  await page.goto(FRONTEND_URL);
  await sleep(2000);

  await context.close();
  await browser.close();

  console.log("Recording saved to videos/");
}

recordDemo().catch(console.error);
