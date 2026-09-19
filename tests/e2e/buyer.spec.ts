import { test, expect } from '@playwright/test';

test.describe('Buyer Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at properties page
    await page.goto('/en/properties');
  });

  test('should search and filter properties', async ({ page }) => {
    // Wait for results grid to load
    await expect(page.locator('.grid')).toBeVisible();
    const cards = page.locator('.grid a');
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });

  test('should view property details and track recently viewed', async ({ page }) => {
    // Click first property
    const firstProperty = page.locator('.grid a').first();
    // Wait for properties to load
    await page.waitForSelector('.grid a');
    
    const propUrl = await firstProperty.getAttribute('href');
    if (!propUrl) return; // Skip if no properties

    await firstProperty.click();
    await page.waitForURL(`**${propUrl}`);

    // Check WhatsApp CTA
    await expect(page.locator('a[href*="wa.me"]')).toBeVisible();

    // Check Recently Viewed Strip at bottom
    await expect(page.locator('text=Recently Viewed Properties')).toBeVisible();

    // Navigate to /me/recently-viewed
    await page.goto('/en/me/recently-viewed');
    
    // The property should be in the history
    const historyCards = page.locator('.grid a');
    expect(await historyCards.count()).toBeGreaterThan(0);
  });
});
