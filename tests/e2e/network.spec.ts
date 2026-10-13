import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({
  storageState: {
    cookies: [
      {
        name: "cybervalue-locale",
        value: "en",
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  },
});

test("the labs page and catalog lead to the IP lab", async ({ page }) => {
  await page.goto("/labs");
  await page.getByRole("link", { name: "Open IP lab" }).click();
  await expect(page).toHaveURL(/\/playground\/network-basics$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /IP, mask and gateway/ }),
  ).toBeVisible();
  await page.goto("/playground");
  await page.getByRole("button", { name: "Networking", exact: true }).click();
  await expect(page.locator(".learn-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "IP addressing lab" }),
  ).toBeVisible();
});

test("building an address bit by bit completes the first lesson and survives a reload", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/1");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
  for (const [octet, weight] of [
    [1, 128],
    [1, 64],
    [2, 128],
    [2, 32],
    [2, 8],
    [3, 1],
    [4, 8],
    [4, 2],
  ])
    await page
      .getByRole("button", { name: `Octet ${octet}, ${weight}`, exact: true })
      .click();
  await expect(page.locator(".nl-big-ip")).toHaveText("192.168.1.10");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
  await page.reload();
  await expect(page.locator("#nl-progress")).toHaveAttribute("value", "1");
  await page.getByRole("button", { name: "Next lesson" }).click();
  await expect(page).toHaveURL(/#lesson\/2$/);
});

test("the simulator explains a missing gateway and passes once it is set", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/5");
  await page.getByRole("button", { name: "ping 192.168.1.50" }).click();
  await expect(page.locator(".nl-log")).toContainText("reply received");
  await page.getByRole("button", { name: "ping 8.8.8.8" }).click();
  await expect(page.locator(".nl-log")).toContainText(
    "No default gateway is set",
  );
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
  await page.getByLabel("Default gateway").fill("10.0.0.1");
  await page.getByRole("button", { name: "ping 8.8.8.8" }).click();
  await expect(page.locator(".nl-log")).toContainText("is not on my network");
  await page.getByLabel("Default gateway").fill("192.168.1.1");
  await page.getByRole("button", { name: "ping 8.8.8.8" }).click();
  await expect(page.locator(".nl-log")).toContainText("8.8.8.8 replied");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});

test("the subnet calculator breaks down any address", async ({ page }) => {
  await page.goto("/playground/network-basics");
  await page.getByRole("button", { name: "Subnet calculator" }).click();
  await page.getByLabel("IP address").fill("172.16.5.130");
  await page.getByLabel("Mask or /prefix").fill("/25");
  const facts = page.locator(".nl-facts");
  await expect(facts).toContainText("172.16.5.128");
  await expect(facts).toContainText("172.16.5.255");
  await expect(facts).toContainText("126");
  await page.getByLabel("Mask or /prefix").fill("255.0.255.0");
  await expect(page.getByRole("status")).toContainText("unbroken");
});

