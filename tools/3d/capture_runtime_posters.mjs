import { chromium } from "@playwright/test";

const baseUrl = process.env.EXPORTECH_BASE_URL ?? "http://127.0.0.1:5173";
const captures = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 900 },
    output: "/tmp/exportech-hero-runtime-poster-desktop.png",
    introEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-desktop-first-frame.png",
    outroEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-desktop-outro.png",
    reducedEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-desktop-reduced.png",
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    output: "/tmp/exportech-hero-runtime-poster-mobile.png",
    introEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-mobile-first-frame.png",
    outroEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-mobile-outro.png",
    reducedEvidence: "artifacts/3d/apple-user-remaster/site-captures/home-runway-mobile-reduced.png",
  },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const capture of captures) {
    const page = await browser.newPage({
      viewport: capture.viewport,
      colorScheme: "dark",
      deviceScaleFactor: 1,
      locale: "pt-BR",
      reducedMotion: "no-preference",
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const experience = page.locator(".hero-3d-experience");
    const canvas = page.locator(".hero-3d-canvas");
    await experience.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const target = document.querySelector(".hero-3d-canvas");
      return (
        target?.getAttribute("data-hero-3d-first-frame") === "true" &&
        target?.getAttribute("data-hero-3d-settled") === "true" &&
        Number(target?.getAttribute("data-hero-3d-progress")) <= 0.002
      );
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: capture.introEvidence,
      animations: "disabled",
    });
    const overlayStyle = await page.addStyleTag({
      content: `
        header,
        .hero-3d-intro,
        .hero-3d-skip,
        .hero-3d-narrative,
        .hero-3d-loading,
        .hero-3d-error,
        .hero-3d-actions { display: none !important; }
      `,
    });
    await canvas.screenshot({
      path: capture.output,
      animations: "disabled",
    });
    await overlayStyle.evaluate((element) => element.remove());

    await page.evaluate(() => {
      const story = document.querySelector('[data-hero-mode="prototype-3d"]');
      if (!(story instanceof HTMLElement)) return;
      window.scrollTo({
        top: story.offsetTop + story.scrollHeight - window.innerHeight,
        behavior: "instant",
      });
    });
    await page.waitForFunction(() => {
      const target = document.querySelector(".hero-3d-canvas");
      return (
        target?.getAttribute("data-hero-3d-chapter") === "outro" &&
        target?.getAttribute("data-hero-3d-settled") === "true"
      );
    });
    await page.screenshot({
      path: capture.outroEvidence,
      animations: "disabled",
    });
    const size = await canvas.boundingBox();
    console.log(`${capture.name}: ${size?.width}x${size?.height} -> ${capture.output}`);
    await page.close();

    const reducedPage = await browser.newPage({
      viewport: capture.viewport,
      colorScheme: "dark",
      deviceScaleFactor: 1,
      locale: "pt-BR",
      reducedMotion: "reduce",
    });
    await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
    const images = reducedPage.locator("img");
    for (let index = 0; index < (await images.count()); index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
    }
    await reducedPage.evaluate(() => document.fonts.ready);
    await reducedPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await reducedPage.screenshot({
      path: capture.reducedEvidence,
      fullPage: true,
      animations: "disabled",
    });
    await reducedPage.close();
  }
} finally {
  await browser.close();
}
