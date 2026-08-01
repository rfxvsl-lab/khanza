<template>
  <section class="page">
    <div class="container">
      <div class="head">
        <div>
          <h1 class="title">Buat Artikel</h1>
          <p class="sub">Format seperti Microsoft Word, konten disimpan HTML dan tampil dinamis.</p>
        </div>
        <div class="actions">
          <NuxtLink to="/admin/artikel" class="btn">← Kembali</NuxtLink>
          <button class="btn primary" type="button" :disabled="saving" @click="onSave">Simpan</button>
        </div>
      </div>

      <form class="form" @submit.prevent="onSave">
        <div class="grid">
          <div class="col">
            <label class="label">Judul</label>
            <input v-model="form.title" class="input" required />
          </div>
          <div class="col">
            <label class="label">Slug</label>
            <input v-model="form.slug" class="input" placeholder="otomatis jika kosong" />
          </div>
        </div>

        <div class="grid">
          <div class="col">
            <label class="label">Ringkasan (excerpt)</label>
            <textarea v-model="form.excerpt" class="textarea" rows="3" placeholder="Ringkasan singkat untuk preview"></textarea>
          </div>
          <div class="col">
            <label class="label">Cover Image (URL)</label>
            <input v-model="form.coverImage" class="input" placeholder="https://..." />
            <div class="preview" v-if="form.coverImage">
              <img :src="form.coverImage" alt="cover" />
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="col">
            <label class="label">Tags (pisahkan koma)</label>
            <input v-model="tagsInput" class="input" placeholder="promo, tips, perusahaan" />
          </div>
          <div class="col">
            <label class="label">Status</label>
            <select v-model="form.status" class="input">
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
        </div>

        <div class="grid">
          <div class="col">
            <label class="label">Published At</label>
            <input type="date" v-model="publishedDateInput" class="input" />
          </div>
          <div class="col">
            <label class="label">Author Name</label>
            <input v-model="form.authorName" class="input" placeholder="Admin" />
          </div>
        </div>

        <div class="section">
          <div class="sectionHead">
            <h2 class="sectionTitle">Konten</h2>
            <div class="right">
              <NuxtLink v-if="form.slug" :to="`/artikel/${form.slug}`" target="_blank" class="btn">Preview</NuxtLink>
            </div>
          </div>

          <RichTextWordEditor v-model="form.contentHtml" />
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import RichTextWordEditor from '~/components/RichTextWordEditor.vue'

definePageMeta({ layout: 'admin' })

const saving = ref(false)

const form = reactive<any>({
  title: '',
  slug: '',
  excerpt: '',
  coverImage: '',
  tags: [],
  status: 'DRAFT',
  publishedAt: null,
  authorName: 'Admin',
  contentHtml: '<h2>Mulai menulis...</h2><p>Gunakan toolbar di atas untuk format seperti Microsoft Word.</p>',
})

const tagsInput = computed({
  get() {
    return (form.tags || []).join(', ')
  },
  set(v: string) {
    form.tags = v.split(',').map((t) => t.trim()).filter(Boolean)
  }
})

const publishedDateInput = computed({
  get() {
    if (!form.publishedAt) return ''
    const d = new Date(form.publishedAt)
    return d.toISOString().slice(0, 10)
  },
  set(v: string) {
    if (!v) {
      form.publishedAt = null
      return
    }
    // Use local date to ISO
    const dt = new Date(v + 'T00:00:00')
    form.publishedAt = dt
  }
})

async function onSave() {
  saving.value = true
  try {
    // If published but no publishedAt, set to now
    if (form.status === 'PUBLISHED' && !form.publishedAt) {
      form.publishedAt = new Date()
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      coverImage: form.coverImage,
      tags: form.tags,
      status: form.status,
      publishedAt: form.publishedAt,
      authorName: form.authorName,
      contentHtml: form.contentHtml,
    }

    await $fetch('/api/admin/articles', { method: 'POST', body: payload })
    navigateTo('/admin/artikel')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page{padding:22px 0;}
.container{width:min(1200px, 94vw); margin:0 auto;}
.head{display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; margin-bottom:14px;}
.title{margin:0; font-size:26px; font-weight:1000; color:#111827;}
.sub{margin:6px 0 0; color:#6b7280; font-weight:700;}
.actions{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}
.btn{display:inline-flex; align-items:center; justify-content:center; border:1px solid #e5e7eb; background:#fff; padding:10px 12px; border-radius:12px; text-decoration:none; color:#111827; font-weight:900; cursor:pointer;}
.btn.primary{background:#2563eb; color:#fff; border-color:#2563eb;}
.form{display:flex; flex-direction:column; gap:14px;}
.grid{display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:14px;}
@media (max-width: 900px){.grid{grid-template-columns: 1fr;}}
.col{display:flex; flex-direction:column; gap:8px;}
.label{font-weight:1000; color:#374151; font-size:13px;}
.input, .textarea, select.input{
  border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px;
  background:#fff; outline:none; color:#111827; font-weight:700;
}
.textarea{font-weight:700;}
.preview{margin-top:10px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; overflow:hidden; max-height:140px;}
.preview img{width:100%; height:140px; object-fit:cover; display:block;}
.section{border:1px solid #e5e7eb; border-radius:18px; background:#fff; padding:14px;}
.sectionHead{display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;}
.sectionTitle{margin:0; font-size:16px; font-weight:1000; color:#111827;}
.right{display:flex; gap:10px;}
</style>
