import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";
import {
  HERO_3D_ASSETS,
  HERO_3D_MANIFEST,
  HERO_ANNOTATIONS,
  getActiveHeroAnnotations,
  getHeroChapter,
  type HeroChapterId,
} from "../../src/data/hero3d";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const storySelector = '[data-hero-mode="prototype-3d"]';
const experienceSelector = ".hero-3d-experience[data-hero-3d-state]";
const canvasSelector = ".hero-3d-canvas";
const calloutSelector = ".hero-3d-indicator.is-active";
const chapterProgress = [0.025, 0.2, 0.38, 0.56, 0.72, 0.87, 0.975];

function monitorRuntime(page: Page) {
  const errors: string[] = [];
  const localRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//.test(request.url())) {
      localRequests.push(request.url());
    }
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText;
    if (
      /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//.test(
        request.url(),
      ) &&
      failure !== "net::ERR_ABORTED"
    ) {
      errors.push(`${request.method()} ${request.url()} ${failure}`);
    }
  });

  return { errors, localRequests };
}

function isHero3DResource(url: string) {
  return (
    url.includes(HERO_3D_ASSETS.modelUrl) ||
    url.includes(HERO_3D_ASSETS.environmentUrl) ||
    /Hero3DCanvas-[^/]+\.js(?:\?|$)/.test(url)
  );
}

async function waitForReady(page: Page) {
  const experience = page.locator(experienceSelector);
  const canvas = page.locator(canvasSelector);

  await expect(experience).toHaveAttribute("data-hero-3d-state", "ready", {
    timeout: 60_000,
  });
  await expect(canvas).toHaveAttribute("data-hero-3d-first-frame", "true", {
    timeout: 20_000,
  });
  await expect(canvas).toHaveAttribute("data-hero-3d-settled", "true", {
    timeout: 20_000,
  });
  await expect(canvas.locator("canvas")).toHaveCount(1);
}

async function waitForAnimationFrames(page: Page, frameCount = 2) {
  await page.evaluate(async (count) => {
    for (let frame = 0; frame < count; frame += 1) {
      await new Promise<void>((resolveFrame) => {
        requestAnimationFrame(() => resolveFrame());
      });
    }
  }, frameCount);
}

async function setInstantScroll(page: Page, targetY: number) {
  await page.evaluate(async (nextY) => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo({ top: nextY, left: 0, behavior: "auto" });

    // Keep the override until the browser has committed the scroll. Restoring
    // it synchronously can leave a global `scroll-behavior: smooth` animation
    // queued and make a later assertion fight an old scroll command.
    await new Promise<void>((resolveFrame) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame()));
    });
    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;
  }, targetY);
}

async function scrollToProgress(
  page: Page,
  progress: number,
  options: {
    chapter?: HeroChapterId;
  } = {},
) {
  const boundedProgress = Math.min(1, Math.max(0, progress));
  const canvas = page.locator(canvasSelector);

  const targetY = await page.evaluate(
    ({ selector, targetProgress }) => {
      const story = document.querySelector<HTMLElement>(selector);
      if (!story) throw new Error(`Hero 3D ausente: ${selector}`);
      const storyTop = window.scrollY + story.getBoundingClientRect().top;
      const travel = Math.max(story.scrollHeight - window.innerHeight, 1);
      return storyTop + travel * targetProgress;
    },
    { selector: storySelector, targetProgress: boundedProgress },
  );
  await setInstantScroll(page, targetY);

  // First require the rendered scene to reach the destination, then require a
  // settled frame. Checking `settled` first can accidentally consume the old
  // state before the scroll MotionValue has emitted its change event.
  await expect
    .poll(
      async () => {
        const value = Number(await canvas.getAttribute("data-hero-3d-progress"));
        return Number.isFinite(value)
          ? Math.abs(value - boundedProgress)
          : Number.POSITIVE_INFINITY;
      },
      { timeout: 30_000 },
    )
    .toBeLessThanOrEqual(0.018);
  await expect(canvas).toHaveAttribute("data-hero-3d-settled", "true", {
    timeout: 30_000,
  });
  await expect(canvas).toHaveAttribute(
    "data-hero-3d-chapter",
    options.chapter ?? getHeroChapter(boundedProgress),
  );
}

