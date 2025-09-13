<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <q-select
      v-model="selectedItem"
      :options="budgetItems"
      label="Partida pressupostària *"
      option-label="name"
      option-value="id"
      emit-value
      map-options
      outlined
      lazy-rules
      :rules="[
        (val) => (val !== null && val !== '') || 'La partida pressupostada es un camp obligatori',
      ]"
      @update:model-value="onBudgetItemSelected"
    />
    <q-select
      v-model.number="selectedSubItem"
      :options="subItems"
      label="Subpartida *"
      option-label="name"
      option-value="id"
      emit-value
      map-options
      outlined
      lazy-rules
      :rules="[(val) => (val !== null && val !== '') || 'La subpartida es un camp obligatori']"
    />
    <q-select
      v-model.number="selectedSupplier"
      :options="suppliers"
      label="Proveïdor *"
      option-label="name"
      option-value="id"
      emit-value
      map-options
      outlined
      lazy-rules
      :rules="[(val) => (val !== null && val !== '') || 'El proveïdor es un camp obligatori']"
    />
    <q-input
      outlined
      v-model.number="amount"
      label="Quantitat *"
      type="number"
      lazy-rules
      :rules="[(val) => (val !== null && val !== '') || 'La quantitat es un camp obligatori']"
    />
    <q-select
      v-model="selectedPayMethod"
      :options="payMethods"
      label="Mètode de pagament *"
      outlined
    />
    <q-input v-model="ticketReference" label="Número de factura o tiquet" outlined />
    <q-input
      outlined
      v-model="selectedBuyed"
      label="Data de pagament"
      class="cursor-pointer"
      readonly
      @click="popupBuyedRef?.value?.show?.()"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" @click="popupBuyedRef?.value?.show?.()" />
      </template>
      <q-popup-proxy ref="popupBuyedRef" transition-show="scale" transition-hide="scale">
        <q-date
          v-model="selectedBuyed"
          @update:model-value="popupBuyedRef.hide()"
          color="primary"
        />
      </q-popup-proxy>
    </q-input>
    <q-input v-model="digitizedDocument" label="Nom de l'arxiu associat" outlined />
    <q-input
      outlined
      v-model="selectedCreated"
      label="Data de facturació"
      class="cursor-pointer"
      readonly
      @click="popupCreatedRef?.value?.show?.()"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" @click="popupCreatedRef?.value?.show?.()" />
      </template>
      <q-popup-proxy ref="popupCreatedRef" transition-show="scale" transition-hide="scale">
        <q-date
          v-model="selectedCreated"
          @update:model-value="popupCreatedRef.hide()"
          color="primary"
        />
      </q-popup-proxy>
    </q-input>
    <q-input v-model="description" label="Descripció" outlined />
    <div>
      <q-btn :label="buyToEdit ? 'Actualitzar' : 'Guardar'" type="submit" color="primary" />
      <q-btn label="Restaurar" type="reset" color="primary" flat class="q-ml-sm" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const { buyToEdit } = defineProps({
  buyToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success'])

const budgetItems = ref([])
const subItems = ref([])
const suppliers = ref([])
const payMethods = ['efectiu', 'banc']
const popupBuyedRef = ref(null)
const popupCreatedRef = ref(null)

const selectedItem = ref(null)
const selectedSubItem = ref(null)
const selectedSupplier = ref(null)
const amount = ref('')
const selectedPayMethod = ref(null)
const ticketReference = ref(null)
const selectedBuyed = ref('')
const digitizedDocument = ref(null)
const selectedCreated = ref('')
const description = ref(null)

const onSubmit = async () => {
  try {
    const payload = {}

    if (selectedSubItem.value != null) payload.subItemFk = selectedSubItem.value
    if (selectedSupplier.value != null) payload.supplierFk = selectedSupplier.value
    if (amount.value != null) payload.amount = amount.value
    if (selectedPayMethod.value != null) payload.payMethod = selectedPayMethod.value
    if (ticketReference.value != null) payload.ticketReference = ticketReference.value
    if (selectedBuyed.value) payload.buyed = toIsoMidnightUTC(selectedBuyed.value)
    if (digitizedDocument.value != null) payload.digitizedDocument = digitizedDocument.value
    if (selectedCreated.value) payload.created = toIsoMidnightUTC(selectedCreated.value)
    if (description.value != null) payload.description = description.value

    if (buyToEdit?.id) {
      await api.patch(`/buys/${buyToEdit.id}`, payload)
    } else {
      await api.post('/buys', payload)
    }

    onReset()
    emit('success')
  } catch (error) {
    console.error('Error al guardar la compra:', error)
  }
}

const onReset = () => {
  selectedItem.value = null
  selectedSubItem.value = null
  selectedSupplier.value = null
  amount.value = ''
  selectedPayMethod.value = null
  ticketReference.value = null
  selectedBuyed.value = ''
  digitizedDocument.value = null
  selectedCreated.value = ''
  description.value = null
}

const fetchBudgetItems = async () => {
  try {
    const response = await api.get('/budget-items')
    budgetItems.value = response.data
  } catch (error) {
    console.error('Error loading budgetItems:', error)
  }
}

const onBudgetItemSelected = async (id) => {
  selectedSubItem.value = null
  try {
    const response = await api.get(`/budget-items/${id}/sub-items`)
    subItems.value = response.data
  } catch (error) {
    console.error('Error loading subItems for budgetItem', id, error)
  }
}

const fetchSuppliers = async () => {
  try {
    const response = await api.get('/suppliers', {
      params: {
        filter: {
          order: ['name ASC'],
        },
      },
    })
    suppliers.value = response.data
  } catch (error) {
    console.error('Error loading suppliers:', error)
  }
}

function toIsoMidnightUTC(ymd) {
  if (ymd == '') return null
  const [y, m, d] = ymd.split(/[-/]/).map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toISOString()
}

function formatIsoToDate(isoStr) {
  if (!isoStr) return ''
  return isoStr.split('T')[0]
}

onMounted(async () => {
  await Promise.all([fetchBudgetItems(), fetchSuppliers()])

  if (buyToEdit) {
    selectedItem.value = buyToEdit.subItem?.budgetItemFk ?? null
    if (selectedItem.value) {
      await onBudgetItemSelected(selectedItem.value)
      selectedSubItem.value = buyToEdit.subItemFk
    }
    selectedSupplier.value = buyToEdit.supplierFk
    amount.value = buyToEdit.amount
    selectedPayMethod.value = buyToEdit.payMethod
    ticketReference.value = buyToEdit.ticketReference
    selectedBuyed.value = formatIsoToDate(buyToEdit.buyed)
    digitizedDocument.value = buyToEdit.digitizedDocument
    selectedCreated.value = formatIsoToDate(buyToEdit.created)
    description.value = buyToEdit.description
  }
})
</script>
