<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant clients: {{ error.message }}
        <q-btn flat color="white" label="Reintentar" @click="refetch" />
      </q-banner>
    </div>
    <div v-else-if="data.length === 0">No s'han trobat clients.</div>
    <SpTable v-else :rows="data" :columns="columns" row-key="id" class="q-mt-md table-header-bg">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat dense @click="editClient(props.row)" />
        </q-td>
      </template>
    </SpTable>
    <div class="row items-center justify-end q-mt-md">
      <q-btn
        label="Nou client"
        color="primary"
        icon="add"
        @click="
          () => {
            selectedClient = null
            showDialog = true
          }
        "
      />
    </div>
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ selectedClient ? 'Editar client' : 'Afegir nou client' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <ClientForm
            :clientToEdit="selectedClient"
            @success="onClientCreated"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import SpTable from 'src/components/SpTable.vue'
import ClientForm from 'src/components/Client/ClientForm.vue'
import { ref } from 'vue'
import { useFetch } from 'src/composables/useFetch'

const showDialog = ref(false)
const selectedClient = ref(null)

const { data, loading, error, refetch } = useFetch('/clients')

const editClient = (client) => {
  selectedClient.value = client
  showDialog.value = true
}

const onClientCreated = async () => {
  showDialog.value = false
  selectedClient.value = null
  await refetch()
}

const columns = [
  {
    name: 'name',
    label: 'Nom',
    align: 'left',
    field: 'name',
  },
  {
    name: 'nif',
    label: 'NIF',
    align: 'left',
    field: 'nif',
  },
  {
    name: 'address',
    label: 'Adreça',
    align: 'left',
    field: 'address',
  },
  {
    name: 'phoneNumber',
    label: 'Telèfon',
    align: 'left',
    field: 'phoneNumber',
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
  },
  {
    name: 'description',
    label: 'Descripció',
    align: 'left',
    field: 'description',
  },
  {
    name: 'actions',
    label: '',
    align: 'right',
    field: 'id',
    sortable: false,
  },
]
</script>
