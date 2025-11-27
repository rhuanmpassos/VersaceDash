<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import dayjs from 'dayjs'
import LeadCard from '../components/LeadCard.vue'
import { LEAD_STAGES, useLeadStore } from '../store/leadStore'

const store = useLeadStore()
const selectedLead = ref(null)
const feedback = ref('')
const formError = ref('')
const stageFeedback = ref('')
const showModal = ref(false)

const leadForm = reactive({
  nome: '',
  whatsapp: '',
  referralCode: '',
  stage: LEAD_STAGES[0].id,
})

const stageMeta = {
  NA_BASE: {
    title: 'Na Base',
    border: 'border-purple-500/40',
  },
  EM_CONTATO: {
    title: 'Em Contato',
    border: 'border-sky-400/40',
  },
  COMPRADO: {
    title: 'Comprado',
    border: 'border-emerald-400/40',
  },
  REJEITADO: {
    title: 'Rejeitado',
    border: 'border-rose-400/40',
  },
}

const lanes = reactive({
  NA_BASE: [],
  EM_CONTATO: [],
  COMPRADO: [],
  REJEITADO: [],
})

const laneRefs = ref({})
const sortableInstances = ref({})
const sortableElements = ref({})

const setLaneRef = (el, stageId) => {
  if (el) {
    laneRefs.value[stageId] = el
    initSortable(stageId, el)
  }
}

const initSortable = (stageId, el) => {
  if (!el) return
  
  // Verificar se este elemento já foi inicializado
  if (sortableElements.value[stageId] === el && sortableInstances.value[stageId]) {
    return
  }

  // Destruir instância anterior se existir
  if (sortableInstances.value[stageId]) {
    try {
      sortableInstances.value[stageId].destroy()
    } catch (e) {
      // Ignorar erros ao destruir instância
    }
  }

  sortableInstances.value[stageId] = Sortable.create(el, {
    group: 'leads',
    animation: 150,
    ghostClass: 'opacity-30',
    chosenClass: 'opacity-50',
    onEnd: async (evt) => {
      const { newIndex, oldIndex, item } = evt
      
      // Se não mudou de posição, não fazer nada
      if (newIndex === oldIndex) return

      const oldStageId = evt.from.dataset.stageId
      const newStageId = evt.to.dataset.stageId

      // Se não mudou de estágio, não fazer nada
      if (!oldStageId || !newStageId || oldStageId === newStageId) {
        return
      }

      // Limpar mensagens anteriores
      formError.value = ''
      feedback.value = ''

      // O item é o div wrapper, então pegamos o data-lead-id dele
      const leadId = item.dataset.leadId
      const lead = store.leads.find((l) => l.id === leadId)
      
      if (!lead) {
        formError.value = 'Lead não encontrado.'
        await store.loadLeads()
        return
      }

      // Se o lead já está no estágio de destino, não fazer nada
      if (lead.stage === newStageId) {
        await syncLanes(store.leads)
        return
      }

      try {
        const result = await store.updateLeadStage(leadId, newStageId)
        // Limpar qualquer erro anterior
        formError.value = ''
        feedback.value = `Lead ${lead.nome} movido para ${stageMeta[newStageId].title}`
        // Atualizar os lanes após mover
        await syncLanes(store.leads)
        // Limpar feedback após 3 segundos
        setTimeout(() => {
          if (feedback.value.includes(lead.nome)) {
            feedback.value = ''
          }
        }, 3000)
      } catch (error) {
        console.error('Erro ao mover lead:', error)
        // Verificar se o lead foi realmente atualizado no store
        const updatedLead = store.leads.find((l) => l.id === leadId)
        if (updatedLead && updatedLead.stage === newStageId) {
          // Se o lead foi atualizado no store, significa que funcionou
          // Apenas atualizar os lanes e mostrar sucesso
          formError.value = ''
          feedback.value = `Lead ${lead.nome} movido para ${stageMeta[newStageId].title}`
          await syncLanes(store.leads)
          setTimeout(() => {
            if (feedback.value.includes(lead.nome)) {
              feedback.value = ''
            }
          }, 3000)
        } else {
          // Se realmente falhou, mostrar erro
          feedback.value = ''
          formError.value = 'Não foi possível mover o lead. Tente novamente.'
          // Recarregar os leads para reverter a mudança visual
          await store.loadLeads()
          // Limpar erro após 5 segundos
          setTimeout(() => {
            formError.value = ''
          }, 5000)
        }
      }
    },
  })
  
  // Guardar referência ao elemento
  sortableElements.value[stageId] = el
}

const resetForm = () => {
  leadForm.nome = ''
  leadForm.whatsapp = ''
  leadForm.referralCode = ''
  leadForm.stage = LEAD_STAGES[0].id
}

