import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("invoice case requires evidence and preserves verified progress across reloads", async ({
  page,
}) => {
  await page.goto("/playground/missions");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Sandbox path" })
    .fill("/invoices/4112");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(page.locator(".mission-response")).toContainText(
    "Harbor Design",
  );
  await page.getByLabel("Invoice detail policy").selectOption("owner");
  await page.getByLabel("Collection query scope").selectOption("owner");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await page.getByRole("button", { name: "Run regression suite" }).click();
  await expect(
    page.getByRole("heading", { name: "6 / 6 checks passed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toHaveCount(0);
  await page
    .getByLabel(
      "Authentication is being treated as permission to access every resource.",
    )
    .check();
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export investigation" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "cybervalue-invoice-case-1.md",
  );
  await page.getByLabel("Collection query scope").selectOption("all");
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toHaveCount(0);
});

test("checkout investigation supports freeform cart editing and verifies a complete fix", async ({
  page,
}) => {
  await page.goto("/playground/missions#mission/checkout");
  await expect(
    page.getByRole("heading", { name: "The one-cent order", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  const body = page.getByRole("textbox", { name: "JSON request body" });
  const cart = JSON.parse(await body.inputValue());
  await body.fill(JSON.stringify({ ...cart, unitPrice: 1 }));
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(page.locator(".mission-response")).toContainText('"total": 1');
  await page.getByLabel("Source of unit price").selectOption("catalog");
  await page.getByLabel("Quantity validation").selectOption("bounded");
  await page.getByLabel("Coupon application").selectOption("once");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await page.getByRole("button", { name: "Run regression suite" }).click();
  await expect(
    page.getByRole("heading", { name: "8 / 8 checks passed" }),
  ).toBeVisible();
  await page
    .getByLabel("Client-controlled fields are being trusted as business rules.")
    .check();
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toBeVisible();
});

test("webhook retries need stable IDs; body comparison fails the changed-metadata regression", async ({
  page,
}) => {
  await page.goto("/playground/missions#mission/webhook");
  const send = page.getByRole("button", { name: "Send request", exact: true });
  await send.click();
  await send.click();
  await expect(page.locator(".mission-deliveries")).toHaveText("2 deliveries");
  await page.getByLabel("Provider verification").selectOption("verify");
  await page.getByLabel("Deduplication strategy").selectOption("body");
  await page.getByRole("button", { name: "Run regression suite" }).click();
  await expect(page.locator(".test-fail")).toContainText(
    "Retry with changed metadata is still a duplicate",
  );
  await page.getByLabel("Deduplication strategy").selectOption("event");
  await send.click();
  await send.click();
  await expect(page.locator(".mission-deliveries")).toHaveText("1 deliveries");
  await page.getByRole("button", { name: "Run regression suite" }).click();
  await page
    .getByLabel(
      "The handler needs verified origin and stable event-based idempotency.",
    )
    .check();
  await expect(
    page.getByRole("region", { name: "Mission debrief" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Compare last two" }).click();
  await expect(page.locator(".mission-compare")).toContainText(
    '"duplicate": true',
  );
});

test("hints, malformed input, case reset and damaged storage remain usable", async ({
  page,
}) => {
  await page.goto("/playground/missions#mission/checkout");
  await page.getByRole("textbox", { name: "JSON request body" }).fill("{");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(page.locator(".mission-response")).toContainText(
    "Body must be a JSON object",
  );
  await page.getByRole("button", { name: "Reveal the next lead" }).click();
  await expect(page.locator(".mission-hints")).toContainText("Read /catalog");
  await page.getByRole("button", { name: "New case variant" }).click();
  await page.getByRole("button", { name: "Start fresh case" }).click();
  await expect(page.locator(".mission-statusbar")).toContainText("VARIANT 2");
  await page.evaluate(() =>
    localStorage.setItem("cybervalue:mission:checkout:v1", '"broken"'),
  );
  await page.reload();
  await expect(page.locator(".mission-statusbar")).toContainText("VARIANT 1");
  await expect(
    page.getByRole("textbox", { name: "JSON request body" }),
  ).toContainText("FIELD-KIT");
});

test("mission workspace is keyboard accessible and fits small screens", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/playground/missions#mission/webhook");
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `viewport ${width}`,
    ).toBe(true);
  }
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
