<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-xl q-gutter-md">
      <div class="col-auto">
        <q-input
          v-model="newLotteryName"
          label="Nou sorteig"
          outlined
          dense
          @keyup.enter="createLotteryName"
          class="q-mr-sm"
        >
          <template v-slot:after>
            <q-btn
              flat
              color="primary"
              icon="add"
              label="Afegir"
              @click="createLotteryName"
              dense
            />
          </template>
        </q-input>
      </div>

      <div class="col-auto">
        <SpSelect
          v-model="selectedLotteryName"
          :options="lotteryNames"
          :option-label="(lotteryName) => `${lotteryName.description} ${lotteryName.fallaYearFk}`"
          option-value="id"
          label="Sorteig"
        />
      </div>

      <div class="col-auto">
        <q-btn
          color="positive"
          icon="task_alt"
          label="Assignar pendents"
          @click="assignLottery"
          :disable="!selectedLotteryName"
          unelevated
        />
      </div>
    </div>

    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant sortejos: {{ error.message }}
        <q-btn flat color="white" label="Reintentar" @click="refetch()" />
      </q-banner>
    </div>
    <div v-else-if="data.value?.length === 0">No s'han trobat sortejos.</div>
    <SpTable
      v-else
      :rows="data || []"
      :columns="columns"
      row-key="id"
      class="q-mt-md table-header-bg"
      :loading="loading"
      v-model:pagination="pagination"
    >
    </SpTable>
    <div v-if="Array.isArray(data) && data.length" class="q-mt-md totals-summary">
      <div>Pap. masc.: {{ totals.ticketsMale }}</div>
      <div>Pap. fem.: {{ totals.ticketsFemale }}</div>
      <div>Pap. inf.: {{ totals.ticketsChildish }}</div>
      <div>Dèc. masc: {{ totals.tenthsMale }}</div>
      <div>Dèc fem.: {{ totals.tenthsFemale }}</div>
      <div>Dèc inf: {{ totals.tenthsChildish }}</div>
      <div>Total preu: {{ totals.price }} €</div>
      <div>Total benefici: {{ totals.benefit }} €</div>
      <div>Total: {{ totals.total }} €</div>
    </div>

    <q-separator spaced class="q-my-lg" />

    <div class="q-mt-lg q-pa-md">
      <q-form @submit.prevent="submitForm" class="q-mt-lg q-pa-md">
        <div class="row q-col-gutter-md items-end justify-between">
          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.lotteryId"
              label="ID Sorteig"
              type="number"
              outlined
              dense
              required
            />
          </div>

          <div class="col-12 col-sm-3">
            <SpSelect
              v-model="newLottery.memberFk"
              :options="members"
              :option-label="(member) => `${member.name} ${member.surname}`"
              option-value="id"
              label="Faller"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.ticketsMale"
              label="Pap. masc."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.ticketsFemale"
              label="Pap. fem."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.ticketsChildish"
              label="Pap. inf."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.tenthsMale"
              label="Déc. masc."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.tenthsFemale"
              label="Déc. fem."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>

          <div class="col-12 col-sm-1">
            <q-input
              v-model.number="newLottery.tenthsChildish"
              label="Déc. inf."
              type="number"
              outlined
              dense
              @focus="(e) => e.target.select()"
            />
          </div>
          <div class="col-auto">
            <q-btn type="submit" label="Afegir sorteig" color="primary" unelevated />
          </div>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { api } from 'src/boot/axios'
import SpTable from 'src/components/SpTable.vue'
import { useFetch } from 'src/composables/useFetch'
import { useQuasar } from 'quasar'
import SpSelect from 'src/components/SpSelect.vue'

const $q = useQuasar()

const { data, loading, error, refetch } = useFetch('/lotteries', {
  params: {
    filter: {
      order: ['id DESC'],
    },
  },
})

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
})

const lotteryNames = ref([])
const selectedLotteryName = ref(null)

const fetchLotteryNames = async () => {
  try {
    const response = await api.get('/lottery-names', {
      params: { filter: { order: ['id DESC'] } },
    })
    lotteryNames.value = response.data

    if (response.data.length > 0) {
      selectedLotteryName.value = response.data[0].id

      await refetch({
        params: {
          filter: {
            where: { lotteryNameFk: selectedLotteryName.value },
            include: [{ relation: 'member' }],
            order: ['lotteryId DESC'],
          },
        },
      })
    }
  } catch (error) {
    console.error('Error loading lottery names:', error)
  }
}

const newLottery = ref({
  lotteryId: null,
  memberFk: null,
  ticketsMale: 0,
  ticketsFemale: 0,
  ticketsChildish: 0,
  tenthsMale: 0,
  tenthsFemale: 0,
  tenthsChildish: 0,
})

const members = ref([])

const fetchMembers = async () => {
  try {
    const response = await api.get('/members', {
      params: {
        filter: {
          order: ['surname ASC'],
        },
      },
    })
    members.value = response.data
  } catch (error) {
    console.error('Error loading members:', error)
  }
}

