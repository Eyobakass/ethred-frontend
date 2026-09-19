# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should allow a new user to register and login
- Location: tests\e2e\auth.spec.ts:4:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 90000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/auth/login" until "load"
  navigated to "http://localhost:3000/en/auth/verify-otp?token=otp_sess_6cacd1005bda4f95&role=BUYER"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "E ETHREDReal Estate" [ref=e4] [cursor=pointer]:
        - /url: /en
        - generic [ref=e5]: E
        - generic [ref=e7]: ETHREDReal Estate
      - navigation [ref=e8]:
        - link "Properties" [ref=e9] [cursor=pointer]:
          - /url: /en/properties
        - link "Agencies" [ref=e10] [cursor=pointer]:
          - /url: /en/agencies
        - link "Compare" [ref=e11] [cursor=pointer]:
          - /url: /en/properties/compare
      - generic [ref=e12]:
        - button "Switch to Dark Mode" [ref=e13]
        - generic [ref=e16]:
          - button "Switch to English" [ref=e17]: EN
          - button "Switch to Amharic" [ref=e18]: አማ
        - generic [ref=e19]:
          - link "Sign In" [ref=e20] [cursor=pointer]:
            - /url: /en/auth/login
          - link "Register" [ref=e21] [cursor=pointer]:
            - /url: /en/auth/register
  - main [ref=e22]:
    - generic [ref=e24]:
      - generic [ref=e25]:
        - heading "Enter Verification Code" [level=1] [ref=e31]
        - paragraph [ref=e32]: Enter the 6-digit code sent to your email address.
      - generic [ref=e33]:
        - textbox [ref=e34]
        - textbox [ref=e35]
        - textbox [ref=e36]
        - textbox [ref=e37]
        - textbox [ref=e38]
        - textbox [ref=e39]
      - button "Verify & Continue" [disabled] [ref=e40]
      - generic [ref=e41]:
        - text: Didn't receive the code?
        - button "Resend Code" [ref=e42]
  - contentinfo [ref=e43]:
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: E
          - generic [ref=e49]: ETHRED
        - paragraph [ref=e50]: The modern Ethiopian real estate ecosystem — verified listings with 3D virtual tours.
      - generic [ref=e51]:
        - heading "Explore" [level=4] [ref=e52]
        - list [ref=e53]:
          - listitem [ref=e54]:
            - link "Apartments for Sale" [ref=e55] [cursor=pointer]:
              - /url: /en/properties?category=APARTMENT
          - listitem [ref=e56]:
            - link "Villa Houses" [ref=e57] [cursor=pointer]:
              - /url: /en/properties?category=HOUSE
          - listitem [ref=e58]:
            - link "Commercial Spaces" [ref=e59] [cursor=pointer]:
              - /url: /en/properties?category=COMMERCIAL
          - listitem [ref=e60]:
            - link "For Rent" [ref=e61] [cursor=pointer]:
              - /url: /en/properties?transaction_mode=RENT
          - listitem [ref=e62]:
            - link "Compare Properties" [ref=e63] [cursor=pointer]:
              - /url: /en/properties/compare
      - generic [ref=e64]:
        - heading "Payment Partners" [level=4] [ref=e65]
        - list [ref=e66]:
          - listitem [ref=e67]: Telebirr (Ethio Telecom)
          - listitem [ref=e68]: CBE Birr
          - listitem [ref=e69]: Chapa Payment Gateway
          - listitem [ref=e70]: SantimPay
      - generic [ref=e71]:
        - heading "Contact & Support" [level=4] [ref=e72]
        - list [ref=e73]:
          - listitem [ref=e74]: Addis Ababa, Ethiopia
          - listitem [ref=e78]: +251 911 000 000
          - listitem [ref=e81]: support@ethred.com
          - listitem [ref=e85]:
            - link "List your property" [ref=e86] [cursor=pointer]:
              - /url: /en/auth/register
          - listitem [ref=e87]:
            - link "Agency registration" [ref=e88] [cursor=pointer]:
              - /url: /en/agencies
    - generic [ref=e89]:
      - paragraph [ref=e90]: © 2026 Ethred Real Estate Ecosystem. All rights reserved.
      - generic [ref=e91]:
        - generic [ref=e92]: Built for Ethiopia
        - generic [ref=e93]: •
        - generic [ref=e94]: 3D by Pannellum WebGL
  - button "Open Next.js Dev Tools" [ref=e100] [cursor=pointer]
  - alert [ref=e104]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('should allow a new user to register and login', async ({ page }) => {
  5  |     // Navigate to register
  6  |     await page.goto('/en/auth/register');
  7  |     
  8  |     const uniqueEmail = `testuser_${Date.now()}@example.com`;
  9  |     await page.fill('input[type="text"]', 'John Doe'); // Full Name
  10 |     await page.fill('input[type="email"]', uniqueEmail);
  11 |     await page.fill('input[type="password"]', 'Password123!');
  12 |     
  13 |     // Submit registration
  14 |     await page.click('button[type="submit"]');
  15 |     
  16 |     // Wait for redirect to login or dashboard
> 17 |     await page.waitForURL('**/auth/login');
     |                ^ Error: page.waitForURL: Test timeout of 90000ms exceeded.
  18 |     
  19 |     // Login
  20 |     await page.fill('input[type="email"]', uniqueEmail);
  21 |     await page.fill('input[type="password"]', 'Password123!');
  22 |     await page.click('button[type="submit"]');
  23 |     
  24 |     // Should redirect to properties or dashboard
  25 |     await expect(page).toHaveURL(/.*\/properties/);
  26 |     await expect(page.locator('text=Sign Out')).toBeVisible();
  27 |   });
  28 | });
  29 | 
```