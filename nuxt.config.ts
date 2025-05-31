// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
   nitro: {
    routeRules: {
      // Apply to all routes
      '/**': {
        headers: {
          'X-Frame-Options': 'ALLOWALL', // or 'SAMEORIGIN' for same-domain iframe
        },
      },
    },
  },
})
