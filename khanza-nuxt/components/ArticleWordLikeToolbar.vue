<template>
  <div class="toolbar">
    <div class="group">
      <button type="button" class="btn" @click="cmd('bold')"><b>B</b></button>
      <button type="button" class="btn" @click="cmd('italic')"><i>I</i></button>
      <button type="button" class="btn" @click="cmd('underline')"><u>U</u></button>
    </div>

    <div class="group">
      <button type="button" class="btn" @click="execHeading(1)">H1</button>
      <button type="button" class="btn" @click="execHeading(2)">H2</button>
      <button type="button" class="btn" @click="execHeading(3)">H3</button>
    </div>

    <div class="group">
      <button type="button" class="btn" @click="cmd('insertUnorderedList')">• List</button>
      <button type="button" class="btn" @click="cmd('insertOrderedList')">1. List</button>
    </div>

    <div class="group">
      <select class="select" v-model="fontSize" @change="applyFontSize">
        <option value="">Size</option>
        <option value="12">12</option>
        <option value="14">14</option>
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="20">20</option>
      </select>

      <select class="select" v-model="textColor" @change="applyColor">
        <option value="">Color</option>
        <option value="#111827">Default</option>
        <option value="#2563eb">Blue</option>
        <option value="#16a34a">Green</option>
        <option value="#dc2626">Red</option>
        <option value="#9333ea">Purple</option>
      </select>
    </div>

    <div class="group">
      <button type="button" class="btn" @click="cmd('justifyLeft')">Left</button>
      <button type="button" class="btn" @click="cmd('justifyCenter')">Center</button>
      <button type="button" class="btn" @click="cmd('justifyRight')">Right</button>
    </div>

    <div class="group">
      <button type="button" class="btn" @click="insertTable">Tabel</button>
      <button type="button" class="btn" @click="insertQuote">Quote</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const fontSize = ref<string>('')
const textColor = ref<string>('')

const emit = defineEmits<{
  (e: 'exec', payload: { kind: string; value?: any }): void
}>()

function cmd(command: string) {
  emit('exec', { kind: 'cmd', value: command })
}

function execHeading(level: 1 | 2 | 3) {
  emit('exec', { kind: 'heading', value: level })
}

function applyFontSize() {
  if (!fontSize.value) return
  emit('exec', { kind: 'fontSize', value: fontSize.value })
  fontSize.value = ''
}

function applyColor() {
  if (!textColor.value) return
  emit('exec', { kind: 'color', value: textColor.value })
  textColor.value = ''
}

function insertTable() {
  emit('exec', { kind: 'insertTable', value: { rows: 3, cols: 3 } })
}

function insertQuote() {
  emit('exec', { kind: 'insertQuote' })
}
</script>

<style scoped>
.toolbar{
  display:flex; flex-wrap:wrap; gap:10px;
  padding:10px; border:1px solid #e5e7eb; border-radius:12px;
  background:#fff;
}
.group{display:flex; gap:8px; align-items:center; flex-wrap:wrap;}
.btn{
  border:1px solid #e5e7eb; background:#ffffff; padding:6px 10px; border-radius:10px;
  cursor:pointer; font-weight:600; color:#111827;
}
.btn:hover{background:#f9fafb}
.select{border:1px solid #e5e7eb; border-radius:10px; padding:6px 10px; background:#fff; font-weight:600; color:#111827;}
</style>
