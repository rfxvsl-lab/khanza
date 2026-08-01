<template>
  <section class="page">
    <div class="container">
      <div class="head">
        <div>
          <h1 class="title">ZCRUD - Artikel</h1>
          <p class="sub">Kelola artikel untuk website /artikel dan preview di halaman depan.</p>
        </div>

        <div class="actions">
          <input v-model="search" class="input" placeholder="Cari..." />
          <NuxtLink to="/admin/artikel/create" class="btn primary">+ Artikel Baru</NuxtLink>
        </div>
      </div>

      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Status</th>
              <th>Slug</th>
              <th>Published At</th>
              <th>Tags</th>
              <th style="width:220px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in rows" :key="a.id">
              <td>
                <div class="tTitle">{{ a.title }}</div>
                <div v-if="a.excerpt" class="tSub">{{ a.excerpt }}</div>
              </td>
              <td>
                <span :class="['status', a.status === 'PUBLISHED' ? 'ok' : 'draft']">{{ a.status }}</span>
              </td>
              <td><span class="mono">{{ a.slug }}</span></td>
              <td>{{ formatDate(a.publishedAt) }}</td>
              <td>
                <div class="tags">
                  <span v-for="t in (a.tags || []).slice(0,3)" :key="t" class="tag">{{ t }}</span>
                  <span v-if="(a.tags||[]).length > 3" class="more">+{{ (a.tags||[]).length - 3 }}</span>
                </div>
              </td>
              <td>
                <div class="btnRow">
                  <NuxtLink :to="`/admin/artikel/${a.id}`" class="btn">Edit</NuxtLink>
                  <NuxtLink :to="`/artikel/${a.slug}`" target="_blank" class="btn">Preview</NuxtLink>
                  <button class="btn danger" type="button" @click="onDelete(a.id)">Hapus</button>
                </div>
              </td>
            </tr>

            <tr v-if="rows.length === 0">
              <td colspan="6" class="empty">Belum ada artikel.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const search = ref('')

const { data, pending, refresh } = await useFetch('/api/admin/articles', {
  method: 'GET',
  params: computed(() => ({ search: search.value || undefined })),
})

const rows = computed(() => data.value?.data || [])

watch(search, () => refresh())

async function onDelete(id: number) {
  if (!confirm('Yakin menghapus artikel ini?')) return
  await $fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
  await refresh()
}

function formatDate(d: any) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })
}
</script>

<style scoped>
.page{padding:22px 0;}
.container{width:min(1200px, 94vw); margin:0 auto;}
.head{display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; margin-bottom:14px;}
.title{margin:0; font-size:26px; font-weight:1000; color:#111827;}
.sub{margin:6px 0 0; color:#6b7280; font-weight:700;}
.actions{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}
.input{border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; min-width:240px; outline:none; background:#fff;}
.btn{display:inline-flex; align-items:center; justify-content:center; border:1px solid #e5e7eb; background:#fff; padding:10px 12px; border-radius:12px; text-decoration:none; color:#111827; font-weight:900; cursor:pointer;}
.btn.primary{background:#2563eb; color:#fff; border-color:#2563eb;}
.btnRow{display:flex; gap:8px; flex-wrap:wrap;}
.btn.danger{border-color:#ef4444; color:#ef4444; background:#fff;}
.tableWrap{border:1px solid #e5e7eb; border-radius:18px; background:#fff; overflow:auto;}
.table{width:100%; border-collapse:collapse;}
th, td{padding:12px 12px; border-bottom:1px solid #f3f4f6; vertical-align:top;}
th{text-align:left; background:#fafafa; color:#374151; font-size:12px; font-weight:1000; letter-spacing:.02em;}
.tTitle{font-weight:1000; color:#111827;}
.tSub{color:#6b7280; font-weight:700; margin-top:4px; font-size:12px;}
.status{display:inline-flex; padding:6px 10px; border-radius:999px; border:1px solid #e5e7eb; font-weight:1000; font-size:12px;}
.status.ok{border-color:#16a34a; color:#16a34a; background:#f0fdf4;}
.status.draft{border-color:#6b7280; color:#374151; background:#f9fafb;}
.mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:12px; color:#374151;}
.tags{display:flex; gap:8px; flex-wrap:wrap; align-items:center;}
.tag{font-size:12px; font-weight:900; padding:5px 9px; border-radius:999px; border:1px solid #e5e7eb; background:#f9fafb; color:#374151;}
.more{font-size:12px; font-weight:900; color:#6b7280;}
.empty{color:#6b7280; font-weight:900; text-align:center; padding:18px;}
</style>