const syncLanes = async (leads) => {
  if (!Array.isArray(leads)) {
    console.warn('syncLanes recebeu dados inválidos:', leads)
    return
  }
  
  LEAD_STAGES.forEach((stage) => {
    const filtered = leads.filter((lead) => {
      const leadStage = lead?.stage ?? 'NA_BASE'
      return leadStage === stage.id
    })
    
    // Verificar se realmente mudou antes de atualizar
    const currentIds = lanes[stage.id].map(l => l.id).sort().join(',')
    const newIds = filtered.map(l => l.id).sort().join(',')
    
    if (currentIds !== newIds) {
      // Limpar o array existente e adicionar os novos itens para manter a reatividade
      lanes[stage.id].splice(0, lanes[stage.id].length, ...filtered)
    }
  })
  await nextTick()
}

onMounted(async () => {
  await store.ensureLeads()
  // Garantir que os lanes sejam arrays antes de sincronizar
  LEAD_STAGES.forEach((stage) => {
    if (!Array.isArray(lanes[stage.id])) {
      lanes[stage.id] = []
    }
  })
  // Garantir que os lanes sejam sincronizados após carregar
  if (store.leads && Array.isArray(store.leads)) {
    await syncLanes(store.leads)
  }
})

const leadsList = computed(() => store.leads ?? [])
const isSyncing = ref(false)
const lastLeadsHash = ref('')

watch(
  leadsList,
  async (leads) => {
    if (!leads || !Array.isArray(leads) || isSyncing.value) {
      return
    }
    
    // Criar hash dos IDs dos leads para verificar se realmente mudou
    const leadsHash = leads.map(l => `${l.id}:${l.stage}`).sort().join('|')
    if (leadsHash === lastLeadsHash.value) {
      return // Não mudou, não precisa atualizar
    }
    
    isSyncing.value = true
    lastLeadsHash.value = leadsHash
    
    try {
      await syncLanes(leads)
      // Reinicializar SortableJS após atualizar os lanes
      await nextTick()
      LEAD_STAGES.forEach((stage) => {
        if (laneRefs.value[stage.id]) {
          initSortable(stage.id, laneRefs.value[stage.id])
        }
      })
      if (selectedLead.value) {
        const updated =
          store.leads.find((lead) => lead.id === selectedLead.value?.id) ?? null
        selectedLead.value = updated
        if (!updated) {
          showModal.value = false
        }
      }
    } finally {
      isSyncing.value = false
    }
  },
  { immediate: true, deep: false },
)

const selectLead = (lead) => {
  selectedLead.value = lead
  stageFeedback.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedLead.value = null
  stageFeedback.value = ''
}

const handleDragChange = async (evt, newStage) => {
  if (!evt.added) return
  const movedLead = evt.added.element
  try {
    await store.updateLeadStage(movedLead.id, newStage)
    feedback.value = `Lead ${movedLead.nome} movido para ${stageMeta[newStage].title}`
  } catch (error) {
    formError.value = 'Não foi possível mover o lead. Tente novamente.'
    await store.loadLeads()
  }
}

const handleStageSelection = async (stageId) => {
  if (!selectedLead.value || selectedLead.value.stage === stageId) return
  stageFeedback.value = ''
  try {
    await store.updateLeadStage(selectedLead.value.id, stageId)
    stageFeedback.value = `Movido para ${stageMeta[stageId].title}`
  } catch (error) {
    stageFeedback.value = 'Erro ao mover estágio. Tente novamente.'
  }
}

const submitLead = async () => {
  formError.value = ''
  if (!leadForm.nome || !leadForm.whatsapp) {
    formError.value = 'Nome e WhatsApp são obrigatórios.'
    return
  }

  try {
    const payload = { ...leadForm }
    const lead = await store.createLead(payload)
    feedback.value = `Lead ${lead.nome} criado com sucesso.`
    resetForm()
  } catch (error) {
    formError.value = 'Erro ao criar lead.'
  }
}

const totalLeads = computed(() => store.leads.length)
const busiestStage = computed(() => {
  const max = Object.entries(lanes).reduce(
    (acc, [stage, list]) => (list.length > acc.count ? { stage, count: list.length } : acc),
    { stage: 'NA_BASE', count: 0 },
  )
  return max
})
</script>

