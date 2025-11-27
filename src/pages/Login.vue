<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-versace-night flex items-center justify-center px-3 sm:px-4 md:px-6">
    <!-- Efeitos de fundo responsivos -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-10 top-10 h-48 w-48 sm:h-72 sm:w-72 md:-left-20 md:top-20 md:h-96 md:w-96 rounded-full bg-purple-500 blur-3xl opacity-30"></div>
      <div class="absolute -right-10 bottom-10 h-40 w-40 sm:h-60 sm:w-60 md:right-0 md:bottom-20 md:h-80 md:w-80 rounded-full bg-fuchsia-500 blur-3xl opacity-30"></div>
      <div class="absolute left-1/2 top-1/2 h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 blur-3xl opacity-20"></div>
    </div>

    <!-- Card de Login -->
    <div class="relative w-full max-w-[95%] sm:max-w-md">
      <div class="glass-panel p-5 xs:p-6 sm:p-8 md:p-10">
        <!-- Header -->
        <div class="mb-6 sm:mb-8 text-center">
          <div class="mb-3 sm:mb-4 inline-block">
            <div class="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-neon mx-auto flex items-center justify-center">
              <svg class="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 class="gradient-text text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2">Versace Ops</h1>
          <p class="text-xs sm:text-sm text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Acesso Restrito</p>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-5 md:space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full rounded-lg sm:rounded-xl border border-versace-border bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <!-- Senha -->
          <div>
            <label for="password" class="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
              Senha
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-lg sm:rounded-xl border border-versace-border bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- Erro -->
          <div v-if="error" class="rounded-lg sm:rounded-xl border border-red-500/50 bg-red-500/10 p-2.5 sm:p-3 text-xs sm:text-sm text-red-300">
            {{ error }}
          </div>

          <!-- Botão de Login -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-neon transition-all hover:from-purple-700 hover:to-fuchsia-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Entrar</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-5 sm:mt-6 md:mt-8 text-center">
          <p class="text-[10px] sm:text-xs text-slate-500">
            Acesso exclusivo para administradores autorizados
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  @apply bg-versace-panel/90 border border-versace-border rounded-2xl backdrop-blur-xl shadow-neon;
}

.gradient-text {
  background: linear-gradient(120deg, #d8b4fe 0%, #a855f7 50%, #f0abfc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>

