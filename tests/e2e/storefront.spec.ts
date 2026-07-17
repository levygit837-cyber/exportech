import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  convertUSDToBRL,
  formatBRL,
  products,
} from "../../src/data/products";

function monitorRuntime(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText;
    if (
      request.url().startsWith("http://127.0.0.1:4173") &&
      failure !== "net::ERR_ABORTED"
    ) {
      errors.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    }
  });

  return errors;
}

async function openPrimaryNavigation(page: Page): Promise<Locator> {
  const menuButton = page.getByRole("button", { name: "Abrir menu" });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    return page.getByRole("dialog", { name: "Menu principal" });
  }

  return page.getByRole("navigation", { name: "Navegação principal" });
}

async function loadAllCatalogImages(page: Page) {
  const cards = page.getByTestId("catalog-grid").locator("[data-product-card]");
  const count = await cards.count();

  for (let index = 0; index < count; index += 1) {
    const image = cards.nth(index).getByRole("img");
    await cards.nth(index).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(0);
    await image.evaluate((element: HTMLImageElement) => element.decode());
    await expect(image).toHaveCSS("opacity", "1");
  }

  await page.waitForTimeout(250);
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0 }));
}

test("home, rotas, histórico e links com hash permanecem funcionais", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntime(page);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "iPhone 17 Pro Max." }),
  ).toBeVisible();
  await expect(page.locator("#loja [data-product-card]")).toHaveCount(
    products.length,
  );

  await page.getByRole("link", { name: "Configurar" }).click();
  await expect(page).toHaveURL(/\/iphones#iphone-17-pro-max$/);
  await expect(
    page.locator('[data-testid="catalog-grid"] #iphone-17-pro-max'),
  ).toBeInViewport();

  await page.goto("/");

  await page.getByRole("link", { name: "Ver catálogo" }).click();
  await expect(page).toHaveURL(/\/iphones$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Escolha seu iPhone." }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/iphones$/);

  const navigation = await openPrimaryNavigation(page);
  await navigation.getByRole("link", { name: "Como escolher", exact: true }).click();
  await expect(page).toHaveURL(/\/#escolha$/);
  await expect(page.locator("#escolha")).toBeInViewport();

  await page.goto("/rota-que-nao-existe");
  await expect(
    page.getByRole("heading", { name: "Esta página não foi encontrada." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver iPhones" })).toHaveAttribute(
    "href",
    "/iphones",
  );

  expect(runtimeErrors).toEqual([]);
});

test("catálogo usa a fonte real e atualiza toda a configuração", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntime(page);
  const product = products.find((item) => item.id === "iphone-17-pro-max")!;
  const blue = product.finishes.find((finish) => finish.id === "blue")!;
  const bluePrice256 = blue.pricesUSD["256gb"]!;
  const bluePrice512 = blue.pricesUSD["512gb"]!;

  await page.goto("/iphones");

  const catalog = page.getByTestId("catalog-grid");
  const cards = catalog.locator("[data-product-card]");
  await expect(cards).toHaveCount(products.length);

  for (const item of products) {
    await expect(
      catalog.locator(`[data-product-id="${item.id}"]`),
    ).toHaveCount(1);
  }

  const card = catalog.locator('[data-product-id="iphone-17-pro-max"]');
  await expect(card.getByRole("img")).toHaveAttribute(
    "alt",
    "iPhone 17 Pro Max em Laranja Cósmico",
  );
  await expect(card.getByRole("button", { name: "256 GB" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await card.getByRole("button", { name: "Selecionar Azul Profundo" }).click();
  await expect(
    card.getByRole("img", { name: "iPhone 17 Pro Max em Azul Profundo" }),
  ).toBeVisible();
  await expect(
    card.getByRole("img", { name: "iPhone 17 Pro Max em Laranja Cósmico" }),
  ).toHaveCount(0);
  await expect(card).toContainText(
    formatBRL(convertUSDToBRL(bluePrice256)),
  );

  await card.getByRole("button", { name: "512 GB" }).click();
  await expect(card.getByRole("button", { name: "512 GB" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(card).toContainText(
    formatBRL(convertUSDToBRL(bluePrice512)),
  );

  await expect(
    page.locator(
      'a[href*="wa.me"], a[href*="whatsapp" i], a[href^="/iphones/"]',
    ),
  ).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(
    /24x|sem juros|preço final|valor final|em estoque/i,
  );

  expect(runtimeErrors).toEqual([]);
});

test("layout respeita viewport, toque e redução de movimento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iphones");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const scrollBehavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(scrollBehavior).toBe("auto");

  const controls = page
    .getByTestId("catalog-grid")
    .locator('[data-product-card] button');
  const count = await controls.count();

  for (let index = 0; index < count; index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(43.5);
  }
});

test("menu mobile gerencia foco, escape e navegação", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");
  const menuButton = page.locator('button[aria-controls="mobile-navigation"]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const dialog = page.getByRole("dialog", { name: "Menu principal" });
  await expect(dialog.getByRole("link", { name: "iPhones", exact: true })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  await dialog.getByRole("link", { name: "iPhones", exact: true }).click();
  await expect(page).toHaveURL(/\/iphones$/);
  await expect(
    page.getByRole("button", { name: "Abrir menu" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("catálogo mantém baselines visuais aprováveis", async ({ page }, testInfo) => {
  await page.goto("/iphones");
  await expect(page.getByTestId("catalog-grid")).toBeVisible();
  await loadAllCatalogImages(page);
  await expect(page).toHaveScreenshot("iphones-page.png", {
    fullPage: testInfo.project.name === "desktop-chromium",
  });

  if (testInfo.project.name === "mobile-chromium") {
    const lastCard = page
      .getByTestId("catalog-grid")
      .locator('[data-product-id="iphone-15"]');
    await lastCard.scrollIntoViewIfNeeded();
    await expect(lastCard.getByRole("img")).toBeVisible();
    await expect(lastCard).toHaveScreenshot("iphone-15-mobile.png");
  }

  const card = page
    .getByTestId("catalog-grid")
    .locator('[data-product-id="iphone-17-pro-max"]');
  await card.getByRole("button", { name: "Selecionar Azul Profundo" }).click();
  await expect(
    card.getByRole("img", { name: "iPhone 17 Pro Max em Azul Profundo" }),
  ).toBeVisible();
  await expect(
    card.getByRole("img", { name: "iPhone 17 Pro Max em Laranja Cósmico" }),
  ).toHaveCount(0);
  await expect(card).toHaveScreenshot("iphone-17-pro-max-blue.png");
});

test("menu mobile possui baseline visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu principal" })).toHaveScreenshot(
    "mobile-menu.png",
  );
});
