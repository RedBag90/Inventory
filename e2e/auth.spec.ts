import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-in page renders correctly', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByText('Flohmarkt Olympiade')).toBeVisible();
    await expect(page.getByLabel('E-Mail')).toBeVisible();
    await expect(page.getByLabel('Passwort')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('E-Mail').fill('invalid@example.com');
    await page.getByLabel('Passwort').fill('wrongpassword');
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.locator('p.text-red-600')).toBeVisible({ timeout: 5000 });
  });

  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard/leaderboard');
    await expect(page).toHaveURL(/sign-in/);
  });
});
