import { expect, test } from "@playwright/test";

const baseUrl = process.env.XMP_BASE_URL ?? "http://127.0.0.1:3000";

test.use({ channel: "chrome" });

const modules = [
  ["/xmp", "让每一次课堂"],
  ["/xmp/curriculum", "把一个好想法"],
  ["/xmp/classroom", "一颗沉睡的种子"],
  ["/xmp/companion", "不是陪孩子盯着屏幕"],
  ["/xmp/growth", "成长结论"],
  ["/xmp/family", "把课堂带回家"],
  ["/xmp/fleet", "每一台设备都可见"],
  ["/xmp/operations", "让每一次交付"],
  ["/xmp/governance", "儿童数据不是资产池"],
] as const;

test.describe("XMP local operating system", () => {
  for (const [path, heading] of modules) {
    test(`${path} renders the integrated product shell`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      const response = await page.goto(`${baseUrl}${path}`, {
        waitUntil: "domcontentloaded",
      });

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/XMP 奇妙伙伴/);
      await expect(
        page.getByRole("navigation", { name: "XMP 产品模块" }),
      ).toBeVisible();
      await expect(
        page.getByText("本地演示数据", { exact: true }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: new RegExp(heading) }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("snapshot API is aggregate-only and data source center explains the boundary", async ({
    page,
    request,
  }) => {
    const response = await request.get(`${baseUrl}/api/xmp/snapshot`);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-xmp-privacy"]).toBe("aggregate-only");

    const snapshot = await response.json();
    expect(snapshot.mode).toBe("demo");
    expect(snapshot.privacy).toEqual({
      aggregateOnly: true,
      writesAllowed: false,
      containsChildIdentity: false,
    });
    expect(JSON.stringify(snapshot)).not.toContain("phone");
    expect(JSON.stringify(snapshot)).not.toContain("parent_name");

    await page.goto(`${baseUrl}/xmp`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /DEMO DATA/ }).click();
    const dialog = page.getByRole("dialog", { name: "数据源与安全边界" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("不可跨越的安全边界")).toBeVisible();
    await expect(
      dialog.getByText(/不含幼儿姓名\/电话\/原始音视频/),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "重新检查" }).click();
    await expect(dialog.getByText("本地演示数据")).toBeVisible();
  });

  test("classroom and growth actions persist in one correlated local event chain", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("xmp-e2e-event-seeded")) {
        window.localStorage.removeItem("xmp-local-event-stream-v1");
        window.sessionStorage.setItem("xmp-e2e-event-seeded", "1");
      }
    });

    let snapshotReady = page.waitForResponse(
      (response) =>
        response.url().includes("/api/xmp/snapshot") && response.ok(),
    );
    await page.goto(`${baseUrl}/xmp/classroom`, {
      waitUntil: "domcontentloaded",
    });
    await snapshotReady;

    await page.getByRole("button", { name: "开始课堂" }).last().click();
    await page.getByRole("button", { name: "加入待审核" }).click();
    await page.getByRole("button", { name: /打开教学闭环事件链/ }).click();

    let dialog = page.getByRole("dialog", { name: "教学闭环事件链" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("教师开始课堂")).toBeVisible();
    await expect(dialog.getByText("教师将匿名事件加入证据候选")).toBeVisible();
    await expect(dialog.getByText("CLS-A301-20260728-SEED")).toBeVisible();
    await dialog.getByRole("button", { name: "关闭事件链" }).click();

    snapshotReady = page.waitForResponse(
      (response) =>
        response.url().includes("/api/xmp/snapshot") && response.ok(),
    );
    await page.goto(`${baseUrl}/xmp/growth`, {
      waitUntil: "domcontentloaded",
    });
    await snapshotReady;
    await page.getByRole("button", { name: /教师确认并入档/ }).click();
    await page.getByRole("button", { name: /打开教学闭环事件链/ }).click();

    dialog = page.getByRole("dialog", { name: "教学闭环事件链" });
    await expect(dialog.getByText("教师确认成长证据")).toBeVisible();
    await expect(dialog.getByText(/条本地记录/)).toBeVisible();
  });

  test("investor demo room walks through all six acts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const snapshotReady = page.waitForResponse(
      (response) =>
        response.url().includes("/api/xmp/snapshot") && response.ok(),
    );
    await page.goto(`${baseUrl}/xmp`, { waitUntil: "domcontentloaded" });
    await snapshotReady;
    await page.getByRole("button", { name: /启动 12 分钟完整演示/ }).click();

    const dialog = page.getByRole("dialog", { name: "XMP 融资级产品演示" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("01 · 系统机会")).toBeVisible();

    for (let step = 0; step < 5; step += 1) {
      await dialog.getByRole("button", { name: /下一幕/ }).click();
    }

    await expect(dialog.getByText("COMMERCIAL ENGINE")).toBeVisible();
    await expect(dialog.getByText("园所软件订阅")).toBeVisible();
    await expect(dialog.getByText("边缘硬件与设备")).toBeVisible();
    await expect(
      dialog.getByText("实施与课程服务", { exact: true }),
    ).toBeVisible();

    const chapterNav = dialog.getByRole("navigation", { name: "演示章节" });
    const activeChapter = dialog.getByRole("button", {
      name: /06 · 信任门槛/,
    });
    const [navBox, chapterBox] = await Promise.all([
      chapterNav.boundingBox(),
      activeChapter.boundingBox(),
    ]);
    expect(navBox).not.toBeNull();
    expect(chapterBox).not.toBeNull();
    expect(chapterBox!.x).toBeGreaterThanOrEqual(navBox!.x);
    expect(chapterBox!.x + chapterBox!.width).toBeLessThanOrEqual(
      navBox!.x + navBox!.width + 1,
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