const submitForm = async () => {
  try {
    const payload = {
      ...newLottery.value,
      lotteryNameFk: selectedLotteryName.value,
    }

    await api.post('/lotteries', payload)
    $q.notify({ type: 'positive', message: 'Sorteig afegit correctament!' })

    await refetch({
      params: {
        filter: {
          where: { lotteryNameFk: selectedLotteryName.value },
          include: [{ relation: 'member' }],
          order: ['lotteryId DESC'],
        },
      },
    })

    Object.keys(newLottery.value).forEach(
      (k) => (newLottery.value[k] = k === 'memberFk' ? null : 0),
    )
  } catch (error) {
    console.error('Error al crear sorteig:', error)
    $q.notify({ type: 'negative', message: 'Error al afegir sorteig' })
  }
}

watch(selectedLotteryName, async (newVal) => {
  if (!newVal) return
  await refetch({
    params: {
      filter: {
        where: { lotteryNameFk: newVal },
        include: [{ relation: 'member' }],
        order: ['lotteryId DESC'],
      },
    },
  })
})

const newLotteryName = ref('')

const createLotteryName = async () => {
  if (!newLotteryName.value.trim()) {
    $q.notify({ type: 'warning', message: 'El nom del sorteig no pot estar buit' })
    return
  }

  try {
    const response = await api.post('/lottery-names', {
      description: newLotteryName.value,
    })
    $q.notify({ type: 'positive', message: 'Sorteig creat correctament!' })
    newLotteryName.value = ''

    await fetchLotteryNames()
    selectedLotteryName.value = response.data.id
  } catch {
    $q.notify({ type: 'negative', message: 'Error creant nou sorteig' })
  }
}

const assignLottery = async () => {
  if (!selectedLotteryName.value) return

  $q.dialog({
    title: 'Confirmar assignació',
    message: 'Vols assignar tots els registres pendents d’aquest sorteig?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.post(`/lottery-names/${selectedLotteryName.value}/assign`)
      $q.notify({ type: 'positive', message: 'Loteria assignada correctament!' })

      await refetch({
        params: {
          filter: {
            where: { lotteryNameFk: selectedLotteryName.value },
            include: [{ relation: 'member' }],
            order: ['lotteryId DESC'],
          },
        },
      })
    } catch {
      $q.notify({ type: 'negative', message: 'Error durant l’assignació.' })
    }
  })
}

onMounted(async () => {
  await Promise.all([fetchLotteryNames(), fetchMembers()])
})

const columns = [
  {
    name: 'lotteryId',
    label: 'ID Sorteig',
    align: 'right',
    field: 'lotteryId',
  },
  {
    name: 'member',
    label: 'Faller',
    align: 'left',
    field: (row) =>
      row.member ? `${row.member.name || ''} ${row.member.surname || ''}`.trim() : '',
  },
  {
    name: 'ticketsMale',
    label: 'Pap. masc.',
    align: 'right',
    field: 'ticketsMale',
  },
  {
    name: 'ticketsFemale',
    label: 'Pap. fem.',
    align: 'right',
    field: 'ticketsFemale',
  },
  {
    name: 'ticketsChildish',
    label: 'Pap. inf.',
    align: 'right',
    field: 'ticketsChildish',
  },
  {
    name: 'tenthsMale',
    label: 'Dèc. masc.',
    align: 'right',
    field: 'tenthsMale',
  },
  {
    name: 'tenthsFemale',
    label: 'Dèc. fem.',
    align: 'right',
    field: 'tenthsFemale',
  },
  {
    name: 'tenthsChildish',
    label: 'Dèc. inf.',
    align: 'right',
    field: 'tenthsChildish',
  },
  {
    name: 'price',
    label: 'Preu',
    align: 'right',
    field: 'price',
    format: (val) => (val != null ? `${val} €` : ''),
  },
  {
    name: 'benefit',
    label: 'Benefici',
    align: 'right',
    field: 'benefit',
    format: (val) => (val != null ? `${val} €` : ''),
  },
  {
    name: 'total',
    label: 'Total',
    align: 'right',
    field: (row) => (row.price || 0) + (row.benefit || 0),
    format: (val) => `${val} €`,
  },
  {
    name: 'assigned',
    label: 'Assignació',
    align: 'right',
    field: 'assigned',
    format: (val) => (val ? new Date(val).toLocaleDateString() : ''),
    sortable: true,
  },
  {
    name: 'warning',
    label: '',
    align: 'right',
    field: (row) => (row.isAssigned ? '' : '⚠️'),
  },
]

const totals = computed(() => {
  return (data.value || []).reduce(
    (acc, row) => {
      acc.ticketsMale += row.ticketsMale || 0
      acc.ticketsFemale += row.ticketsFemale || 0
      acc.ticketsChildish += row.ticketsChildish || 0
      acc.tenthsMale += row.tenthsMale || 0
      acc.tenthsFemale += row.tenthsFemale || 0
      acc.tenthsChildish += row.tenthsChildish || 0
      acc.price += row.price || 0
      acc.benefit += row.benefit || 0
      acc.total += (row.price || 0) + (row.benefit || 0)
      return acc
    },
    {
      ticketsMale: 0,
      ticketsFemale: 0,
      ticketsChildish: 0,
      tenthsMale: 0,
      tenthsFemale: 0,
      tenthsChildish: 0,
      price: 0,
      benefit: 0,
      total: 0,
    },
  )
})
</script>

<style scoped>
.totals-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-weight: bold;
  padding: 0 2rem;
}
</style>
