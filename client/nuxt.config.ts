// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // SSR enabled for SEO
  ssr: true,

  // Static generation for Vercel (same as Taskflow pattern)
  nitro: {
    preset: 'static',
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // Runtime config — NUXT_PUBLIC_API_BASE is set via env var
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
    },
  },

  // Auto-imports
  imports: {
    dirs: ['stores', 'composables'],
  },

  // App config
  app: {
    head: {
      title: 'ShopFlow — Tu tienda online',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ShopFlow — La mejor experiencia de compra online con los mejores productos al mejor precio.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
      ],
    },
  },

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: false, // Run manually with nuxi typecheck
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // Compatibility
  compatibilityDate: '2024-04-03',
})
