<script setup>
const props = defineProps({
  lead: { type: Object, required: true },
})
</script>

<template>
  <article
    class="cursor-pointer rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-purple-400"
  >
    <h4 class="font-semibold text-white">{{ lead.nome }}</h4>
  </article>
</template>

