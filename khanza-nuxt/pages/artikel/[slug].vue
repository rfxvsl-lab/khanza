<template>
  <article class="page">
    <div class="container">
      <NuxtLink to="/artikel" class="back">← Kembali ke Artikel</NuxtLink>

      <div v-if="pending" class="loading">Memuat...</div>

      <div v-else-if="article" class="wrap">
        <div class="hero" v-if="article.coverImage">
          <img :src="article.coverImage" :alt="article.title" />
        </div>

        <header class="header">
          <h1 class="title">{{ article.title }}</h1>
          <div class="row">
            <span class="pill">{{ article.authorName || 'Admin' }}</span>
            <span class="dot">•</span>
            <span class="date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
          </div>

          <p class="excerpt" v-if="article.excerpt">{{ article.excerpt }}</p>

          <div class="tags" v-if="(article.tags || []).length">
            <span v-for="t in article.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </header>

        <section class="content" v-html="article.contentHtml"></section>
      </div>

      <div v-else class="empty">Artikel tidak ditemukan.</div>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

const { data, pending, error } = await useFetch(`/api/articles/${route.params.slug}`, {
  method: 'GET',
})

const article = computed(() => data.value?.data || null)

if (error.value) {
  // Let Nuxt handle error page
  throw error.value
}

function formatDate(d: any) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' })
}
</script>

<style scoped>
.page{padding:26px 0;}
.container{width:min(900px, 92vw); margin:0 auto;}
.back{color:#2563eb; font-weight:900; text-decoration:none;}
.loading{padding:22px; border:1px solid #e5e7eb; border-radius:16px; background:#fff;}
.empty{padding:22px; border:1px dashed #e5e7eb; border-radius:16px; background:#fff; color:#6b7280; font-weight:800;}
.wrap{background:#fff; border:1px solid #e5e7eb; border-radius:20px; overflow:hidden;}
.hero{height:320px; background:#f3f4f6;}
.hero img{width:100%; height:100%; object-fit:cover; display:block;}
.header{padding:18px 18px 0 18px;}
.title{margin:0; font-size:34px; line-height:1.2; font-weight:1000; color:#111827;}
.row{display:flex; align-items:center; gap:10px; margin-top:10px; color:#6b7280; font-weight:800;}
.pill{background:#f9fafb; border:1px solid #e5e7eb; padding:7px 12px; border-radius:999px;}
.dot{opacity:.7}
.date{font-size:13px;}
.excerpt{margin:14px 0 12px 0; color:#6b7280; font-weight:700; line-height:1.7;}
.tags{display:flex; flex-wrap:wrap; gap:8px; padding-bottom:12px;}
.tag{font-size:12px; font-weight:900; padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:#f9fafb; color:#374151;}
.content{padding:18px;}
.content :deep(h1){font-size:28px; margin:16px 0;}
.content :deep(h2){font-size:22px; margin:14px 0;}
.content :deep(h3){font-size:18px; margin:12px 0;}
.content :deep(p){line-height:1.85; margin:12px 0; color:#111827;}
.content :deep(ul), .content :deep(ol){padding-left:22px; margin:12px 0;}
.content :deep(blockquote){margin:14px 0; padding:12px 14px; border-left:4px solid #2563eb; background:#eff6ff; border-radius:12px; color:#111827;}
.content :deep(table){width:100%; border-collapse:collapse;}
.content :deep(td){border:1px solid #e5e7eb; padding:10px;}
</style>