test("the IP lab fits small screens and passes an accessibility audit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const hash of [
    "#lesson/1",
    "#lesson/4",
    "#lesson/6",
    "#lesson/9",
    "#lesson/10",
    "#lesson/11",
    "#lesson/12",
    "#lesson/13",
    "#lesson/14",
    "#lesson/15",
    "#lesson/16",
    "#lesson/17",
  ]) {
    await page.goto(`/playground/network-basics${hash}`);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${hash} ${width}`,
      ).toBe(true);
    }
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations, hash).toEqual([]);
  }
});

test("DHCP hands out addresses until the pool runs out", async ({ page }) => {
  await page.goto("/playground/network-basics#lesson/9");
  for (const device of ["Laptop", "Phone", "TV", "Tablet", "Game console"])
    await page.getByRole("button", { name: `Connect: ${device}` }).click();
  await expect(page.locator(".nl-exchange")).toContainText("no free address");
  await page.getByLabel("Pool end").fill("105");
  for (const device of ["Game console", "Camera"])
    await page.getByRole("button", { name: `Connect: ${device}` }).click();
  await expect(page.locator(".nl-exchange")).toContainText("ACK");
  await expect(page.locator(".nl-devices-grid")).toContainText("192.168.1.105");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
  await page.getByRole("button", { name: "Disconnect" }).first().click();
  await page.getByLabel("DHCP server on").uncheck();
  await page.getByRole("button", { name: "Connect: Laptop" }).click();
  await expect(page.locator(".nl-devices-grid")).toContainText("169.254.");
});

test("DNS resolves names, uses its cache and exposes the look-alike site", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/10");
  const suggestion = (name: string) =>
    page.getByRole("button", { name, exact: true });
  await suggestion("bank.example").click();
  await expect(page.locator(".nl-page")).toContainText("198.51.100.20");
  await expect(page.locator(".nl-steps")).toContainText("authoritative");
  await suggestion("bank.example").click();
  await expect(page.locator(".nl-page")).toContainText("from cache");
  await suggestion("bank.example.hisob-tekshiruv.example").click();
  await expect(page.locator(".nl-page.fake")).toContainText("192.0.2.66");
  await suggestion("yoq.example").click();
  await expect(page.locator(".nl-steps")).toContainText("NXDOMAIN");
  await page
    .getByLabel("bank.example — IP", { exact: true })
    .fill("198.51.100.20");
  await page
    .getByLabel("bank.example.hisob-tekshiruv.example — IP")
    .fill("192.0.2.66");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});

test("NAT shows every home device to the site as one public address", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/11");
  await page.getByRole("button", { name: "Laptop: open the site" }).click();
  await page.getByRole("button", { name: "TV: open the site" }).click();
  const log = page.getByRole("region", { name: "Site server" });
  await expect(log).toContainText("203.0.113.7:40001");
  await expect(log).toContainText("203.0.113.7:40002");
  await expect(log).not.toContainText("192.168.1.");
  await page.getByLabel(/All as the router’s single public IP/).check();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});

test("packets can be stepped frame by frame", async ({ page }) => {
  await page.goto("/playground/network-basics#lesson/5");
  await page.getByLabel("Default gateway").fill("192.168.1.1");
  await page.getByRole("button", { name: "ping 8.8.8.8" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  const frame = page.locator(".nl-frame");
  await expect(frame).toContainText("ff:ff:ff:ff:ff:ff");
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(frame).toContainText("00:11:22:33:44:01");
  await expect(frame).toContainText("8.8.8.8");
});

test("new examples replace the exercise and count solved ones", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/15");
  await page.getByLabel("Short form").fill("2001:db8::ff00:42:8329");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Examples solved: 1")).toBeVisible();
  const before = await page.locator(".nl-v6").getAttribute("aria-label");
  await page.getByRole("button", { name: "New example" }).click();
  await expect(page.locator(".nl-v6")).not.toHaveAttribute(
    "aria-label",
    before!,
  );
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
});

test("subnetting, traceroute and ports lessons can be completed", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/12");
  await page.locator('input[type="range"]').fill("26");
  await page
    .getByLabel("Network address of department 3")
    .fill("192.168.10.128");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();

  await page.goto("/playground/network-basics#lesson/13");
  await page.getByRole("spinbutton", { name: "TTL" }).fill("3");
  await page.getByRole("button", { name: "Send packet" }).click();
  await expect(page.locator(".nl-route .expired")).toContainText(
    "198.51.100.1",
  );
  await page.getByLabel(/TTL 3\?/).selectOption("198.51.100.1");
  await page.getByLabel(/delay jump/).selectOption("198.51.100.77");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();

  await page.goto("/playground/network-basics#lesson/14");
  await page.getByRole("button", { name: "Connect to port 3306" }).click();
  await expect(page.locator(".nl-steps")).toContainText("SYN-ACK");
  for (const [port, name] of [
    [22, "SSH"],
    [53, "DNS"],
    [80, "HTTP"],
    [443, "HTTPS"],
    [3306, "MySQL"],
  ] as const)
    await page
      .getByLabel(`Service on port ${port}`)
      .selectOption({ value: name });
  await page.getByLabel(/Firewall/).check();
  await page.getByRole("button", { name: "Connect to port 3306" }).click();
  await expect(page.locator(".nl-steps")).toContainText("filtered");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});

test("a page load can be stepped packet by packet with the eavesdropper's view", async ({
  page,
}) => {
  await page.goto("/playground/network-basics#lesson/16");
  const ladder = page.locator(".nl-ladder li");
  await expect(ladder).toHaveCount(10);
  await expect(page.locator(".nl-frame")).toContainText("UDP 51000 → 53");
  await page.getByLabel("DNS cached").check();
  await expect(ladder).toHaveCount(8);
  await page.getByLabel("HTTPS").uncheck();
  await expect(ladder).toHaveCount(5);
  await page.getByLabel("Wi-Fi eavesdropper’s view").check();
  await page.getByRole("button", { name: "GET /kitoblar HTTP/1.1" }).click();
  await expect(page.locator(".nl-spy.danger")).toContainText("cookie");
  await page.getByLabel("DNS", { exact: true }).check();
  await page.getByLabel("The page path (/kitoblar) and the cookie").check();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});

test("hand-built HTTP requests collect every status code", async ({ page }) => {
  await page.goto("/playground/network-basics#lesson/17");
  const send = () => page.getByRole("button", { name: "Send request" }).click();
  const path = page.getByLabel("Path");
  const response = page.getByLabel("Response text");
  await send();
  await expect(response).toContainText("HTTP/1.1 200 OK");
  await path.fill("/eski-sahifa");
  await send();
  await expect(response).toContainText("Location: /kitoblar");
  await path.fill("/nope");
  await send();
  await expect(response).toContainText("404 Not Found");
  await path.fill("/admin");
  await send();
  await expect(response).toContainText("401 Unauthorized");
  await page.getByLabel("Method").selectOption("POST");
  await path.fill("/kirish");
  await page.getByLabel("Body (form)").fill("login=talaba&parol=kitob123");
  await expect(page.getByLabel("Request text")).toContainText(
    "Content-Length: 27",
  );
  await send();
  await expect(response).toContainText("Set-Cookie: session=u-7d41");
  await page.getByRole("button", { name: "Use the cookie you got" }).click();
  await page.getByLabel("Method").selectOption("GET");
  await path.fill("/admin");
  await send();
  await expect(response).toContainText("403 Forbidden");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! Lesson completed.")).toBeVisible();
});
