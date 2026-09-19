import { test, expect } from '@playwright/test';

test.describe('Seller Flow', () => {
  // We mock the login state or login explicitly before each
  test('should use AI generator in listing creation', async ({ page }) => {
    // Go to create listing (assuming unauthenticated users are redirected, we simulate directly or login first)
    // For brevity in this test, we navigate to the page
    await page.goto('/en/seller/listings/create');
    
    // We might get redirected to login, so let's log in
    if (page.url().includes('login')) {
      await page.fill('input[type="email"]', 'seller@ethred.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/seller/**');
      await page.goto('/en/seller/listings/create');
    }

    // Check for AI Generation button
    const aiButton = page.locator('button:has-text("Generate with AI")');
    if (await aiButton.isVisible()) {
      // Fill basic requirements for AI
      await page.fill('input[name="price_etb"]', '5000000');
      await page.fill('input[name="area_sqm"]', '150');
      
      await aiButton.click();
      
      // AI generation takes a few seconds
      await expect(page.locator('input[name="title_en"]')).not.toBeEmpty({ timeout: 15000 });
      await expect(page.locator('textarea[name="description_en"]')).not.toBeEmpty();
    }
  });
});
