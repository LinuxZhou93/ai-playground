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
        page.getByText("本地产品演示", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: new RegExp(heading) }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("investor demo room walks through all six acts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/xmp`, { waitUntil: "domcontentloaded" });
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
