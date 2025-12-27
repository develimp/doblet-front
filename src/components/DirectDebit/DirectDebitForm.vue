<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <SpSelect
      v-if="!directDebitToEdit"
      v-model="selectedMember"
      :options="members"
      option-value="id"
      :option-label="(member) => `${member.name} ${member.surname}`"
      label="Titular"
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
import SpSelect from 'src/components/SpSelect.vue'

const { directDebitToEdit } = defineProps({
  directDebitToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success'])

const members = ref([])
const selectedMember = ref(null)
const accountNumber = ref(null)
const actualAmount = ref(null)
const notes = ref(null)

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

const onSubmit = async () => {
  try {
    const payload = {}

    if (!directDebitToEdit) {
      if (selectedMember.value != null) payload.selectedMember = selectedMember.value
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
  selectedMember.value = null
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
    fetchMembers()
  }
})
</script>
