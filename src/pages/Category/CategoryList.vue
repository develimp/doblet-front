<template>
  <q-page padding>
    <div v-if="categories.length === 0">No s'han trobat categories.</div>
    <SpTable
      :title="`Categories (${countCategory.count})`"
      :rows="categories"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="q-mt-md"
    >
      <template v-slot:body-cell-fee="props">
        <q-td :props="props"> {{ props.row.fee }} € </q-td>
      </template>
    </SpTable>
  </q-page>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import SpTable from 'components/SpTable.vue'

const countCategory = ref({})
const categories = ref([])
const columns = [
  { name: 'name', label: 'Categoria', align: 'left', field: 'name' },
  { name: 'description', label: 'Descripció', align: 'left', field: 'description' },
  { name: 'fee', label: 'Quota assignada (€)', align: 'right', field: 'fee' },
]

const fetchCount = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3000/categories/count')
    countCategory.value = response.data
  } catch (error) {
    console.error('Error fetching category count:', error)
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3000/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchCount(), fetchCategories()])
})
</script>
