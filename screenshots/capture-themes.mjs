import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // Ensure dark theme (default)
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-theme');
  });
  await page.waitForTimeout(200);
  
  await page.screenshot({ path: 'screenshots/dark-theme-1920x1080.png' });
  console.log('Captured dark theme');
  
  // Light theme
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(200);
  
  await page.screenshot({ path: 'screenshots/light-theme-1920x1080.png' });
  console.log('Captured light theme');
  
  await browser.close();
}

capture().catch(console.error);
