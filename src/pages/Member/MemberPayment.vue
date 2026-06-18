<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import SpTable from 'src/components/SpTable.vue'
import SpSelect from 'src/components/SpSelect.vue'
import { useFetch } from 'src/composables/useFetch'

const selectedMember = ref(null)
const selectedFamily = ref(null)
const paymentMethod = ref('cash')
const isAuthorizationSigned = ref(false)
const showAuthorizationCheckbox = ref(false)
const showFamilyAuthorizationWarning = ref(false)

const {
  data: members,
  loading: loadingMembers,
  error: errorMembers,
} = useFetch('/members', {
  params: {
    filter: {
      where: { isRegistered: 1 },
      order: ['surname ASC'],
    },
  },
})

const memberLabel = (member) => {
  if (!member) return ''
  return `${member.name} ${member.surname}`
}

const familyMembers = computed(() => {
  if (!selectedMember.value || !members.value?.length) return []

  const selected = members.value.find((m) => m.id === selectedMember.value)
  if (!selected?.familyFk) return []

  return members.value.filter(
    (m) => m.familyFk === selected.familyFk && m.id !== selectedMember.value,
  )
})

const getAge = (birthdate) => {
  const today = new Date()
  const birthDate = new Date(birthdate)

  let age = today.getFullYear() - birthDate.getFullYear()

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())

  if (!hasHadBirthdayThisYear) {
    age--
  }

  return age
}

const checkFamilyAuthorization = (memberId) => {
  showFamilyAuthorizationWarning.value = false

  if (!memberId || !members.value?.length) {
    return
  }

  const selected = members.value.find((m) => m.id === memberId)

  if (!selected?.familyFk) {
    return
  }

  const hasMinorWithoutAuthorization = members.value.some((member) => {
    return (
      member.familyFk === selected.familyFk &&
      getAge(member.birthdate) < 18 &&
      !member.isAuthorizationSigned
    )
  })

  showFamilyAuthorizationWarning.value = hasMinorWithoutAuthorization
}

const resetPageState = () => {
  selectedFamily.value = null
  paymentMethod.value = 'cash'
  familyPaymentMethod.value = 'cash'
  assignmentConcept.value = 1
  assignmentAmount.value = null
  assignmentDescription.value = ''
  currentMember.value = null
  pendingPaymentData = null
  movements.value = []
  familyMovements.value = []

  fetchBalance(null)
  fetchFamilyBalance(null)
  fetchFamilyMovements(null)
  fetchAuthorization(null)
  checkFamilyAuthorization(null)
}

const loadMemberRelatedData = (memberId) => {
  if (!memberId) {
    resetPageState()
    return
  }

  fetchBalance(memberId)
  fetchFamilyBalance(memberId)
  fetchFamilyMovements(memberId)
  fetchAuthorization(memberId)
  checkFamilyAuthorization(memberId)
}

const selectFamily = (val) => {
  if (!val || val === selectedMember.value) return

  selectedFamily.value = null
  selectedMember.value = val
}

