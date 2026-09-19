import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a new user to register and login', async ({ page }) => {
    // Navigate to register
    await page.goto('/en/auth/register');
    
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'John Doe'); // Full Name
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'Password123!');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Wait for redirect to login or dashboard
    await page.waitForURL('**/auth/login');
    
    // Login
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to properties or dashboard
    await expect(page).toHaveURL(/.*\/properties/);
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });
});
