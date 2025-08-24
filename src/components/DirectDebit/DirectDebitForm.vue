<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <q-select
      v-if="!directDebitToEdit"
      v-model="memberFk"
      :options="memberOptions"
      option-value="id"
      option-label="fullName"
      emit-value
      map-options
      label="Titular"
      outlined
    />
    <q-input v-model="accountNumber" label="Número de compte (IBAN)" outlined />
    <q-input v-model.number="actualAmount" label="Quantitat a domiciliar" outlined type="number" />
    <q-input v-model="notes" label="Notes" outlined />
    <div>
      <q-btn :label="directDebitToEdit ? 'Actualitzar' : 'Guardar'" type="submit" color="primary" />
      <q-btn label="Restaurar" type="reset" color="primary" flat class="q-ml-sm" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const { directDebitToEdit } = defineProps({
  directDebitToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success'])

const memberFk = ref(null)
const memberOptions = ref([])

const accountNumber = ref(null)
const actualAmount = ref(null)
const notes = ref(null)

const loadMembers = async () => {
  try {
    const res = await api.get('/members')
    memberOptions.value = res.data.map((m) => ({
      id: m.id,
      fullName: `${m.name} ${m.surname}`,
    }))
  } catch (err) {
    console.error('Error loading members:', err)
  }
}

const onSubmit = async () => {
  try {
    const payload = {}

    if (!directDebitToEdit) {
      if (memberFk.value != null) payload.memberFk = memberFk.value
    }

    if (accountNumber.value != null) payload.accountNumber = accountNumber.value
    if (actualAmount.value != null) payload.actualAmount = actualAmount.value
    if (notes.value != null) payload.notes = notes.value

    if (directDebitToEdit?.id) {
      await api.patch(`/direct-debits/${directDebitToEdit.id}`, payload)
    } else {
      await api.post('/direct-debits', payload)
    }

    onReset()
    emit('success')
  } catch (error) {
    console.error('Error al guardar la domiciliació:', error)
  }
}

const onReset = () => {
  memberFk.value = null
  accountNumber.value = null
  actualAmount.value = null
  notes.value = null
}

onMounted(() => {
  if (directDebitToEdit) {
    accountNumber.value = directDebitToEdit.accountNumber
    actualAmount.value = directDebitToEdit.actualAmount
    notes.value = directDebitToEdit.notes
  } else {
    loadMembers()
  }
})
</script>
