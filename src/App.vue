<script setup>
import { computed, watch, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'CRM', to: '/crm' },
]

const activePath = computed(() => route.path)
const isLoginPage = computed(() => route.path === '/login')

// Controla o scroll do body baseado na rota
const updateBodyScroll = () => {
  if (isLoginPage.value) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
}

onMounted(updateBodyScroll)
watch(isLoginPage, updateBodyScroll)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-[100dvh] bg-versace-night text-slate-100">
    <!-- Mostrar header apenas se não estiver na página de login -->
    <div v-if="!isLoginPage" class="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 md:gap-8 px-3 sm:px-4 pb-6 sm:pb-8 md:pb-10 pt-3 sm:pt-4 md:pt-6 lg:px-8">
      <header class="glass-panel relative overflow-hidden p-4 sm:p-5 md:p-6">
        <div class="pointer-events-none absolute inset-0 opacity-30">
          <div class="absolute -left-10 top-0 h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full bg-purple-500 blur-3xl"></div>
          <div class="absolute right-0 top-10 h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full bg-fuchsia-500 blur-3xl"></div>
        </div>
        <div class="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 md:gap-6">
          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-fuchsia-300">Versace Ops</p>
            <h1 class="gradient-text text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight truncate">
              Inteligência de Leads + CRM
            </h1>
            <p class="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2 sm:line-clamp-none">
              Painel estratégico com insights de referência e funil estilo PipeDrive.
            </p>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <nav class="flex gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm md:text-base font-medium">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="rounded-full border border-transparent px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 transition hover:border-purple-400 active:scale-95"
                :class="
                  activePath.startsWith(link.to)
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500 shadow-neon'
                    : 'bg-white/5'
                "
              >
                {{ link.name }}
              </RouterLink>
            </nav>
            <button
              @click="handleLogout"
              class="rounded-full border border-red-500/50 bg-red-500/10 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 text-xs sm:text-sm font-medium text-red-300 transition hover:bg-red-500/20 active:scale-95 whitespace-nowrap"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main class="pb-6 sm:pb-8 md:pb-12">
        <RouterView />
      </main>
    </div>
    
    <!-- Página de login sem header -->
    <RouterView v-else />
  </div>
</template>