<template>
  <section class="space-y-10 pb-8">
    <header class="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
      <div>
        <p class="uppercase tracking-[0.4em] text-slate-500">CRM</p>
        <p class="text-base text-slate-300">
          Kanban inspirado no PipeDrive. Arraste cards para atualizar o estágio.
        </p>
      </div>
      <div class="flex gap-6 text-right">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Leads</p>
          <p class="text-2xl font-semibold text-white">{{ totalLeads }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Estágio mais cheio</p>
          <p class="font-medium text-fuchsia-300">
            {{ stageMeta[busiestStage.stage]?.title ?? '—' }} ({{ busiestStage.count }})
          </p>
        </div>
      </div>
    </header>

    <div class="grid gap-12 lg:grid-cols-[1fr,300px]">
      <section class="space-y-6">
        <div class="grid gap-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="stage in LEAD_STAGES"
            :key="stage.id"
            class="glass-panel flex w-full flex-col border p-5"
            :class="stageMeta[stage.id].border"
          >
            <header>
              <p class="text-xs uppercase tracking-[0.4em] text-slate-500">{{ stage.label }}</p>
              <p class="text-sm text-slate-300">{{ lanes[stage.id]?.length ?? 0 }} leads</p>
            </header>
            <div
              :ref="(el) => setLaneRef(el, stage.id)"
              :data-stage-id="stage.id"
              class="mt-6 min-h-[200px] flex flex-col gap-4"
            >
              <div
                v-for="lead in lanes[stage.id]"
                :key="lead.id"
                :data-lead-id="lead.id"
              >
                <LeadCard
                  :lead="lead"
                  @click="selectLead(lead)"
                />
              </div>
              <div
                v-if="!lanes[stage.id] || lanes[stage.id].length === 0"
                class="py-8 text-center text-sm text-slate-500"
              >
                Nenhum lead neste estágio
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside class="space-y-6">
        <article class="glass-panel border border-white/5 p-6">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Novo lead</p>
          <h3 class="mt-3 text-lg font-semibold text-white">Cadastrar manualmente</h3>

          <form class="mt-6 space-y-5" @submit.prevent="submitLead">
            <label class="text-sm text-slate-300">
              Nome
              <input
                v-model="leadForm.nome"
                type="text"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-purple-400 focus:outline-none"
              />
            </label>
            <label class="text-sm text-slate-300">
              WhatsApp
              <input
                v-model="leadForm.whatsapp"
                type="text"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-purple-400 focus:outline-none"
              />
            </label>
            <label class="text-sm text-slate-300">
              Código de referência
              <input
                v-model="leadForm.referralCode"
                type="text"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 uppercase tracking-[0.2em] focus:border-purple-400 focus:outline-none"
              />
            </label>
            <label class="text-sm text-slate-300">
              Estágio
              <select
                v-model="leadForm.stage"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-purple-400 focus:outline-none"
              >
                <option v-for="stage in LEAD_STAGES" :key="stage.id" :value="stage.id">
                  {{ stage.label }}
                </option>
              </select>
            </label>
            <button
              type="submit"
              class="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 py-3 font-semibold text-white shadow-neon"
              :disabled="store.submitting"
            >
              {{ store.submitting ? 'Enviando...' : 'Adicionar lead' }}
            </button>
            <p v-if="formError" class="text-sm text-rose-300">{{ formError }}</p>
            <p v-if="feedback" class="text-sm text-emerald-300">{{ feedback }}</p>
          </form>
        </article>
      </aside>
    </div>

    <transition name="fade">
      <div
        v-if="showModal && selectedLead"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
        @click.self="closeModal"
      >
        <div class="glass-panel relative w-full max-w-xl border border-white/10 p-6">
          <button
            class="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 hover:border-purple-400"
            @click="closeModal"
          >
            Fechar
          </button>
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Lead</p>
          <h3 class="mt-2 text-2xl font-semibold text-white">{{ selectedLead.nome }}</h3>
          <p class="text-sm text-slate-300">{{ selectedLead.whatsapp }}</p>

          <div class="mt-5 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Referência</p>
              <p class="mt-1 text-white">
                {{ selectedLead.referrer?.nome ?? selectedLead.referralCode ?? 'Orgânico' }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Criado em</p>
              <p class="mt-1 text-white">
                {{ dayjs(selectedLead.createdAt).format('DD/MM/YYYY HH:mm') }}
              </p>
            </div>
          </div>

          <div class="mt-6">
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Mover estágio</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <button
                v-for="stage in LEAD_STAGES"
                :key="stage.id"
                type="button"
                class="rounded-2xl border px-4 py-2 text-sm font-semibold transition"
                :class="
                  selectedLead.stage === stage.id
                    ? 'border-purple-400 bg-purple-600/30 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-400'
                "
                @click="handleStageSelection(stage.id)"
              >
                {{ stage.label }}
              </button>
            </div>
            <p
              v-if="stageFeedback"
              class="mt-4 text-sm"
              :class="stageFeedback.startsWith('Movido') ? 'text-emerald-300' : 'text-rose-300'"
            >
              {{ stageFeedback }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