const rows = ref([
  { label: 'Quota', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Loteria', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Rifa', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Totals', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
])

const hasAnyPayment = computed(() => {
  return rows.value.filter((r) => r.label !== 'Totals').some((r) => Number(r.newPayment) !== 0)
})

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
  if (!memberId) {
    rows.value = [
      {
        label: 'Quota',
        assigned: 0,
        payed: 0,
        diff: 0,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Loteria',
        assigned: 0,
        payed: 0,
        diff: 0,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Rifa',
        assigned: 0,
        payed: 0,
        diff: 0,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Totals',
        assigned: 0,
        payed: 0,
        diff: 0,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
    ]
    return
  }
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

const fetchAuthorization = async (memberId) => {
  if (!memberId) {
    isAuthorizationSigned.value = false
    showAuthorizationCheckbox.value = false
    return
  }

  try {
    const response = await api.get(`/members/${memberId}`)
    const member = response.data

    isAuthorizationSigned.value = !!member.isAuthorizationSigned

    const today = new Date()
    const birthdate = new Date(member.birthdate)

    let age = today.getFullYear() - birthdate.getFullYear()

    const hasHadBirthdayThisYear =
      today.getMonth() > birthdate.getMonth() ||
      (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate())
    
    if (!hasHadBirthdayThisYear) {
      age --
    }

    const isAdult = age >= 18

    showAuthorizationCheckbox.value = (!isAdult && !member.isAuthorizationSigned) || (isAdult && member.isAuthorizationSigned)
  } catch (err) {
    console.error('Error carregant autorització:', err)
    isAuthorizationSigned.value = false
    showAuthorizationCheckbox.value = false
  }
}

const updateAuthorization = async (value) => {
  if (!selectedMember.value) return

  try {
    await api.patch(`/members/${selectedMember.value}`, {
      isAuthorizationSigned: value,
    })

    const member = members.value.find(
      (m) => m.id === selectedMember.value
    )

    if (member) {
      member.isAuthorizationSigned = value
    }

    checkFamilyAuthorization(selectedMember.value)

    Notify.create({
      type: 'positive',
      message: 'Signatura d\'autorització actualitzada',
    })
  } catch (err) {
    console.error('Error actualitzant autorització:', err)
    isAuthorizationSigned.value = !value

    Notify.create({
      type: 'negative',
      message: 'Error actualitzant autorització',
    })
  }
}

const familyRows = ref([
  { label: 'Quota', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Loteria', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
  { label: 'Rifa', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
])

const totalFamilyNewPayments = computed(() => {
  return familyRows.value.reduce((sum, row) => sum + (row.newPayment || 0), 0)
})

const familyTotals = ref({ assigned: 0, payed: 0, diff: 0 })

const updateFamilyNewPayment = (row, val) => {
  if (!val) {
    row.newPayment = 0
    row.newPaymentDisplay = ''
    return
  }
  let s = String(val)
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '')
  const parts = s.split('.')
  if (parts.length > 1) s = parts.shift() + '.' + parts.join('')
  const num = parseFloat(s)
  row.newPayment = isNaN(num) ? 0 : num
  row.newPaymentDisplay = s
}

const fetchFamilyBalance = async (memberId) => {
  if (!memberId) {
    familyRows.value = [
      { label: 'Quota', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
      {
        label: 'Loteria',
        assigned: 0,
        payed: 0,
        diff: 0,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      { label: 'Rifa', assigned: 0, payed: 0, diff: 0, newPayment: 0, newPaymentDisplay: '0.00' },
    ]

    familyTotals.value = { assigned: 0, payed: 0, diff: 0 }
    return
  }

  try {
    const memberRes = await api.get(`/members/${memberId}`)
    const familyFk = memberRes.data.familyFk
    if (!familyFk) {
      familyRows.value = []
      return
    }

    const res = await api.get(`/balances/family/${familyFk}`)
    const data = res.data

    const rows = [
      {
        label: 'Quota',
        assigned: data.feeAssigned,
        payed: data.feePayed,
        diff: data.feeAssigned - data.feePayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Loteria',
        assigned: data.lotteryAssigned,
        payed: data.lotteryPayed,
        diff: data.lotteryAssigned - data.lotteryPayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
      {
        label: 'Rifa',
        assigned: data.raffleAssigned,
        payed: data.rafflePayed,
        diff: data.raffleAssigned - data.rafflePayed,
        newPayment: 0,
        newPaymentDisplay: '0.00',
      },
    ]

    familyRows.value = rows
    familyTotals.value = {
      assigned: rows.reduce((s, r) => s + r.assigned, 0),
      payed: rows.reduce((s, r) => s + r.payed, 0),
      diff: rows.reduce((s, r) => s + r.diff, 0),
    }
  } catch (err) {
    console.error('Error carregant balanç familiar:', err)
  }
}

const conceptMap = {
  Quota: 1,
  Loteria: 2,
  Rifa: 3,
}

const showEmailDialog = ref(false)
const memberEmail = ref('')
const sending = ref(false)
const currentMember = ref(null)
let pendingPaymentData = null

async function openEmailDialog(memberId, paymentData) {
  try {
    const res = await api.get(`/members/${memberId}`)
    currentMember.value = res.data
    memberEmail.value = res.data.email || ''
    pendingPaymentData = paymentData
    showEmailDialog.value = true
  } catch (err) {
    console.error('Error obtenint membre:', err)
    Notify.create({ type: 'negative', message: 'Error obtenint el membre' })
  }
}

async function confirmAndSend() {
  sending.value = true
  try {
    if (memberEmail.value !== currentMember.value.email) {
      await api.patch(`/members/${currentMember.value.id}`, { email: memberEmail.value })
    }

    await api.post(`/movements/send-receipt/${currentMember.value.id}`, pendingPaymentData)

    const pdfResponse = await api.post(
      `/movements/receipt/${currentMember.value.id}`,
      pendingPaymentData,
      { responseType: 'blob' },
    )

    const pdfUrl = URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }))
    window.open(pdfUrl, '_blank')

    Notify.create({ type: 'positive', message: 'Rebut enviat i obert correctament!' })
    showEmailDialog.value = false
  } catch (err) {
    if (err === false) {
      try {
        const pdfResponse = await api.post(
          `/movements/receipt/${currentMember.value.id}`,
          pendingPaymentData,
          { responseType: 'blob' },
        )
        const pdfUrl = URL.createObjectURL(
          new Blob([pdfResponse.data], { type: 'application/pdf' }),
        )
        window.open(pdfUrl, '_blank')
        Notify.create({ type: 'info', message: 'PDF obert sense enviar correu' })
      } catch (pdfErr) {
        console.error('Error generant el PDF sense enviar correu:', pdfErr)
        Notify.create({ type: 'negative', message: 'No s’ha pogut generar el PDF' })
      }
    } else {
      console.error('Error enviant el rebut:', err)
      Notify.create({ type: 'negative', message: 'No s’ha pogut enviar el rebut' })
    }
  } finally {
    sending.value = false
  }
}

function cancelAndShowPDF() {
  showEmailDialog.value = false

  if (!currentMember.value || !pendingPaymentData) return

  api
    .post(`/movements/receipt/${currentMember.value.id}`, pendingPaymentData, {
      responseType: 'blob',
    })
    .then((pdfResponse) => {
      const pdfUrl = URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }))
      window.open(pdfUrl, '_blank')
      Notify.create({ type: 'info', message: 'PDF obert sense enviar correu' })
    })
    .catch((err) => {
      console.error('Error generant el PDF sense enviar correu:', err)
      Notify.create({ type: 'negative', message: 'No s’ha pogut generar el PDF' })
    })
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

    if (paymentMethod.value === 'cash') {
      const paymentData = {
        pay_fee: rows.value[0].newPayment,
        pay_lottery: rows.value[1].newPayment,
        pay_raffle: rows.value[2].newPayment,
      }

      await openEmailDialog(memberId, paymentData)
    }

    await fetchBalance(memberId)
    await fetchFamilyBalance(memberId)
    await refetchMovements({
      url: `/movements/by-member/${memberId}/current`,
    })
    await fetchFamilyMovements(memberId)

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

const familyPaymentMethod = ref('cash')

const submitFamilyPayments = async () => {
  if (totalFamilyNewPayments.value <= 0) {
    Notify.create({ type: 'info', message: 'No hi ha pagaments familiars per guardar' })
    return
  }

  try {
    const memberRes = await api.get(`/members/${selectedMember.value}`)
    const familyFk = memberRes.data.familyFk

    if (!familyFk) {
      Notify.create({ type: 'warning', message: 'El membre no té família assignada' })
      return
    }

    const payments = familyRows.value.filter((r) => r.newPayment > 0)

    if (payments.length === 0) {
      Notify.create({ type: 'info', message: 'No hi ha pagaments familiars per guardar' })
      return
    }

    for (const row of payments) {
      await api.post('/family-payment', {
        familyFk,
        amount: parseFloat(row.newPayment),
        idConcept: conceptMap[row.label],
        payMethod: familyPaymentMethod.value,
      })
    }

    Notify.create({ type: 'positive', message: 'Pagaments familiars guardats correctament' })

    familyRows.value.forEach((r) => {
      r.newPayment = 0
      r.newPaymentDisplay = '0.00'
    })

    await fetchFamilyBalance(selectedMember.value)
    await fetchBalance(selectedMember.value)
    await refetchMovements({
      url: `/movements/by-member/${selectedMember.value}/current`,
    })
    await fetchFamilyMovements(selectedMember.value)
  } catch (err) {
    console.error('Error guardant els pagaments familiars:', err)
    Notify.create({ type: 'negative', message: 'Error guardant els pagaments familiars' })
  }
}

const assignmentConcept = ref(1)
const assignmentAmount = ref(null)
const assignmentDescription = ref('')

const submitAssignment = async () => {
  if (!selectedMember.value) {
    Notify.create({ type: 'warning', message: 'Selecciona un membre primer' })
    return
  }

  try {
    await api.post(`/members/${selectedMember.value}/movements`, {
      amount: assignmentAmount.value,
      idType: 1,
      idConcept: assignmentConcept.value,
      description: assignmentDescription.value,
    })

    Notify.create({ type: 'positive', message: 'Assignació guardada correctament' })

    await fetchBalance(selectedMember.value)
    await fetchFamilyBalance(selectedMember.value)
    await refetchMovements({
      url: `/movements/by-member/${selectedMember.value}/current`,
    })
    await fetchFamilyMovements(selectedMember.value)

    assignmentAmount.value = null
    assignmentDescription.value = ''
  } catch (err) {
    console.error('Error guardant assignació:', err)
    Notify.create({ type: 'negative', message: 'Error guardant assignació' })
  }
}

const {
  data: movements,
  loading,
  error,
  refetch: refetchMovements,
} = useFetch('', { immediate: false })

const familyMovements = ref([])
const loadingFamilyMovements = ref(false)

const fetchFamilyMovements = async (memberId) => {
  if (!memberId) {
    familyMovements.value = []
    return
  }

  loadingFamilyMovements.value = true
  try {
    const memberRes = await api.get(`/members/${memberId}`)
    const familyFk = memberRes.data.familyFk

    if (!familyFk) {
      familyMovements.value = []
      return
    }

    const resp = await api.get(`/movements/by-family/${familyFk}/current`)
    familyMovements.value = resp.data
  } catch (err) {
    console.error('Error carregant moviments familiars:', err)
    familyMovements.value = []
  } finally {
    loadingFamilyMovements.value = false
  }
}

const pagination = ref({
  page: 1,
  rowsPerPage: 6,
})

const typeLabels = {
  1: 'Assignació',
  2: 'Pagament',
}

const conceptLabels = {
  1: 'Quota',
  2: 'Loteria',
  3: 'Rifa',
}

const columns = [
  {
    name: 'idType',
    label: 'Tipo',
    field: (row) => typeLabels[row.idType] || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'idConcept',
    label: 'Concepte',
    field: (row) => conceptLabels[row.idConcept] || '-',
    align: 'left',
    sortable: true,
  },
  {
    name: 'transactionDate',
    label: 'Data',
    field: (row) => new Date(row.transactionDate).toLocaleDateString(),
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'Import (€)',
    field: 'amount',
    align: 'right',
    sortable: true,
    format: (val) => `${val.toFixed(2)} €`,
  },
  {
    name: 'description',
    label: 'Descripció',
    field: 'description',
    align: 'left',
    sortable: false,
  },
]

watch(errorMembers, (err) => {
  if (err) {
    Notify.create({
      type: 'negative',
      message: 'Error carregant membres',
      caption: err.message,
    })
  }
})

watch(selectedMember, (val) => {
  if (!val) {
    resetPageState()
    return
  }

  if (selectedFamily.value !== val) {
    selectedFamily.value = null
  }

  loadMemberRelatedData(val)
  refetchMovements({
    url: `/movements/by-member/${val}/current`,
  })
})

watch(error, (err) => {
  if (err) {
    Notify.create({
      type: 'negative',
      message: 'Error carregant moviments',
      caption: err.message,
    })
  }
})
</script>

<template>
  <q-page padding>
    <div class="row justify-center items-center q-gutter-md q-mb-md">
      <div class="col-auto">
        <SpSelect
          v-model="selectedMember"
          :options="members"
          :loading="loadingMembers"
          :option-label="memberLabel"
          option-value="id"
          label="Membre"
        />
      </div>

      <div class="col-auto">
        <SpSelect
          :model-value="selectedFamily"
          :options="familyMembers"
          :loading="loadingMembers"
          :option-label="memberLabel"
          option-value="id"
          label="Familiar"
          :disable="!selectedMember"
          @update:model-value="selectFamily"
        />
      </div>

      <div class="col-auto">
        <q-checkbox
          v-if="showAuthorizationCheckbox"
          v-model="isAuthorizationSigned"
          label="Autorització signada"
          @update:model-value="updateAuthorization"
        />
      </div>

      <div
        v-if="showFamilyAuthorizationWarning"
        class="col-auto text-negative text-weight-bold"
      >
        ⚠ Hi ha algun menor en la família sense l'autorització signada
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-6">
        <div class="q-pa-md">
          <q-card flat bordered>
            <q-card-section class="text-orange text-bold"> Pagar </q-card-section>

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
                <div class="col" :class="row.label === 'Totals' ? 'text-bold' : ''">
                  {{ row.label }}
                </div>
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
                    :disable="!selectedMember"
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
              <div class="flex items-center justify-center q-mt-lg q-gutter-md">
                <q-option-group
                  v-model="paymentMethod"
                  :options="[
                    { label: 'Efectiu', value: 'cash' },
                    { label: 'Banc', value: 'bank' },
                  ]"
                  type="radio"
                  inline
                  :disable="!selectedMember"
                />
                <q-btn
                  label="PAGAR"
                  color="primary"
                  unelevated
                  @click="submitPayments"
                  :disable="!selectedMember || !hasAnyPayment"
                />
              </div>
            </div>
          </q-card>
        </div>

        <div class="q-mt-lg q-pa-md">
          <q-card flat bordered>
            <q-card-section class="text-orange text-bold">Assignar</q-card-section>
            <q-separator />

            <div class="q-pa-md">
              <div class="row items-center q-gutter-md">
                <div class="col-auto">
                  <q-option-group
                    v-model="assignmentConcept"
                    :options="[
                      { label: 'Quota', value: 1 },
                      { label: 'Rifa', value: 3 },
                    ]"
                    type="radio"
                    inline
                    :disable="!selectedMember"
                  />
                </div>

                <div class="col-2">
                  <q-input
                    v-model.number="assignmentAmount"
                    label="Import"
                    suffix="€"
                    dense
                    outlined
                    min="0"
                    :disable="!selectedMember"
                  />
                </div>

                <div class="col-grow">
                  <q-input
                    v-model="assignmentDescription"
                    label="Descripció"
                    dense
                    outlined
                    :disable="!selectedMember"
                  />
                </div>

                <div class="col-auto">
                  <q-btn
                    label="Assignar"
                    color="primary"
                    unelevated
                    @click="submitAssignment"
                    :disable="!selectedMember || !assignmentAmount"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <div class="q-mt-lg q-pa-md">
          <q-card flat bordered>
            <q-card-section class="text-orange text-bold">Pagar per familia</q-card-section>
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
                v-for="row in [
                  ...familyRows,
                  {
                    label: 'Totals',
                    ...familyTotals,
                    newPaymentDisplay: formatCurrency(totalFamilyNewPayments),
                  },
                ]"
                :key="row.label"
                class="row q-col-gutter-sm items-center q-mt-sm"
              >
                <div class="col" :class="row.label === 'Totals' ? 'text-bold' : ''">
                  {{ row.label }}
                </div>
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
                <div class="col text-center" v-if="row.label !== 'Totals'">
                  <q-input
                    :model-value="row.newPaymentDisplay"
                    @update:model-value="(val) => updateFamilyNewPayment(row, val)"
                    @blur="() => formatTwoDecimals(row, 'family')"
                    @focus="(e) => e.target.select()"
                    type="text"
                    inputmode="decimal"
                    dense
                    outlined
                    suffix="€"
                    :disable="!selectedMember"
                  />
                </div>
                <div class="col text-center" v-else>
                  <q-input
                    :model-value="formatCurrency(totalFamilyNewPayments)"
                    dense
                    outlined
                    readonly
                    tabindex="-1"
                  />
                </div>
              </div>
              <div class="flex items-center justify-center q-mt-lg q-gutter-md">
                <q-option-group
                  v-model="familyPaymentMethod"
                  :options="[
                    { label: 'Efectiu', value: 'cash' },
                    { label: 'Banc', value: 'bank' },
                  ]"
                  type="radio"
                  inline
                  :disable="!selectedMember"
                />
                <q-btn
                  label="PAGAR FAMÍLIA"
                  color="primary"
                  unelevated
                  @click="submitFamilyPayments"
                  :disable="totalFamilyNewPayments <= 0"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <div class="col-6">
        <div class="q-pa-md">
          <q-card flat bordered>
            <q-card-section class="text-orange text-bold"> Moviments realitzats </q-card-section>
            <q-separator />

            <div v-if="loading" class="row justify-center q-my-md">
              <q-spinner-dots size="40px" color="primary" />
            </div>

            <div v-else-if="error">
              <q-banner class="bg-red text-white">
                Error carregant moviments: {{ error.message }}
                <q-btn
                  flat
                  color="white"
                  label="Reintentar"
                  @click="fetchMovements(selectedMember)"
                />
              </q-banner>
            </div>

            <div v-else-if="!movements || movements.length === 0" class="q-pa-md">
              No s'han trobat moviments per aquest membre.
            </div>

            <SpTable
              v-else
              :rows="movements"
              :columns="columns"
              row-key="id"
              class="q-mt-md table-header-bg"
              :loading="loading"
              v-model:pagination="pagination"
            />
          </q-card>
        </div>

        <div class="q-pa-md">
          <q-card flat bordered>
            <q-card-section class="text-orange text-bold"> Moviments família </q-card-section>
            <q-separator />

            <div v-if="loadingFamilyMovements" class="row justify-center q-my-md">
              <q-spinner-dots size="40px" color="primary" />
            </div>

            <div v-else-if="familyMovements.length === 0" class="q-pa-md">
              No s'han trobat moviments per la família.
            </div>

            <SpTable
              v-else
              :rows="familyMovements"
              :loading="loadingFamilyMovements"
              row-key="id"
              class="q-mt-md table-header-bg"
              v-model:pagination="pagination"
              :columns="columns"
            >
              <template v-slot:body-cell-date="props">
                <q-td>
                  {{ new Date(props.row.date).toLocaleDateString() }}
                </q-td>
              </template>

              <template v-slot:body-cell-type="props">
                <q-td>
                  {{ props.row.type === 1 ? 'Assignació' : 'Pagament' }}
                </q-td>
              </template>

              <template v-slot:body-cell-concept="props">
                <q-td>
                  {{
                    props.row.concept === 1 ? 'Quota' : props.row.concept === 3 ? 'Rifa' : 'Loteria'
                  }}
                </q-td>
              </template>

              <template v-slot:body-cell-amount="props">
                <q-td class="text-right"> {{ formatCurrency(props.row.amount) }} </q-td>
              </template>
            </SpTable>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="showEmailDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Confirmar correu</div>
          <div class="text-subtitle2 q-mt-sm">Introdueix o confirma el correu del membre:</div>
          <q-input
            v-model="memberEmail"
            label="Correu electrònic"
            type="email"
            dense
            autofocus
            :rules="[(val) => !!val || 'El correu és obligatori']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="cancelAndShowPDF" />
          <q-btn label="Acceptar" color="primary" :loading="sending" @click="confirmAndSend" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
