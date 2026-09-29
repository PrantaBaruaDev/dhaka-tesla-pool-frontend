import { APIRequestContext, request } from '@playwright/test';

export async function resetDb(): Promise<void> {
  const ctx: APIRequestContext = await request.newContext({
    baseURL: 'http://localhost:5000',
  });
  const res = await ctx.post('/test/reset');
  if (!res.ok()) {
    throw new Error(`reset failed: ${res.status()} ${await res.text()}`);
  }
  await ctx.dispose();
}