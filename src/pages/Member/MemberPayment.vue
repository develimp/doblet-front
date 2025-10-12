<template>
  <q-page padding>
    <div class="flex justify-center q-mb-md">
      <q-select
        v-model="selectedMember"
        :options="filteredMembers"
        :option-label="(opt) => `${opt.name} ${opt.surname}`"
        option-value="id"
        label="Membre"
        emit-value
        map-options
        outlined
        use-input
        input-debounce="300"
        clearable
        prepend-inner-icon="search"
        style="max-width: 300px; width: 100%"
        @filter="filterFn"
        @update:model-value="fetchBalance"
      />
    </div>

    <div class="q-pa-md">
      <q-card flat bordered>
        <q-card-section class="text-orange text-bold"> Moviments </q-card-section>

        <q-separator />

        <div class="q-pa-md">
          <div class="row q-col-gutter-sm text-bold">
            <div class="col"></div>
            <div class="col text-center">Assignat</div>
            <div class="col text-center">Pagat</div>
            <div class="col text-center">Diferència</div>
            <div class="col text-center">Nou pagament</div>
          </div>

          <div
            v-for="row in rows"
            :key="row.label"
            class="row q-col-gutter-sm items-center q-mt-sm"
          >
            <div class="col">{{ row.label }}</div>
            <div class="col text-center">
              <q-input
                :model-value="formatCurrency(row.assigned)"
                dense
                outlined
                readonly
                tabindex="-1"
              />
            </div>
            <div class="col text-center">
              <q-input
                :model-value="formatCurrency(row.payed)"
                dense
                outlined
                readonly
                tabindex="-1"
              />
            </div>
            <div class="col text-center">
              <q-input
                :model-value="formatCurrency(row.diff)"
                dense
                outlined
                readonly
                tabindex="-1"
              />
            </div>
            <div class="col text-center">
              <!-- mostramos row.newPaymentDisplay y controlamos actualizaciones -->
              <q-input
                v-if="row.label !== 'Totals'"
                :model-value="row.newPaymentDisplay"
                @update:model-value="(val) => updateNewPayment(row, val)"
                @blur="() => formatTwoDecimals(row)"
                @focus="(e) => e.target.select()"
                type="text"
                inputmode="decimal"
                dense
                outlined
                suffix="€"
              />
              <q-input
                v-else
                :model-value="formatCurrency(totalNewPayments)"
                dense
                outlined
                readonly
                tabindex="-1"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="flex items-center justify-center q-mt-lg q-gutter-md">
      <q-option-group
        v-model="paymentMethod"
        :options="[
          { label: 'Efectiu', value: 'cash' },
          { label: 'Banc', value: 'bank' },
        ]"
        type="radio"
        inline
      />
      <q-btn
        label="PAGAR"
        color="primary"
        unelevated
        @click="submitPayments"
        :disable="!selectedMember"
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const members = ref([])
const filteredMembers = ref([])
const selectedMember = ref(null)
const paymentMethod = ref('cash')

const rows = ref([
  { label: 'Quota', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Loteria', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Rifa', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Totals', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
])

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
    filteredMembers.value = response.data
  } catch (error) {
    console.error('Error loading suppliers:', error)
  }
}

const updateNewPayment = (row, val) => {
  if (val == null || val === '') {
    row.newPayment = 0
    row.newPaymentDisplay = ''
    return
  }

  if (typeof val === 'number') {
    row.newPayment = isNaN(val) ? 0 : val
    row.newPaymentDisplay = String(val)
    return
  }

  let s = String(val).replace(',', '.')
  s = s.replace(/[^0-9.-]/g, '')

  const parts = s.split('.')
  if (parts.length > 1) s = parts.shift() + '.' + parts.join('')

  const num = parseFloat(s)
  row.newPayment = isNaN(num) ? 0 : num
  row.newPaymentDisplay = s
}

const formatTwoDecimals = (row) => {
  if (row.newPayment == null || isNaN(row.newPayment)) {
    row.newPayment = 0
  }
  row.newPaymentDisplay = Number(row.newPayment).toFixed(2)
  row.newPayment = parseFloat(row.newPaymentDisplay)
}

const formatCurrency = (val) => {
  if (val == null || isNaN(val)) return '0.00 €'
  return `${Number(val).toFixed(2)} €`
}

const totalNewPayments = computed(() => {
  return (
    (rows.value[0].newPayment || 0) +
    (rows.value[1].newPayment || 0) +
    (rows.value[2].newPayment || 0)
  )
})

const fetchBalance = async (memberId) => {
  if (!memberId) return
  try {
    const response = await api.get(`/balances/${memberId}`)
    const b = response.data
    rows.value = [
      {
        label: 'Quota',
        assigned: b.feeAssigned,
        payed: b.feePayed,
        diff: b.feeAssigned - b.feePayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Loteria',
        assigned: b.lotteryAssigned,
        payed: b.lotteryPayed,
        diff: b.lotteryAssigned - b.lotteryPayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Rifa',
        assigned: b.raffleAssigned,
        payed: b.rafflePayed,
        diff: b.raffleAssigned - b.rafflePayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Totals',
        assigned: b.feeAssigned + b.lotteryAssigned + b.raffleAssigned,
        payed: b.feePayed + b.lotteryPayed + b.rafflePayed,
        diff:
          b.feeAssigned +
          b.lotteryAssigned +
          b.raffleAssigned -
          (b.feePayed + b.lotteryPayed + b.rafflePayed),
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
    ]
  } catch (error) {
    console.error('Error loading balance:', error)
  }
}

const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      filteredMembers.value = members.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredMembers.value = members.value.filter((m) => m.surname.toLowerCase().includes(needle))
  })
}

const conceptMap = {
  Quota: 1,
  Loteria: 2,
  Rifa: 3,
}

const submitPayments = async () => {
  if (!selectedMember.value) {
    Notify.create({ type: 'warning', message: 'Selecciona un membre primer' })
    return
  }

  const memberId = selectedMember.value
  const promises = []

  for (const row of rows.value) {
    if (row.label === 'Totals') continue
    if (row.newPayment && row.newPayment !== 0) {
      promises.push(
        api.post(`/members/${memberId}/movements`, {
          amount: row.newPayment,
          idType: 2,
          idConcept: conceptMap[row.label],
          description: paymentMethod.value === 'cash' ? 'pagat en caixa' : 'pagat pel banc',
        }),
      )
    }
  }

  try {
    if (promises.length === 0) {
      Notify.create({ type: 'info', message: 'No hi ha pagaments per guardar' })
      return
    }

    await Promise.all(promises)
    Notify.create({ type: 'positive', message: 'Pagaments guardats correctament' })

    try {
      const paymentData = {
        pay_fee: rows.value[0].newPayment,
        pay_lottery: rows.value[1].newPayment,
        pay_raffle: rows.value[2].newPayment,
      }

      const pdfResponse = await api.post(`/movements/receipt/${memberId}`, paymentData, {
        responseType: 'blob',
      })

      const fileURL = URL.createObjectURL(pdfResponse.data)
      window.open(fileURL, '_blank')
    } catch (pdfError) {
      console.error('Error obrint el rebut PDF:', pdfError)
      Notify.create({ type: 'warning', message: 'No s’ha pogut generar el rebut PDF' })
    }

    await fetchBalance(memberId)

    rows.value.forEach((row) => {
      if (row.label !== 'Totals') {
        row.newPayment = 0
        row.newPaymentDisplay = '0.00'
      }
    })
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Error guardant els pagaments' })
  }
}

onMounted(async () => {
  await Promise.all([fetchMembers()])
})
</script>
