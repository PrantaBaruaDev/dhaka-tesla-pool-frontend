import { test, expect, Page } from '@playwright/test';
import { resetDb } from './helpers/reset';
import { loginAs } from './helpers/auth';

test.beforeEach(async () => {
  await resetDb();
});

async function createRide(page: Page, pickup: string, destination: string): Promise<string> {
  await page.goto('/passenger/rides/new');
  await page.selectOption('select[name="pickup"]', { label: pickup });
  await page.selectOption('select[name="destination"]', { label: destination });
  await expect(page.getByTestId('estimated-fare')).toContainText('৳', { timeout: 15_000 });
  await page.getByRole('button', { name: /request ride/i }).click();
  await expect(page).toHaveURL(/\/passenger\/rides\/[a-f0-9-]+/, { timeout: 15_000 });
  const url = page.url();
  return url.split('/').pop()!;
}

test('Nusrat and Rafiq share Bullet; both see discounted fares', async ({ browser }) => {
  // Nusrat creates a ride 
  const nusratCtx = await browser.newContext();
  const nusratPage = await nusratCtx.newPage();
  await loginAs(nusratPage, 'nusrat');
  await createRide(nusratPage, 'Banani', 'Mohakhali');

  // Jashim goes online and accepts Nusrat
  const jashimCtx = await browser.newContext();
  const jashimPage = await jashimCtx.newPage();
  await loginAs(jashimPage, 'jashim');
  await jashimPage.getByTestId('online-toggle').click();
  await expect(jashimPage.getByTestId('online-toggle')).toContainText(/online/i, { timeout: 15_000 });

  await jashimPage.getByRole('link', { name: 'Requests', exact: true }).click();
  await expect(jashimPage.getByText('Nusrat')).toBeVisible({ timeout: 20_000 });
  await jashimPage.getByRole('button', { name: /^accept$/i }).first().click();

  await jashimPage.goto('/driver');
  await expect(jashimPage.getByText('Nusrat')).toBeVisible({ timeout: 15_000 });
  await expect(jashimPage.getByText('1 / 3')).toBeVisible();

  // Rafiq creates a matching ride 
  const rafiqCtx = await browser.newContext();
  const rafiqPage = await rafiqCtx.newPage();
  await loginAs(rafiqPage, 'rafiq');
  await createRide(rafiqPage, 'Banani', 'Gulshan 1');

  // Jashim accepts Rafiq into the pool 
  await jashimPage.getByRole('link', { name: 'Requests', exact: true }).click();
  await expect(jashimPage.getByText('Rafiq')).toBeVisible({ timeout: 20_000 });
  await expect(
    jashimPage.locator('span').filter({ hasText: /matches your pool/i }).first(),
  ).toBeVisible({ timeout: 15_000 });
  await jashimPage.getByRole('button', { name: /^accept$/i }).first().click();

  await jashimPage.goto('/driver');
  await expect(jashimPage.getByText('2 / 3')).toBeVisible({ timeout: 15_000 });

  // Lifecycle: arrive → start → complete 
  await jashimPage.getByTestId('pool-action-arrive').click();
  await expect(jashimPage.getByTestId('pool-action-start')).toBeVisible({ timeout: 15_000 });

  await jashimPage.getByTestId('pool-action-start').click();
  await expect(jashimPage.getByTestId('pool-action-complete')).toBeVisible({ timeout: 15_000 });

  await jashimPage.getByTestId('pool-action-complete').click();
  await expect(jashimPage.getByText(/no active pool/i)).toBeVisible({ timeout: 15_000 });

  // Both passengers see final discounted fares
  await nusratPage.reload();
  await expect(nusratPage.getByTestId('status-badge-COMPLETED').first()).toBeVisible({ timeout: 20_000 });
  await expect(nusratPage.getByText('৳74.40')).toBeVisible();

  await rafiqPage.reload();
  await expect(rafiqPage.getByTestId('status-badge-COMPLETED').first()).toBeVisible({ timeout: 20_000 });
  await expect(rafiqPage.getByText('৳66.00')).toBeVisible();

  // Driver history shows the pool
  await jashimPage.goto('/driver/history');
  await expect(jashimPage.getByText('Nusrat')).toBeVisible({ timeout: 15_000 });
  await expect(jashimPage.getByText('Rafiq')).toBeVisible();
  await expect(jashimPage.getByText('৳140.40')).toBeVisible();

  await nusratCtx.close();
  await rafiqCtx.close();
  await jashimCtx.close();
});

test('fourth passenger is rejected when pool is full', async ({ browser }) => {
  const nusratCtx = await browser.newContext();
  const nusratPage = await nusratCtx.newPage();
  await loginAs(nusratPage, 'nusrat');
  await createRide(nusratPage, 'Banani', 'Mohakhali');

  const rafiqCtx = await browser.newContext();
  const rafiqPage = await rafiqCtx.newPage();
  await loginAs(rafiqPage, 'rafiq');
  await createRide(rafiqPage, 'Banani', 'Gulshan 1');

  const shirinCtx = await browser.newContext();
  const shirinPage = await shirinCtx.newPage();
  await loginAs(shirinPage, 'shirin');
  await createRide(shirinPage, 'Banani', 'Gulshan 1');

  const jashimCtx = await browser.newContext();
  const jashimPage = await jashimCtx.newPage();
  await loginAs(jashimPage, 'jashim');
  await jashimPage.getByTestId('online-toggle').click();
  await expect(jashimPage.getByTestId('online-toggle')).toContainText(/online/i, { timeout: 15_000 });

  // Fill Bullet with the first three
  await jashimPage.goto('/driver/requests');
  for (let i = 0; i < 3; i++) {
    await expect(
      jashimPage.getByRole('button', { name: /^accept$/i }).first(),
    ).toBeVisible({ timeout: 20_000 });
    await jashimPage.getByRole('button', { name: /^accept$/i }).first().click();
    await jashimPage.waitForTimeout(800);
  }

  // Fourth passenger signs up and requests the same corridor
  const fourthCtx = await browser.newContext();
  const fourthPage = await fourthCtx.newPage();
  await fourthPage.goto('/signup');
  await fourthPage.fill('input#name', 'Fourth');
  await fourthPage.fill('input#email', `fourth-${Date.now()}@test.local`);
  await fourthPage.fill('input#password', 'password123');
  await fourthPage.getByRole('button', { name: /create account/i }).click();
  await expect(fourthPage).toHaveURL(/\/passenger\/rides\/new/, { timeout: 15_000 });
  await createRide(fourthPage, 'Banani', 'Gulshan 1');

  // Jashim tries to accept → POOL_FULL
  await jashimPage.goto('/driver/requests');
  await expect(jashimPage.getByText('Fourth')).toBeVisible({ timeout: 20_000 });
  await jashimPage.getByRole('button', { name: /^accept$/i }).first().click();
  await expect(jashimPage.getByText(/no seats left/i)).toBeVisible({ timeout: 15_000 });

  await nusratCtx.close();
  await rafiqCtx.close();
  await shirinCtx.close();
  await fourthCtx.close();
  await jashimCtx.close();
});