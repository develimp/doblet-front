<template>
  <q-page padding>
    <div v-if="buys.length === 0">No s'han trobat compres.</div>
    <SpTable :rows="buys" :columns="columns" row-key="id" class="q-mt-md table-header-bg">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat dense @click="editBuy(props.row)" />
        </q-td>
      </template>
    </SpTable>
    <div class="row items-center justify-end q-mt-md">
      <q-btn
        label="Exportar PDF"
        color="secondary"
        icon="picture_as_pdf"
        class="q-mr-sm"
        @click="downloadPDF"
      />
      <q-btn
        label="Nova compra"
        color="primary"
        icon="add"
        @click="
          () => {
            selectedBuy = null
            showDialog = true
          }
        "
      />
    </div>
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ selectedBuy ? 'Editar compra' : 'Afegir nova compra' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <BuyForm :buyToEdit="selectedBuy" @success="onBuyCreated" @cancel="showDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import BuyForm from 'src/components/Buy/BuyForm.vue'
import SpTable from 'src/components/SpTable.vue'
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const buys = ref([])
const showDialog = ref(false)

const downloadPDF = async () => {
  try {
    const response = await api.get('/buys/pdf', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

    window.open(url)
  } catch (error) {
    console.error('Error descargando PDF:', error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}-${month}-${year}`
}

const selectedBuy = ref(null)

const editBuy = (buy) => {
  selectedBuy.value = buy
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
    name: 'supplierName',
    label: 'Proveïdor',
    align: 'left',
    field: (row) => row.supplier.name,
  },
  {
    name: 'amount',
    label: 'Quantitat',
    align: 'right',
    field: 'amount',
    format: (val) => (val != null ? `${val} €` : ''),
  },
  { name: 'payMethod', label: 'Mètode de pagament', align: 'left', field: 'payMethod' },
  { name: 'buyed', label: 'Data de compra', align: 'left', field: 'buyed', format: formatDate },
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

const fetchBuys = async () => {
  try {
    const response = await api.get('https://api.santspatrons.com/buys')
    buys.value = response.data
  } catch (error) {
    console.error('Error loading buys:', error)
  }
}

const onBuyCreated = async () => {
  showDialog.value = false
  selectedBuy.value = null
  await fetchBuys()
}

onMounted(async () => {
  await Promise.all([fetchBuys()])
})
</script>
