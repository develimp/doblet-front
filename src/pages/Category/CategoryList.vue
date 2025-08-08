<template>
  <q-page padding>
    <div v-if="categories.length === 0">No s'han trobat categories.</div>
    <SpTable :rows="categories" :columns="columns" row-key="id" class="q-mt-md">
      <template v-slot:body-cell-fee="props">
        <q-td :props="props"> {{ props.row.fee }} € </q-td>
      </template>
    </SpTable>
  </q-page>
</template>

<script setup>
import { api } from 'boot/axios'
import { ref, onMounted } from 'vue'
import SpTable from 'components/SpTable.vue'

const categories = ref([])
const columns = [
  { name: 'name', label: 'Categoria', align: 'left', field: 'name' },
  { name: 'description', label: 'Descripció', align: 'left', field: 'description' },
  { name: 'fee', label: 'Quota assignada (€)', align: 'right', field: 'fee' },
]

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchCategories()])
})
</script>
