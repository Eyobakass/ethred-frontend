# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: buyer.spec.ts >> Buyer Flow >> should search and filter properties
- Location: tests\e2e\buyer.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.grid')
Expected: visible
Error: strict mode violation: locator('.grid') resolved to 4 elements:
    1) <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">…</div> aka locator('div').filter({ hasText: 'Filter PropertiesReset' }).nth(1)
    2) <div class="grid grid-cols-2 gap-2">…</div> aka locator('.grid.grid-cols-2')
    3) <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">…</div> aka getByText('3D TOUR5,000,000 ETB1 beds1 baths150 m²Bole, Addis Ababa • Woreda 015,000 ETB0')
    4) <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">…</div> aka locator('div').filter({ hasText: 'EETHREDThe modern Ethiopian' }).first()

Call log:
  - Expect "toBeVisible" locator('.grid') with timeout 5000ms
  - waiting for locator('.grid')

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
    - generic [ref=e23]:
      - generic [ref=e24]:
        - heading "Property Discovery & Search" [level=1] [ref=e25]
        - paragraph [ref=e26]: Filter by location, price range, bedrooms, and 3D virtual tour availability.
      - generic [ref=e27]:
        - complementary [ref=e29]:
          - generic [ref=e30]:
            - heading "Filter Properties" [level=3] [ref=e31]
            - button "Reset All" [ref=e34]
          - generic [ref=e35]:
            - generic [ref=e36]: City / Region
            - combobox [ref=e37]:
              - option "All Regions" [selected]
              - option "Addis Ababa"
              - option "Hawassa"
              - option "Adama"
          - generic [ref=e38]:
            - generic [ref=e39]: Sub-City
            - combobox [ref=e40]:
              - option "All Sub-Cities" [selected]
              - option "Bole"
              - option "Yeka"
              - option "Kirkos"
              - option "Arada"
              - option "Nifas Silk-Lafto"
              - option "Kolfe Keranio"
              - option "Lideta"
              - option "Gullele"
              - option "Akaky Kaliti"
              - option "Addis Ketema"
              - option "Lemi Kura"
          - generic [ref=e41]:
            - generic [ref=e42]: Property Category
            - combobox [ref=e43]:
              - option "All Categories" [selected]
              - option "Apartment"
              - option "House / Villa"
              - option "Commercial Space"
              - option "Office"
              - option "Land Plot"
              - option "Warehouse"
          - generic [ref=e44]:
            - generic [ref=e45]: Price Range (ETB)
            - generic [ref=e46]:
              - spinbutton "Min ETB" [ref=e47]
              - spinbutton "Max ETB" [ref=e48]
          - generic [ref=e49]:
            - generic [ref=e50]: Min Bedrooms
            - generic [ref=e51]:
              - button "1+" [ref=e52]
              - button "2+" [ref=e53]
              - button "3+" [ref=e54]
              - button "4+" [ref=e55]
              - button "5+" [ref=e56]
          - generic [ref=e58] [cursor=pointer]:
            - checkbox "3D Virtual Tour Only" [ref=e59]
            - generic [ref=e60]: 3D Virtual Tour Only
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]: 9 properties found
            - generic [ref=e67]:
              - button "Grid" [ref=e68]
              - button "Map" [ref=e75]
          - generic [ref=e79]:
            - link "VR Verification Villa 4 3D TOUR 5,000,000 ETB 1 beds 1 baths 150 m² Bole, Addis Ababa • Woreda 01" [ref=e80] [cursor=pointer]:
              - /url: /en/properties/23644c6a-334b-4c25-a1d2-f849d25b2390
              - generic [ref=e81]:
                - img "VR Verification Villa 4" [ref=e82]
                - generic [ref=e83]: 3D TOUR
                - button "Chat on WhatsApp" [ref=e88]
              - generic [ref=e91]:
                - generic [ref=e92]: 5,000,000 ETB
                - generic [ref=e94]:
                  - generic [ref=e95]: 1 beds
                  - generic [ref=e96]: 1 baths
                  - generic [ref=e97]: 150 m²
                - generic [ref=e98]: Bole, Addis Ababa • Woreda 01
            - link "Verify Prop 4 5,000 ETB 0 beds 0 baths 100 m² Bole, Addis Ababa • Woreda 3" [ref=e99] [cursor=pointer]:
              - /url: /en/properties/f2e6a708-e719-40a4-8d0d-a868e113eb1d
              - generic [ref=e100]:
                - img "Verify Prop 4" [ref=e101]
                - button "Chat on WhatsApp" [ref=e102]
              - generic [ref=e105]:
                - generic [ref=e106]: 5,000 ETB
                - generic [ref=e108]:
                  - generic [ref=e109]: 0 beds
                  - generic [ref=e110]: 0 baths
                  - generic [ref=e111]: 100 m²
                - generic [ref=e112]: Bole, Addis Ababa • Woreda 3
            - link "Test ETH-REG-002 Title 1,000 ETB 2 beds 2 baths 100 m² Bole, Addis Ababa • Woreda 01" [ref=e113] [cursor=pointer]:
              - /url: /en/properties/1468c40d-7d04-41a9-84bd-fdc6c251168e
              - generic [ref=e114]:
                - img "Test ETH-REG-002 Title" [ref=e115]
                - button "Chat on WhatsApp" [ref=e116]
              - generic [ref=e119]:
                - generic [ref=e120]: 1,000 ETB
                - generic [ref=e122]:
                  - generic [ref=e123]: 2 beds
                  - generic [ref=e124]: 2 baths
                  - generic [ref=e125]: 100 m²
                - generic [ref=e126]: Bole, Addis Ababa • Woreda 01
            - link "Test Prop 2 1,000 ETB 0 beds 0 baths 100 m² Bole, Addis Ababa • Woreda 01" [ref=e127] [cursor=pointer]:
              - /url: /en/properties/4ca78f58-dc8c-4feb-92e3-b3c006c8c7aa
              - generic [ref=e128]:
                - img "Test Prop 2" [ref=e129]
                - button "Chat on WhatsApp" [ref=e130]
              - generic [ref=e133]:
                - generic [ref=e134]: 1,000 ETB
                - generic [ref=e136]:
                  - generic [ref=e137]: 0 beds
                  - generic [ref=e138]: 0 baths
                  - generic [ref=e139]: 100 m²
                - generic [ref=e140]: Bole, Addis Ababa • Woreda 01
            - link "Test Prop 2 1,000 ETB 0 beds 0 baths 100 m² Bole, Addis Ababa • Woreda 01" [ref=e141] [cursor=pointer]:
              - /url: /en/properties/7c57dbbe-b14e-41eb-8291-cb8ba9603dc4
              - generic [ref=e142]:
                - img "Test Prop 2" [ref=e143]
                - button "Chat on WhatsApp" [ref=e144]
              - generic [ref=e147]:
                - generic [ref=e148]: 1,000 ETB
                - generic [ref=e150]:
                  - generic [ref=e151]: 0 beds
                  - generic [ref=e152]: 0 baths
                  - generic [ref=e153]: 100 m²
                - generic [ref=e154]: Bole, Addis Ababa • Woreda 01
            - link "Updated Title 1,000 ETB 0 beds 0 baths 100 m² Bole, Addis Ababa • Woreda 01" [ref=e155] [cursor=pointer]:
              - /url: /en/properties/30ffade7-aabf-4068-827a-9f15bae34293
              - generic [ref=e156]:
                - img "Updated Title" [ref=e157]
                - button "Chat on WhatsApp" [ref=e158]
              - generic [ref=e161]:
                - generic [ref=e162]: 1,000 ETB
                - generic [ref=e164]:
                  - generic [ref=e165]: 0 beds
                  - generic [ref=e166]: 0 baths
                  - generic [ref=e167]: 100 m²
                - generic [ref=e168]: Bole, Addis Ababa • Woreda 01
            - link "Modern Villa in Kazanchis 25,000,000 ETB 4 beds 3 baths 350 m² Kirkos, Addis Ababa • Woreda 08" [ref=e169] [cursor=pointer]:
              - /url: /en/properties/5ae10479-534b-4205-80fd-2b04558e8b41
              - generic [ref=e170]:
                - img "Modern Villa in Kazanchis" [ref=e171]
                - button "Chat on WhatsApp" [ref=e172]
              - generic [ref=e175]:
                - generic [ref=e176]: 25,000,000 ETB
                - generic [ref=e178]:
                  - generic [ref=e179]: 4 beds
                  - generic [ref=e180]: 3 baths
                  - generic [ref=e181]: 350 m²
                - generic [ref=e182]: Kirkos, Addis Ababa • Woreda 08
            - link "Modern Villa in Kazanchis 25,000,000 ETB 4 beds 3 baths 350 m² Kirkos, Addis Ababa • Woreda 08" [ref=e183] [cursor=pointer]:
              - /url: /en/properties/23731896-b782-4011-a0ae-829e2f418bfd
              - generic [ref=e184]:
                - img "Modern Villa in Kazanchis" [ref=e185]
                - button "Chat on WhatsApp" [ref=e186]
              - generic [ref=e189]:
                - generic [ref=e190]: 25,000,000 ETB
                - generic [ref=e192]:
                  - generic [ref=e193]: 4 beds
                  - generic [ref=e194]: 3 baths
                  - generic [ref=e195]: 350 m²
                - generic [ref=e196]: Kirkos, Addis Ababa • Woreda 08
            - link "Modern 3-Bedroom Apartment in Bole 3D TOUR 12,500,000 ETB 3 beds 2 baths 145.5 m² Bole, Addis Ababa • Woreda 03" [ref=e197] [cursor=pointer]:
              - /url: /en/properties/f2948f6d-08f8-491d-b39a-055b967a9b1b
              - generic [ref=e198]:
                - img "Modern 3-Bedroom Apartment in Bole" [ref=e199]
                - generic [ref=e200]: 3D TOUR
                - button "Chat on WhatsApp" [ref=e205]
              - generic [ref=e208]:
                - generic [ref=e209]: 12,500,000 ETB
                - generic [ref=e211]:
                  - generic [ref=e212]: 3 beds
                  - generic [ref=e213]: 2 baths
                  - generic [ref=e214]: 145.5 m²
                - generic [ref=e215]: Bole, Addis Ababa • Woreda 03
  - contentinfo [ref=e216]:
    - generic [ref=e217]:
      - generic [ref=e218]:
        - generic [ref=e219]:
          - generic [ref=e220]: E
          - generic [ref=e222]: ETHRED
        - paragraph [ref=e223]: The modern Ethiopian real estate ecosystem — verified listings with 3D virtual tours.
      - generic [ref=e224]:
        - heading "Explore" [level=4] [ref=e225]
        - list [ref=e226]:
          - listitem [ref=e227]:
            - link "Apartments for Sale" [ref=e228] [cursor=pointer]:
              - /url: /en/properties?category=APARTMENT
          - listitem [ref=e229]:
            - link "Villa Houses" [ref=e230] [cursor=pointer]:
              - /url: /en/properties?category=HOUSE
          - listitem [ref=e231]:
            - link "Commercial Spaces" [ref=e232] [cursor=pointer]:
              - /url: /en/properties?category=COMMERCIAL
          - listitem [ref=e233]:
            - link "For Rent" [ref=e234] [cursor=pointer]:
              - /url: /en/properties?transaction_mode=RENT
          - listitem [ref=e235]:
            - link "Compare Properties" [ref=e236] [cursor=pointer]:
              - /url: /en/properties/compare
      - generic [ref=e237]:
        - heading "Payment Partners" [level=4] [ref=e238]
        - list [ref=e239]:
          - listitem [ref=e240]: Telebirr (Ethio Telecom)
          - listitem [ref=e241]: CBE Birr
          - listitem [ref=e242]: Chapa Payment Gateway
          - listitem [ref=e243]: SantimPay
      - generic [ref=e244]:
        - heading "Contact & Support" [level=4] [ref=e245]
        - list [ref=e246]:
          - listitem [ref=e247]: Addis Ababa, Ethiopia
          - listitem [ref=e251]: +251 911 000 000
          - listitem [ref=e254]: support@ethred.com
          - listitem [ref=e258]:
            - link "List your property" [ref=e259] [cursor=pointer]:
              - /url: /en/auth/register
          - listitem [ref=e260]:
            - link "Agency registration" [ref=e261] [cursor=pointer]:
              - /url: /en/agencies
    - generic [ref=e262]:
      - paragraph [ref=e263]: © 2026 Ethred Real Estate Ecosystem. All rights reserved.
      - generic [ref=e264]:
        - generic [ref=e265]: Built for Ethiopia
        - generic [ref=e266]: •
        - generic [ref=e267]: 3D by Pannellum WebGL
  - button "Open Next.js Dev Tools" [ref=e273] [cursor=pointer]:
    - generic [ref=e276]:
      - text: Rendering
      - generic [ref=e277]:
        - generic [ref=e278]: .
        - generic [ref=e279]: .
        - generic [ref=e280]: .
  - alert [ref=e281]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Buyer Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Start at properties page
  6  |     await page.goto('/en/properties');
  7  |   });
  8  | 
  9  |   test('should search and filter properties', async ({ page }) => {
  10 |     // Wait for results grid to load
> 11 |     await expect(page.locator('.grid')).toBeVisible();
     |                                         ^ Error: expect(locator).toBeVisible() failed
  12 |     const cards = page.locator('.grid a');
  13 |     expect(await cards.count()).toBeGreaterThanOrEqual(0);
  14 |   });
  15 | 
  16 |   test('should view property details and track recently viewed', async ({ page }) => {
  17 |     // Click first property
  18 |     const firstProperty = page.locator('.grid a').first();
  19 |     // Wait for properties to load
  20 |     await page.waitForSelector('.grid a');
  21 |     
  22 |     const propUrl = await firstProperty.getAttribute('href');
  23 |     if (!propUrl) return; // Skip if no properties
  24 | 
  25 |     await firstProperty.click();
  26 |     await page.waitForURL(`**${propUrl}`);
  27 | 
  28 |     // Check WhatsApp CTA
  29 |     await expect(page.locator('a[href*="wa.me"]')).toBeVisible();
  30 | 
  31 |     // Check Recently Viewed Strip at bottom
  32 |     await expect(page.locator('text=Recently Viewed Properties')).toBeVisible();
  33 | 
  34 |     // Navigate to /me/recently-viewed
  35 |     await page.goto('/en/me/recently-viewed');
  36 |     
  37 |     // The property should be in the history
  38 |     const historyCards = page.locator('.grid a');
  39 |     expect(await historyCards.count()).toBeGreaterThan(0);
  40 |   });
  41 | });
  42 | 
```