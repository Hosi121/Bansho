import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'BANSHO' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'BANSHO' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'アカウントを作成' })).toBeVisible();
  });

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=新規登録');
    await expect(page).toHaveURL('/register');
  });

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register');
    await page.click('text=ログイン');
    await expect(page).toHaveURL('/login');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.getByText(/ログインに失敗しました|メールアドレスまたはパスワードが正しくありません/)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show validation error for short password on register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'short');

    // Find all password inputs and fill the second one (confirm password)
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(1).fill('short');

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.getByText(/8文字以上/)).toBeVisible();
  });

  test('should require password confirmation to match', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('differentpassword');

    await page.click('button[type="submit"]');

    // Should show mismatch error
    await expect(page.getByText(/パスワードが一致しません/)).toBeVisible();
  });

  test('should redirect unauthenticated users to login from protected routes', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/login/);
  });
});
