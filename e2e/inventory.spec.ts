import { test, expect } from '@playwright/test';

// These tests require a running app with a seeded test user.
// Set PLAYWRIGHT_BASE_URL and TEST_USER_EMAIL/PASSWORD env vars to run.

const TEST_EMAIL    = process.env.TEST_USER_EMAIL    ?? 'user@test.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'User1234!';

async function login(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.goto('/sign-in');
  await page.getByLabel('E-Mail').fill(TEST_EMAIL);
  await page.getByLabel('Passwort').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL(/dashboard/);
}

test.describe('Inventory', () => {
  test('inventory page is accessible after login', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/inventory');
    await expect(page.getByText(/Inventar|Artikel/i)).toBeVisible();
  });

  test('leaderboard is visible after login', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/leaderboard');
    await expect(page.getByText(/Rangliste/i)).toBeVisible();
  });
});
