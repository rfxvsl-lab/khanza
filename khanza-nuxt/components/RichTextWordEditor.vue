<template>
  <div class="wrap">
    <ArticleWordLikeToolbar @exec="onToolbar" />
    <div class="editorShell">
      <div
        class="editor"
        ref="editor"
        contenteditable="true"
        spellcheck="false"
        @input="sync"
        v-html="localHtml"
      ></div>
    </div>

    <div class="hint">Tip: Konten disimpan sebagai HTML. Gunakan toolbar untuk heading, warna, tabel, dan quote.</div>
  </div>
</template>

<script setup lang="ts">
import ArticleWordLikeToolbar from '~/components/ArticleWordLikeToolbar.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const editor = ref<HTMLElement | null>(null)
const localHtml = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (v) => {
    if (v !== localHtml.value) {
      localHtml.value = v || ''
      if (editor.value) editor.value.innerHTML = localHtml.value
    }
  }
)

function sync() {
  if (!editor.value) return
  localHtml.value = editor.value.innerHTML
  emit('update:modelValue', localHtml.value)
}

function focusEditor() {
  editor.value?.focus()
}

function onToolbar(payload: { kind: string; value?: any }) {
  focusEditor()
  const el = editor.value
  if (!el) return

  if (payload.kind === 'cmd') {
    document.execCommand(payload.value)
    sync()
    return
  }

  if (payload.kind === 'heading') {
    const level = payload.value as 1 | 2 | 3
    document.execCommand('formatBlock', false, `h${level}`)
    sync()
    return
  }

  if (payload.kind === 'fontSize') {
    // Using execCommand: wraps selection in <font size="x"> (browser-dependent)
    // We also normalize by converting to style where possible.
    document.execCommand('fontSize', false, payload.value)
    // Normalize: replace <font size="..."> with span style
    const html = el.innerHTML
    el.innerHTML = html
      .replace(/<font size="(\d+)">([\s\S]*?)<\/font>/g, (_m, s, inner) => {
        const n = Number(s)
        return `<span style="font-size:${n}px">${inner}</span>`
      })
    sync()
    return
  }

  if (payload.kind === 'color') {
    document.execCommand('foreColor', false, payload.value)
    sync()
    return
  }

  if (payload.kind === 'insertQuote') {
    const sel = window.getSelection()
    const text = sel && sel.toString() ? sel.toString() : 'Teks kutipan...'
    document.execCommand('insertHTML', false, `<blockquote class="word-quote">${escapeHtml(text)}</blockquote>`)
    sync()
    return
  }

  if (payload.kind === 'insertTable') {
    const { rows, cols } = payload.value as { rows: number; cols: number }
    let rowsHtml = ''
    for (let r = 0; r < rows; r++) {
      let tds = ''
      for (let c = 0; c < cols; c++) {
        tds += `<td><div class="cell">&nbsp;</div></td>`
      }
      rowsHtml += `<tr>${tds}</tr>`
    }
    document.execCommand(
      'insertHTML',
      false,
      `<div class="word-table-wrap"><table class="word-table"><tbody>${rowsHtml}</tbody></table></div>`
    )
    sync()
    return
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}
</script>

<style scoped>
.wrap{display:flex; flex-direction:column; gap:10px;}
.editorShell{
  border:1px solid #e5e7eb; border-radius:12px; background:#fff;
  min-height:420px;
}
.editor{
  padding:18px;
  min-height:420px;
  outline:none;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  color:#111827;
}
.editor :deep(h1){font-size:28px; margin:14px 0;}
.editor :deep(h2){font-size:22px; margin:12px 0;}
.editor :deep(h3){font-size:18px; margin:10px 0;}
.editor :deep(p){margin:10px 0; line-height:1.7;}
.editor :deep(ul){margin:10px 0 10px 24px;}
.editor :deep(ol){margin:10px 0 10px 24px;}
.word-quote{margin:12px 0; padding:12px 14px; border-left:4px solid #2563eb; background:#eff6ff; border-radius:10px;}
.word-table-wrap{overflow:auto; margin:14px 0;}
.word-table{width:100%; border-collapse:collapse; min-width:520px;}
.word-table td{border:1px solid #e5e7eb; padding:10px; vertical-align:top;}
.cell{min-height:22px;}
.hint{color:#6b7280; font-size:12px; padding-left:6px;}
</style>
