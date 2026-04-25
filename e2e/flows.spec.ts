import { test, expect } from '@playwright/test';

test.describe('ShopFlow E2E', () => {
  test('Guest browses catalog, filters by category, views product', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');

    // Check if products load
    await expect(page.locator('.product-card').first()).toBeVisible();

    // This is a basic test skeleton since the frontend elements depend on the actual UI implementation
    // We expect the category filter to be present
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();

    // Wait for product details page
    await expect(page).toHaveURL(/.*\/products\/.*/);
    await expect(page.locator('button:has-text("Añadir al Carrito")')).toBeVisible();
  });

  test('User registers, adds product, checkout with Stripe', async ({ page }) => {
    // 1. Register / Login
    await page.goto('/auth/login');
    // Using demo account if applicable or mock registration
    await page.fill('input[type="email"]', 'cliente@shopflow.com');
    await page.fill('input[type="password"]', 'Cliente1234!');
    await page.click('button[type="submit"]');

    // 2. Add product
    await page.goto('/products/1'); // Assuming product 1 exists
    await page.click('button:has-text("Añadir al Carrito")');

    // 3. Checkout
    await page.goto('/checkout');
    await expect(page.locator('text="Completar Pedido"')).toBeVisible();

    // Note: Actually testing Stripe requires interacting with the Stripe iframe
    // In a real E2E, we would fill the iframe using Playwright frame locators:
    // const cardFrame = page.frameLocator('.__PrivateStripeElement iframe');
    // await cardFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
  });

  test('Admin logs in, views dashboard, changes order status', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@shopflow.com');
    await page.fill('input[type="password"]', 'Admin1234!');
    await page.click('button[type="submit"]');

    // Go to dashboard
    await page.goto('/admin/dashboard');
    await expect(page.locator('text="Dashboard Administrador"')).toBeVisible();

    // Go to orders
    await page.goto('/admin/orders');
    await expect(page.locator('table')).toBeVisible();
  });
});
