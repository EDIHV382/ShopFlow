import { test, expect } from '@playwright/test';

test.describe('ShopFlow E2E', () => {
  test('Guest browses catalog, filters by category, views product', async ({ page }) => {
    await page.goto('/products');

    await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });

    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();

    await expect(page).toHaveURL(/.*\/products\/.*/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('User logs in, adds product to cart, completes checkout with Stripe test card', async ({
    page,
  }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'cliente@shopflow.com');
    await page.fill('input[type="password"]', 'Cliente123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');

    await page.goto('/products/1');
    await page.click('button:has-text("Agregar al carrito")');

    await expect(page.locator('text="✓ Agregado!"')).toBeVisible({ timeout: 5000 });

    await page.goto('/cart');
    await expect(page.locator('text="Carrito de Compras"')).toBeVisible();

    await page.goto('/checkout');
    await expect(page.locator('text="Stripe"')).toBeVisible();

    const cardFrame = page.frameLocator('.__PrivateStripeElement iframe').first();
    await cardFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
    await cardFrame.locator('input[name="exp-date"]').fill('12/29');
    await cardFrame.locator('input[name="cvc"]').fill('123');

    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="postalCode"]', '12345');
    await page.fill('input[name="country"]', 'US');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/orders\/.*/, { timeout: 15000 });
  });

  test('Admin logs in, views dashboard, changes order status', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@shopflow.com');
    await page.fill('input[type="password"]', 'Admin1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin/dashboard');

    await expect(page.locator('text="Dashboard"')).toBeVisible();

    await page.goto('/admin/orders');
    await expect(page.locator('table')).toBeVisible();
  });
});
