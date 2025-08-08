<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <q-input
      outlined
      v-model="name"
      label="Nom *"
      lazy-rules
      :rules="[(val) => (val !== null && val !== '') || 'El nom es un camp obligatori']"
    />
    <q-input v-model="nif" label="NIF" outlined />
    <q-input v-model="address" label="Adreça" outlined />
    <q-input v-model="phoneNumber" label="Telèfon" outlined />
    <q-input v-model="email" label="Email" outlined />
    <q-input v-model="description" label="Descripció" outlined />
    <div>
      <q-btn :label="clientToEdit ? 'Actualitzar' : 'Guardar'" type="submit" color="primary" />
      <q-btn label="Restaurar" type="reset" color="primary" flat class="q-ml-sm" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const { clientToEdit } = defineProps({
  clientToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success'])

const name = ref(null)
const nif = ref(null)
const address = ref(null)
const phoneNumber = ref(null)
const email = ref(null)
const description = ref(null)

const onSubmit = async () => {
  try {
    const payload = {}

    if (name.value != null) payload.name = name.value
    if (nif.value != null) payload.nif = nif.value
    if (address.value != null) payload.address = address.value
    if (phoneNumber.value != null) payload.phoneNumber = phoneNumber.value
    if (email.value != null) payload.email = email.value
    if (description.value != null) payload.description = description.value

    if (clientToEdit?.id) {
      await api.patch(`/clients/${clientToEdit.id}`, payload)
    } else {
      await api.post('/clients', payload)
    }

    onReset()
    emit('success')
  } catch (error) {
    console.error('Error al guardar el client:', error)
  }
}

const onReset = () => {
  name.value = null
  nif.value = null
  address.value = null
  phoneNumber.value = null
  email.value = null
  description.value = null
}

onMounted(async () => {
  if (clientToEdit) {
    name.value = clientToEdit.name
    nif.value = clientToEdit.nif
    address.value = clientToEdit.address
    phoneNumber.value = clientToEdit.phoneNumber
    email.value = clientToEdit.email
    description.value = clientToEdit.description
  }
})
</script>
