<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant categories: {{ error.message }}
        <q-btn flat color="white" label="Reintentar" @click="refetch" />
      </q-banner>
    </div>
    <div v-else-if="data.length === 0">No s'han trobat categories.</div>
    <SpTable v-else :rows="data" :columns="columns" row-key="id" class="q-mt-md">
      <template v-slot:body-cell-fee="props">
        <q-td :props="props"> {{ props.row.fee }} € </q-td>
      </template>
    </SpTable>
  </q-page>
</template>

<script setup>
import { useFetch } from 'src/composables/useFetch'
import SpTable from 'components/SpTable.vue'

const columns = [
  { name: 'name', label: 'Categoria', align: 'left', field: 'name' },
  { name: 'description', label: 'Descripció', align: 'left', field: 'description' },
  { name: 'fee', label: 'Quota assignada (€)', align: 'right', field: 'fee' },
]

const { data, loading, error, refetch } = useFetch('/categories')
</script>
