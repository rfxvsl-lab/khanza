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
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'keywords', content: 'khanza repaint, bengkel cat mobil, body repair malang, detailing mobil, poles mobil malang, bengkel mobil karang ploso, nano ceramic coating' },
        { name: 'author', content: 'Khanza Repaint' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-baru.png' }
      ]
    }
  },
  site: {
    url: 'https://khanzarepaint.web.id',
    name: 'Khanza Repaint',
    description: 'Bengkel spesialis cat mobil, body repair, dan premium detailing di Malang. Kami mengembalikan pesona mobil Anda seperti baru dengan material premium.',
    defaultLocale: 'id',
  },
  runtimeConfig: {
    tursoConnectionUrl: process.env.TURSO_CONNECTION_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM,
  },
})
