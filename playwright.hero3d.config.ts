import { defineConfig, devices } from "@playwright/test";

const hero3DPort = 4187;

export default defineConfig({
  testDir: "./tests/hero3d",
  outputDir: "test-results/hero3d",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "playwright-report/hero3d",
        open: "never",
      },
    ],
  ],
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${hero3DPort}`,
    colorScheme: "dark",
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command:
      `npm run build && npm run preview -- --host 127.0.0.1 --port ${hero3DPort} --strictPort`,
    url: `http://127.0.0.1:${hero3DPort}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "hero3d-desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "hero3d-mobile-chromium",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
