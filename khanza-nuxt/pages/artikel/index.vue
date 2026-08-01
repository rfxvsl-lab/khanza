<template>
  <section class="page">
    <div class="container">
      <div class="top">
        <h1 class="title">Artikel</h1>
        <div class="filters">
          <input v-model="search" class="input" placeholder="Cari judul, slug, atau ringkasan..." />
          <input v-model="tag" class="input" placeholder="Tag (mis: promo)" />
        </div>
      </div>

      <div v-if="pending" class="grid skeleton">
        <div v-for="i in 8" :key="i" class="card sk"></div>
      </div>

      <div v-else class="grid">
        <NuxtLink
          v-for="a in articles"
          :key="a.id"
          :to="`/artikel/${a.slug}`"
          class="card"
        >
          <div class="cover" v-if="a.coverImage">
            <img :src="a.coverImage" :alt="a.title" loading="lazy" />
          </div>
          <div class="meta">
            <div class="badges">
              <span v-if="a.status === undefined" class="badge">Artikel</span>
              <span v-for="t in (a.tags || []).slice(0,3)" :key="t" class="badge">{{ t }}</span>
            </div>
            <h2 class="h">{{ a.title }}</h2>
            <p class="ex">{{ a.excerpt }}</p>
            <div class="bottom">
              <span class="date">{{ formatDate(a.publishedAt || a.createdAt) }}</span>
              <span class="arrow">Baca →</span>
            </div>
          </div>
        </NuxtLink>

        <div v-if="articles.length === 0" class="empty">
          Tidak ada artikel.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const search = ref('')
const tag = ref('')

const { data, pending, refresh } = await useFetch('/api/articles', {
  method: 'GET',
  params: computed(() => ({ search: search.value || undefined, tag: tag.value || undefined })),
})

const articles = computed(() => (data.value?.data || []))

watch([search, tag], () => {
  refresh()
})

function formatDate(d: any) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: '2-digit' })
}
</script>

<style scoped>
.page{padding:26px 0;}
.container{width:min(1100px, 92vw); margin:0 auto;}
.top{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; flex-wrap:wrap;}
.title{font-size:32px; font-weight:900; color:#111827;}
.filters{display:flex; gap:10px; flex-wrap:wrap;}
.input{border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; min-width:260px; outline:none; background:#fff;}
.grid{display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:16px;}
@media (max-width: 900px){.grid{grid-template-columns: repeat(2, minmax(0,1fr));}}
@media (max-width: 600px){.grid{grid-template-columns: 1fr;}}
.card{display:block; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; background:#fff; text-decoration:none; color:inherit; transition:transform .12s ease, box-shadow .12s ease;}
.card:hover{transform: translateY(-2px); box-shadow: 0 10px 30px rgba(17,24,39,0.10);}
.cover{height:180px; background:#f3f4f6;}
.cover img{width:100%; height:100%; object-fit:cover; display:block;}
.meta{padding:14px;}
.badges{display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;}
.badge{font-size:12px; font-weight:800; padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; background:#f9fafb; color:#374151;}
.h{font-size:18px; font-weight:900; margin:0 0 8px 0; line-height:1.25;}
.ex{margin:0 0 12px 0; color:#6b7280; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient: vertical; overflow:hidden;}
.bottom{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.date{color:#6b7280; font-weight:700; font-size:12px;}
.arrow{color:#2563eb; font-weight:900;}
.empty{grid-column:1/-1; border:1px dashed #e5e7eb; border-radius:16px; padding:18px; text-align:center; color:#6b7280; font-weight:800; background:#fff;}
.skeleton .sk{height:270px; border-radius:16px; background:linear-gradient(90deg,#f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%); background-size:400% 100%; animation:shimmer 1.2s infinite; border:1px solid #e5e7eb;}
@keyframes shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
</style>
