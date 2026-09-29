import { Page, expect } from '@playwright/test';

export const DEMO = {
  nusrat:  { email: 'nusrat@example.com',  password: 'password123', name: 'Nusrat' },
  rafiq:   { email: 'rafiq@example.com',   password: 'password123', name: 'Rafiq' },
  shirin:  { email: 'shirin@example.com',  password: 'password123', name: 'Shirin' },
  jashim:  { email: 'jashim@tesla.dhaka',  password: 'password123', name: 'Jashim' },
} as const;

export async function loginAs(
  page: Page,
  who: keyof typeof DEMO,
): Promise<void> {
  const { email, password } = DEMO[who];
  await page.goto('/login');
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');

  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({
    timeout: 20_000,
  });
}