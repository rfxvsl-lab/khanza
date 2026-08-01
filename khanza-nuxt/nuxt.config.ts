import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/icon',
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  site: {
    url: 'https://khanzarepaint.com',
    name: 'Khanza Repaint',
    description: 'Premium automotive painting and detailing services.',
    defaultLocale: 'id',
  },
  runtimeConfig: {
    tursoConnectionUrl: process.env.TURSO_CONNECTION_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  },
})
