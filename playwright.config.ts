import { defineConfig, devices } from "@playwright/test";
const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // With a disposable admin account, some tests sign out every session and
  // change the password; run one at a time then, as CI does.
  workers: process.env.E2E_ISOLATED_ACCOUNT === "true" ? 1 : 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // On CI a flaky test gets one retry and is reported as flaky, and failures
  // become GitHub annotations readable without downloading the logs.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `npx next start -p ${port}`,
    url: baseURL,
    reuseExistingServer: Boolean(process.env.PW_REUSE_SERVER),
    timeout: 60000,
  },
});
