<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center q-my-md">
      <q-spinner-dots size="40px" color="primary" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant vendes: {{ error.message }}
        <q-btn
          flat
          color="white"
          label="Reintentar"
          @click="refetch({ params: { filter: { order: ['sold DESC'] } } })"
        />
      </q-banner>
    </div>
    <div v-else-if="data.length === 0">No s'han trobat vendes.</div>
    <SpTable
      v-else
      :rows="data || []"
      :columns="columns"
      row-key="id"
      class="q-mt-md table-header-bg"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
    >
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
import { ref } from 'vue'
import SaleForm from 'src/components/Sale/SaleForm.vue'
import SpTable from 'src/components/SpTable.vue'
import { useFetch } from 'src/composables/useFetch'
import { useDateFormat } from 'src/composables/useDateFormat'
import { useCrudDialog } from 'src/composables/useCrudDialog'

const { data, loading, error, refetch } = useFetch('/sales')

const { formatDate } = useDateFormat()

const { showDialog, selectedItem: selectedSale, openDialog, closeDialog } = useCrudDialog()

const editSale = (sale) => {
  openDialog(sale)
}

const onSaleCreated = async () => {
  closeDialog()
  await refetch()
}

const pagination = ref({
  sortBy: 'sold',
  descending: true,
  page: 1,
  rowsPerPage: 15,
})

const onRequest = async ({ pagination: p }) => {
  const { sortBy, descending, page, rowsPerPage } = p
  await refetch({
    params: {
      filter: {
        order: [`${sortBy} ${descending ? 'DESC' : 'ASC'}`],
        limit: rowsPerPage,
        skip: (page - 1) * rowsPerPage,
      },
    },
  })
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
  {
    name: 'sold',
    label: 'Data de pagament',
    align: 'left',
    field: 'sold',
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