function getExpectedCalloutTitles(progress: number, mobile: boolean) {
  const activeIds = new Set(getActiveHeroAnnotations(progress, mobile));
  return HERO_ANNOTATIONS.filter((annotation) => activeIds.has(annotation.id))
    .map((annotation) => annotation.title)
    .sort();
}

async function expectActiveCallouts(
  page: Page,
  progress: number,
  mobile: boolean,
) {
  const expectedTitles = getExpectedCalloutTitles(progress, mobile);
  const callouts = page.locator(calloutSelector);

  await expect
    .poll(
      async () =>
        (
          await callouts.locator("strong").allTextContents()
        ).sort(),
      { timeout: 12_000 },
    )
    .toEqual(expectedTitles);
  return expectedTitles;
}

async function expectCalloutsInsideViewport(page: Page) {
  const callouts = page.locator(calloutSelector);
  const count = await callouts.count();

  for (let index = 0; index < count; index += 1) {
    await expect
      .poll(async () =>
        callouts.nth(index).evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const width = document.documentElement.clientWidth;
          const height = document.documentElement.clientHeight;
          const overflow = Math.max(
            0,
            -bounds.left,
            bounds.right - width,
            -bounds.top,
            bounds.bottom - height,
          );
          return {
            visible:
              bounds.width > 1 &&
              bounds.height > 1 &&
              Number(style.opacity) >= 0.98 &&
              style.visibility === "visible",
            overflow,
          };
        }),
      )
      .toEqual({ visible: true, overflow: 0 });
  }
}

async function startCalloutSampling(page: Page) {
  await page.evaluate((selector) => {
    type Sample = { at: number; titles: string[] };
    const browserWindow = window as typeof window & {
      __heroSamples?: Sample[];
      __heroSampleFrame?: number;
    };
    browserWindow.__heroSamples = [];
    let previous = "__initial__";
    const sample = () => {
      const titles = Array.from(
        document.querySelectorAll<HTMLElement>(`${selector} strong`),
        (element) => element.textContent?.trim() ?? "",
      )
        .filter(Boolean)
        .sort();
      const value = titles.join("|");
      if (value !== previous) {
        previous = value;
        browserWindow.__heroSamples?.push({
          at: performance.now(),
          titles,
        });
      }
      browserWindow.__heroSampleFrame = requestAnimationFrame(sample);
    };
    sample();
  }, calloutSelector);
}

async function stopCalloutSampling(page: Page) {
  return page.evaluate((selector) => {
    const browserWindow = window as typeof window & {
      __heroSamples?: Array<{ at: number; titles: string[] }>;
      __heroSampleFrame?: number;
    };
    if (browserWindow.__heroSampleFrame !== undefined) {
      cancelAnimationFrame(browserWindow.__heroSampleFrame);
    }
    const finalTitles = Array.from(
      document.querySelectorAll<HTMLElement>(`${selector} strong`),
      (element) => element.textContent?.trim() ?? "",
    )
      .filter(Boolean)
      .sort();
    const samples = browserWindow.__heroSamples ?? [];
    if (
      samples.at(-1)?.titles.join("|") !== finalTitles.join("|")
    ) {
      samples.push({ at: performance.now(), titles: finalTitles });
    }
    return samples;
  }, calloutSelector);
}

