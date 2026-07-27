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

  test("event API defaults to zero-egress local mode and rejects writes", async ({
    request,
  }) => {
    const statusResponse = await request.get(
      `${baseUrl}/api/xmp/events?correlationId=CLS-A301-20260728-SEED`,
    );
    expect(statusResponse.status()).toBe(200);
    expect(statusResponse.headers()["x-xmp-privacy"]).toBe(
      "event-metadata-only",
    );
    const status = await statusResponse.json();
    expect(status).toMatchObject({
      mode: "local-only",
      configured: false,
      authenticated: false,
      writable: false,
      reason: "local-mode",
      events: [],
    });

    const writeResponse = await request.post(`${baseUrl}/api/xmp/events`, {
      data: {
        id: "46c5751a-1119-44d1-89a7-7daf66d631f2",
        correlationId: "CLS-A301-20260728-SEED",
        kind: "classroom.started",
        domain: "classroom",
        title: "不应写入",
        detail: "默认模式必须在解析和数据库访问之前拒绝写入。",
        actor: "验收脚本",
        entity: "本地浏览器",
        occurredAt: "2026-07-28T09:20:00+08:00",
        privacy: "aggregate",
        source: "local-interaction",
      },
    });
    expect(writeResponse.status()).toBe(503);
    expect(await writeResponse.json()).toMatchObject({
      error: { code: "LOCAL_ONLY" },
    });
  });

  test("classroom and growth actions persist in one correlated local event chain", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("xmp-e2e-event-seeded")) {
        window.localStorage.removeItem("xmp-local-event-stream-v1");
        window.localStorage.removeItem("xmp-classroom-runtime-v1");
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
    await expect(
      dialog.getByRole("region", { name: "事件同步状态" }),
    ).toContainText("本地优先");
    await expect(dialog.getByText("关闭 · 零外发")).toBeVisible();
    await expect(dialog.getByText("幂等 · 仅追加")).toBeVisible();
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

  test("critical heartbeat loss safely pauses the class and recovers across modules", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("xmp-runtime-fault-seeded")) {
        window.localStorage.removeItem("xmp-classroom-runtime-v1");
        window.sessionStorage.setItem("xmp-runtime-fault-seeded", "1");
      }
    });

    await page.goto(`${baseUrl}/xmp/classroom`, {
      waitUntil: "domcontentloaded",
    });
    const trustRegion = page.getByRole("region", {
      name: "课堂会话可信状态",
    });
    await expect(trustRegion).toContainText("4/4 已验证");
    await expect(trustRegion).toContainText("HEALTHY");

    await page.getByRole("button", { name: "开始课堂" }).last().click();
    await page.getByRole("button", { name: "多端" }).click();
    await page.getByRole("button", { name: "模拟 E-01 断线" }).click();

    await expect(trustRegion).toContainText("OFFLINE");
    await expect(trustRegion).toContainText("静默 · AI 已停止");
    await expect(page.getByRole("button", { name: "继续课堂" })).toBeDisabled();
    await expect(page.getByText("断线演练")).toBeVisible();

    await page.goto(`${baseUrl}/xmp/fleet`, {
      waitUntil: "domcontentloaded",
    });
    const runtimeRegion = page.getByRole("region", {
      name: "课堂运行时联动",
    });
    await expect(runtimeRegion).toContainText("安全暂停");
    await expect(runtimeRegion).toContainText("3/4 在线");
    await page.getByRole("button", { name: "恢复 E-01 可信心跳" }).click();
    await expect(runtimeRegion).toContainText("4/4 在线");
    await expect(runtimeRegion).toContainText("静默降级");

    await page.goto(`${baseUrl}/xmp/classroom`, {
      waitUntil: "domcontentloaded",
    });
    const recoveredTrust = page.getByRole("region", {
      name: "课堂会话可信状态",
    });
    await expect(recoveredTrust).toContainText("HEALTHY");
    await expect(recoveredTrust).toContainText("静默 · AI 已停止");
    await page.getByRole("button", { name: "继续课堂" }).click();
    await expect(page.getByRole("button", { name: "暂停课堂" })).toBeVisible();
    await page.getByRole("button", { name: "教学模式" }).click();
    await expect(recoveredTrust).toContainText("教师掌舵 · AI 可建议");
  });

  test("teacher takeover isolates AI until explicit release", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("xmp-takeover-seeded")) {
        window.localStorage.removeItem("xmp-classroom-runtime-v1");
        window.sessionStorage.setItem("xmp-takeover-seeded", "1");
      }
    });

    await page.goto(`${baseUrl}/xmp/classroom`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("button", { name: "开始课堂" }).last().click();
    await page.getByRole("button", { name: "安全接管" }).click();
    const dialog = page.getByRole("dialog", { name: "课堂安全接管" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "确认接管" }).click();

    await expect(page.getByRole("status")).toContainText("文老师正在人工接管");
    await expect(
      page.getByRole("region", { name: "课堂会话可信状态" }),
    ).toContainText("人工接管 · AI 已隔离");
    await expect(page.getByRole("button", { name: "继续课堂" })).toBeDisabled();

    await page.getByRole("button", { name: "释放接管，保持暂停" }).click();
    await expect(page.getByRole("status")).toBeHidden();
    await expect(page.getByRole("button", { name: "继续课堂" })).toBeEnabled();
    await expect(
      page.getByRole("region", { name: "课堂会话可信状态" }),
    ).toContainText("静默 · AI 已停止");
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
