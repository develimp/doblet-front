<template>
  <q-page padding>
    <div v-if="sales.length === 0">No s'han trobat vendes.</div>
    <SpTable :rows="sales" :columns="columns" row-key="id" class="q-mt-md table-header-bg">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat dense @click="editSale(props.row)" />
        </q-td>
      </template>
    </SpTable>
    <div class="row items-center justify-end q-mt-md">
      <q-btn
        label="Nova venda"
        color="primary"
        icon="add"
        @click="
          () => {
            selectedSale = null
            showDialog = true
          }
        "
      />
    </div>
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ selectedSale ? 'Editar venda' : 'Afegir nova venda' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <SaleForm
            :saleToEdit="selectedSale"
            @success="onSaleCreated"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import SaleForm from 'src/components/Sale/SaleForm.vue'
import SpTable from 'src/components/SpTable.vue'
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const sales = ref([])
const showDialog = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}-${month}-${year}`
}

const selectedSale = ref(null)

const editSale = (sale) => {
  selectedSale.value = sale
  showDialog.value = true
}

const columns = [
  {
    name: 'budgetItem',
    label: 'Partida',
    align: 'left',
    field: (row) => row.subItem?.budgetItem?.name,
  },
  {
    name: 'subItemName',
    label: 'Subpartida',
    align: 'left',
    field: (row) => row.subItem.name,
  },
  {
    name: 'clientName',
    label: 'Client',
    align: 'left',
    field: (row) => row.client.name,
  },
  {
    name: 'amount',
    label: 'Quantitat',
    align: 'right',
    field: 'amount',
    format: (val) => (val != null ? `${val} €` : ''),
  },
  { name: 'payMethod', label: 'Mètode de pagament', align: 'left', field: 'payMethod' },
  { name: 'sold', label: 'Data de venda', align: 'left', field: 'sold', format: formatDate },
  {
    name: 'digitizedDocument',
    label: 'Document digitalitzat',
    align: 'left',
    field: 'digitizedDocument',
  },
  {
    name: 'created',
    label: 'Data de creació',
    align: 'left',
    field: 'created',
    format: formatDate,
  },
  {
    name: 'description',
    label: 'Descripció',
    align: 'left',
    field: 'description',
  },
  {
    name: 'ticketReference',
    label: 'Referència del tiquet',
    align: 'left',
    field: 'ticketReference',
  },
  {
    name: 'actions',
    label: '',
    align: 'right',
    field: 'id',
    sortable: false,
  },
]

const fetchsales = async () => {
  try {
    const response = await api.get('https://api.santspatrons.com/sales')
    sales.value = response.data
  } catch (error) {
    console.error('Error loading sales:', error)
  }
}

const onSaleCreated = async () => {
  showDialog.value = false
  selectedSale.value = null
  await fetchsales()
}

onMounted(async () => {
  await Promise.all([fetchsales()])
})
</script>