test.describe("hero 3D", () => {
  test("é a experiência padrão independentemente da query", async ({ page }) => {
    for (const path of ["/", "/?hero3d=0", "/?hero3d=1"]) {
      await page.goto(path);
      await expect(page.locator(storySelector)).toHaveCount(1);
      await expect(page.locator(experienceSelector)).toHaveAttribute(
        "data-hero-3d-state",
        /poster|loading|ready/,
      );
    }
  });

  test("atalho libera a narrativa e posiciona os destaques", async ({ page }) => {
    await page.goto("/?hero3d=1");
    const skip = page.getByRole("link", { name: "Pular para os modelos" });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(page).toHaveURL(/\/#destaques$/);
    await expect(page.locator("#destaques")).toBeInViewport();
  });

  test("percorre início, meio, fim e retorno com callouts estáveis", async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const runtime = monitorRuntime(page);
    const mobile = testInfo.project.name.includes("mobile");

    await page.goto("/?hero3d=1");
    await waitForReady(page);

    for (const progress of chapterProgress) {
      await scrollToProgress(page, progress);
      await expectActiveCallouts(page, progress, mobile);
      expect(await page.locator(calloutSelector).count()).toBeLessThanOrEqual(
        mobile ? 1 : 2,
      );
      await expectCalloutsInsideViewport(page);
    }
    await scrollToProgress(page, 1, { chapter: "outro" });
    await expect(
      page.getByRole("link", { name: "Conhecer o iPhone 17 Pro Max" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ver todos os iPhones" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Pular para os modelos" }),
    ).toHaveCount(0);
    const catalogY = await page.evaluate(
      () => window.scrollY + window.innerHeight * 0.6,
    );
    await setInstantScroll(page, catalogY);
    await expect(page.locator("#destaques")).toBeInViewport();

    for (const progress of [...chapterProgress].reverse()) {
      await scrollToProgress(page, progress);
      await expectActiveCallouts(page, progress, mobile);
      await expectCalloutsInsideViewport(page);
    }

    await expect(page.locator(canvasSelector)).toHaveAttribute(
      "data-hero-3d-chapter",
      "intro",
    );
    expect(runtime.errors).toEqual([]);
  });

  test("todos os callouts aparecem no ponto correto sem clipping", async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const mobile = testInfo.project.name.includes("mobile");
    await page.goto("/?hero3d=1");
    await waitForReady(page);

    for (const annotation of HERO_ANNOTATIONS) {
      const progress = (annotation.range[0] + annotation.range[1]) / 2;
      const expected = getActiveHeroAnnotations(progress, mobile);
      await scrollToProgress(page, progress, {
        chapter: getHeroChapter(progress),
      });
      await expectActiveCallouts(page, progress, mobile);
      await expect(page.locator(calloutSelector)).toHaveCount(expected.length);
      await expectCalloutsInsideViewport(page);
    }
  });

  test("scroll forte não exibe callouts intermediários", async ({
    page,
  }, testInfo) => {
    const mobile = testInfo.project.name.includes("mobile");
    const destination = 0.885;
    const expectedTitles = getExpectedCalloutTitles(destination, mobile);

    await page.goto("/?hero3d=1");
    await waitForReady(page);
    await scrollToProgress(page, 0.025);
    await startCalloutSampling(page);
    await scrollToProgress(page, destination, {
      chapter: "front",
    });
    await expectActiveCallouts(page, destination, mobile);
    await waitForAnimationFrames(page);
    const samples = await stopCalloutSampling(page);
    const observed = new Set(samples.flatMap((sample) => sample.titles));

    for (const title of observed) expect(expectedTitles).toContain(title);
    expect(
      samples.some(
        (sample) => sample.titles.join("|") === expectedTitles.join("|"),
      ),
    ).toBe(true);
    await expectCalloutsInsideViewport(page);
  });

  test("scroll contínuo não abre lacunas entre callouts", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/?hero3d=1");
    await waitForReady(page);
    const observed = new Set<string>();

    for (const progress of [0.38, 0.46, 0.502, 0.56, 0.648, 0.665, 0.7, 0.72]) {
      await test.step(`progresso ${progress}`, async () => {
        await scrollToProgress(page, progress);
        await expect
          .poll(async () => page.locator(calloutSelector).count())
          .toBeGreaterThan(0);
        const titles = await page
          .locator(`${calloutSelector} strong`)
          .allTextContents();
        titles.forEach((title) => observed.add(title));
        await expectCalloutsInsideViewport(page);
      });
    }

    expect(observed.size).toBeGreaterThanOrEqual(3);
  });

  test("recarregar no fim reinicia a experiência no topo", async ({ page }) => {
    await page.goto("/?hero3d=1");
    await waitForReady(page);
    await scrollToProgress(page, 0.975, { chapter: "outro" });
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await page.reload();
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeLessThanOrEqual(1);
    await waitForReady(page);
    await expect(page.locator(canvasSelector)).toHaveAttribute(
      "data-hero-3d-chapter",
      "intro",
    );
    expect(
      Number(
        await page
          .locator(canvasSelector)
          .getAttribute("data-hero-3d-progress"),
      ),
    ).toBeLessThanOrEqual(0.01);
  });

  test("canvas não redimensiona nem apaga durante o scroll", async ({ page }) => {
    await page.goto("/?hero3d=1");
    await waitForReady(page);
    const canvas = page.locator(`${canvasSelector} canvas`);
    const initial = await canvas.evaluate((element) => {
      const target = element as HTMLCanvasElement;
      const browserWindow = window as typeof window & {
        __heroCanvasSizes?: Array<{ width: number; height: number }>;
      };
      browserWindow.__heroCanvasSizes = [];
      new MutationObserver(() => {
        browserWindow.__heroCanvasSizes?.push({
          width: target.width,
          height: target.height,
        });
      }).observe(target, {
        attributes: true,
        attributeFilter: ["width", "height"],
      });
      return { width: target.width, height: target.height };
    });

    await scrollToProgress(page, 0.38, { chapter: "rear" });
    await page.waitForTimeout(500);
    const sizes = await page.evaluate(() => {
      const browserWindow = window as typeof window & {
        __heroCanvasSizes?: Array<{ width: number; height: number }>;
      };
      return browserWindow.__heroCanvasSizes ?? [];
    });
    expect(sizes.every((size) => size.width === initial.width)).toBe(true);
    expect(sizes.every((size) => size.height === initial.height)).toBe(true);
  });

  test("texto e linha permanecem visíveis durante a transição", async ({
    page,
  }) => {
    await page.goto("/?hero3d=1");
    await waitForReady(page);
    await scrollToProgress(page, 0.38, { chapter: "rear" });

    const narrative = page.locator(".hero-3d-narrative");
    await expect(narrative).toHaveClass(/is-visible/);
    const line = page.locator(
      `${calloutSelector} .hero-3d-indicator-line`,
    );
    await expect(line).toHaveCount(1);
    await expect(line).toBeVisible();
    await expect
      .poll(async () =>
        line.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeGreaterThan(20);
    const lineSize = await line.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { height: bounds.height };
    });
    expect(lineSize.height).toBeLessThanOrEqual(1);

    const indicator = page.locator(".hero-3d-indicator");
    await expect(indicator).toHaveClass(/is-facing/);
    await expect(page.locator(".hero-3d-detail-summary")).toContainText(
      "Três câmeras Fusion de 48 MP.",
    );

    const narrativeSurface = await narrative.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        borderTopWidth: styles.borderTopWidth,
        boxShadow: styles.boxShadow,
      };
    });
    expect(narrativeSurface.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(narrativeSurface.borderTopWidth).toBe("0px");
    expect(narrativeSurface.boxShadow).toBe("none");

    await page.evaluate(() => {
      const target = document.querySelector(".hero-3d-narrative");
      const browserWindow = window as typeof window & {
        __heroNarrativeHidden?: boolean;
      };
      browserWindow.__heroNarrativeHidden = false;
      if (!target) return;
      new MutationObserver(() => {
        if (!target.classList.contains("is-visible")) {
          browserWindow.__heroNarrativeHidden = true;
        }
      }).observe(target, { attributes: true, attributeFilter: ["class"] });
    });
    await scrollToProgress(page, 0.72, { chapter: "action-side" });
    expect(
      await page.evaluate(() => {
        const browserWindow = window as typeof window & {
          __heroNarrativeHidden?: boolean;
        };
        return browserWindow.__heroNarrativeHidden;
      }),
    ).toBe(false);
    await expect(narrative).toHaveClass(/is-visible/);
    await expect(
      page.locator(`${calloutSelector} .hero-3d-indicator-line`),
    ).toBeVisible();
  });

  test("reduced motion mantém conteúdo estático sem baixar a pilha 3D", async ({
    page,
  }) => {
    const runtime = monitorRuntime(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?hero3d=1");

    await expect(page.locator(experienceSelector)).toHaveAttribute(
      "data-hero-3d-state",
      "poster",
    );
    await expect(page.locator(canvasSelector)).toHaveCount(0);
    await expect(page.locator(".hero-3d-experience li")).toHaveCount(
      HERO_ANNOTATIONS.length,
    );
    await expect(
      page.getByRole("link", { name: "Conhecer o iPhone 17 Pro Max" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ver todos os iPhones" }).first(),
    ).toBeVisible();
    await expect
      .poll(async () =>
        page.locator(storySelector).evaluate(
          (element) => element.getBoundingClientRect().height / window.innerHeight,
        ),
      )
      .toBeLessThanOrEqual(1.05);
    await page.waitForLoadState("networkidle");
    expect(runtime.localRequests.filter(isHero3DResource)).toEqual([]);
    expect(runtime.errors).toEqual([]);
  });

  test("falha do modelo preserva poster e retry recupera", async ({ page }) => {
    let failModel = true;
    await page.route(`**${HERO_3D_ASSETS.modelUrl}*`, async (route) => {
      if (failModel) {
        await route.fulfill({ status: 503, body: "modelo indisponível" });
      } else {
        await route.continue();
      }
    });

    await page.goto("/?hero3d=1");
    await expect(page.locator(experienceSelector)).toHaveAttribute(
      "data-hero-3d-state",
      "error",
      { timeout: 30_000 },
    );
    await expect(
      page.getByText("Visualização 3D indisponível", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".hero-3d-poster img")).toBeVisible();
    await expect(page.locator(".hero-3d-poster")).not.toHaveClass(/is-hidden/);

    failModel = false;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await waitForReady(page);
  });

  test(
    "hard budgets protegem build pública, ativos e chunk 3D",
    async ({}, testInfo) => {
      test.skip(testInfo.project.name.includes("mobile"));
      test.setTimeout(180_000);

      const publicBuildRoot = testInfo.outputPath("public-build-root");
      const publicOutput = resolve(publicBuildRoot, "dist");
      mkdirSync(publicBuildRoot, { recursive: true });
      execFileSync(
        resolve(repositoryRoot, "node_modules/.bin/vite"),
        ["build", repositoryRoot, "--outDir", publicOutput, "--emptyOutDir"],
        {
          cwd: publicBuildRoot,
          stdio: "pipe",
          maxBuffer: 10 * 1024 * 1024,
        },
      );
      expect(
        existsSync(resolve(publicOutput, "models/iphone-17-pro-max")),
      ).toBe(true);

      const publicFile = (url: string) =>
        resolve(repositoryRoot, "public", url.replace(/^\//, ""));
      const modelBytes = statSync(publicFile(HERO_3D_ASSETS.modelUrl)).size;
      const environmentBytes = statSync(
        publicFile(HERO_3D_ASSETS.environmentUrl),
      ).size;
      const posterBytes = statSync(publicFile(HERO_3D_ASSETS.posterUrl)).size;

      expect(modelBytes).toBe(HERO_3D_MANIFEST.asset.bytes);
      expect(modelBytes).toBeLessThanOrEqual(1_000_000);
      expect(
        HERO_3D_MANIFEST.asset.decodedTextureBudgetBytes,
      ).toBeLessThanOrEqual(6_000_000);
      expect(environmentBytes).toBeLessThanOrEqual(150_000);
      expect(posterBytes).toBeLessThanOrEqual(1_000_000);
      expect(modelBytes + environmentBytes + posterBytes).toBeLessThanOrEqual(
        2_000_000,
      );

      const lod0Path = resolve(
        repositoryRoot,
        "public/models/iphone-17-pro-max/apple-user-remastered-lod0.glb",
      );
      if (existsSync(lod0Path)) {
        expect(statSync(lod0Path).size).toBeLessThanOrEqual(2_500_000);
      }
      const compactEnvironmentPath = resolve(
        repositoryRoot,
        "public/models/iphone-17-pro-max/studio_small_08_256.hdr",
      );
      if (existsSync(compactEnvironmentPath)) {
        expect(statSync(compactEnvironmentPath).size).toBeLessThanOrEqual(
          150_000,
        );
      }

      const assetsDirectory = resolve(repositoryRoot, "dist/assets");
      const canvasChunk = readdirSync(assetsDirectory).find((file) =>
        /^Hero3DCanvas-[^/]+\.js$/.test(file),
      );
      expect(canvasChunk).toBeTruthy();
      const canvasSource = readFileSync(resolve(assetsDirectory, canvasChunk!));
      expect(canvasSource.byteLength).toBeLessThanOrEqual(1_200_000);
      expect(gzipSync(canvasSource).byteLength).toBeLessThanOrEqual(350_000);
    },
  );
});
