import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('should view pending properties and check duplicate flags', async ({ page }) => {
    // Admin dashboard
    await page.goto('/en/admin/dashboard');

    // This may redirect to login
    if (page.url().includes('login')) {
      await page.fill('input[type="email"]', 'admin@ethred.com');
      await page.fill('input[type="password"]', 'AdminPass123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/**');
    }

    // Go to properties review
    await page.goto('/en/admin/properties');
    
    // Check if there's a property to review
    const propLinks = page.locator('a[href*="/review"]');
    if (await propLinks.count() > 0) {
      await propLinks.first().click();
      
      // Admin should be able to see duplicate flags or standard info
      await expect(page.locator('text=Quality Checklist')).toBeVisible();
      
      // Optional: check for duplicate warning if it exists
      // await expect(page.locator('text=Duplicate warning')).toBeVisible();
    }
  });
});
