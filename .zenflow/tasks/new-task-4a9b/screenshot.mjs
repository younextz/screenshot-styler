import { chromium } from 'playwright';

const SCREENSHOTS_DIR = './screenshots';
const BASE_URL = 'http://localhost:5173';

async function captureScreenshots(prefix = 'before') {
  const browser = await chromium.launch();

  try {
    // Capture dark theme at 1920x1080
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${prefix}-dark-1920x1080.png` });
    console.log(`Captured: ${prefix}-dark-1920x1080.png`);

    // Capture dark theme at 1280x720
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${prefix}-dark-1280x720.png` });
    console.log(`Captured: ${prefix}-dark-1280x720.png`);

    // Switch to light theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await page.waitForTimeout(100);

    // Capture light theme at 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${prefix}-light-1920x1080.png` });
    console.log(`Captured: ${prefix}-light-1920x1080.png`);

    // Capture light theme at 1280x720
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${prefix}-light-1280x720.png` });
    console.log(`Captured: ${prefix}-light-1280x720.png`);

    await page.close();

  } finally {
    await browser.close();
  }
}

const prefix = process.argv[2] || 'before';
captureScreenshots(prefix).catch(console.error);
