<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  helper: { type: String, default: '' },
  trend: { type: Number, default: null },
  accent: { type: String, default: 'from-purple-500 to-fuchsia-500' },
})
</script>

<template>
  <article class="glass-panel h-full p-5">
    <p class="text-xs uppercase tracking-[0.4em] text-slate-400">{{ title }}</p>
    <div class="mt-3 flex items-end gap-2">
      <p class="text-3xl font-semibold text-white sm:text-4xl">{{ value }}</p>
      <span
        v-if="trend !== null"
        class="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-300"
      >
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </span>
    </div>
    <p class="mt-3 text-sm text-slate-300">
      {{ helper }}
    </p>
    <div
      class="mt-4 h-1.5 rounded-full bg-white/10"
      :class="`bg-gradient-to-r ${accent}`"
    ></div>
  </article>
</template>

