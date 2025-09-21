<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant compres: {{ error.message }}
        <q-btn
          flat
          color="white"
          label="Reintentar"
          @click="refetch({ params: { filter: { order: ['buyed DESC'] } } })"
        />
      </q-banner>
    </div>
    <div v-else-if="data.length === 0">No s'han trobat compres.</div>
    <SpTable
      v-else
      :rows="data || []"
      :columns="columns"
      row-key="id"
      class="q-mt-md table-header-bg"
      :loading="loading"
      :rows-number="rowsNumber"
      v-model:pagination="pagination"
      @request="onRequest"
    >
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
import { ref, watch } from 'vue'
import BuyForm from 'src/components/Buy/BuyForm.vue'
import SpTable from 'src/components/SpTable.vue'
import { api } from 'boot/axios'
import { useFetch } from 'src/composables/useFetch'
import { useDateFormat } from 'src/composables/useDateFormat'
import { useCrudDialog } from 'src/composables/useCrudDialog'
import BuyFilters from 'src/components/Buy/BuyFilters.vue'
import { useRightDrawer } from 'src/composables/useRightDrawer'
import { h, onMounted, onUnmounted } from 'vue'

const { data, loading, error, refetch } = useFetch('/buys')

const { formatDate } = useDateFormat()

const { showDialog, selectedItem: selectedBuy, openDialog, closeDialog } = useCrudDialog()

const { setRightDrawer, clearRightDrawer } = useRightDrawer()

const filters = ref({
  supplierFk: null,
  payMethod: null,
  buyedFrom: null,
  buyedTo: null,
})

watch(
  filters,
  () => {
    pagination.value.page = 1
    onRequest({ pagination: pagination.value })
  },
  { deep: true },
)

onMounted(() => {
  setRightDrawer(() =>
    h(BuyFilters, {
      supplier: filters.value.supplierFk,
      'onUpdate:supplier': (val) => (filters.value.supplierFk = val),

      payMethod: filters.value.payMethod,
      'onUpdate:payMethod': (val) => (filters.value.payMethod = val),

      buyedFrom: filters.value.buyedFrom,
      'onUpdate:buyedFrom': (val) => (filters.value.buyedFrom = val),

      buyedTo: filters.value.buyedTo,
      'onUpdate:buyedTo': (val) => (filters.value.buyedTo = val),
    }),
  )
})

onUnmounted(() => {
  clearRightDrawer()
})

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

const editBuy = (buy) => {
  openDialog(buy)
}

const onBuyCreated = async () => {
  closeDialog()
  await refetch()
}

const pagination = ref({
  sortBy: 'buyed',
  descending: true,
  page: 1,
  rowsPerPage: 15,
})

const rowsNumber = ref(0)

const onRequest = async ({ pagination: p }) => {
  const { sortBy, descending, page, rowsPerPage } = p

  const where = {}
  if (filters.value.supplierFk) {
    where.supplierFk = filters.value.supplierFk
  }
  if (filters.value.payMethod) {
    where.payMethod = filters.value.payMethod
  }
  if (filters.value.buyedFrom && filters.value.buyedTo) {
    where.buyed = {
      between: [filters.value.buyedFrom, filters.value.buyedTo],
    }
  }

  const filter = {
    order: [`${sortBy} ${descending ? 'DESC' : 'ASC'}`],
    limit: rowsPerPage,
    skip: (page - 1) * rowsPerPage,
    where,
  }

  try {
    await refetch({ params: { filter } })

    const countRes = await api.get('/buys/count', { params: { where } })
    rowsNumber.value = countRes.data.count

    pagination.value = {
      page,
      rowsPerPage,
      sortBy,
      descending,
      rowsNumber: rowsNumber.value,
    }
  } catch (err) {
    console.error('Error en onRequest:', err)
  }
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
  {
    name: 'buyed',
    label: 'Data de pagament',
    align: 'left',
    field: 'buyed',
    format: formatDate,
    sortable: true,
  },
  {
    name: 'digitizedDocument',
    label: 'Document digitalitzat',
    align: 'left',
    field: 'digitizedDocument',
  },
  {
    name: 'created',
    label: 'Data de facturació',
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
</script>
