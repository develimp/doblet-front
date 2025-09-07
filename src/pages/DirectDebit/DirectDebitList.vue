<template>
  <q-page padding>
    <div v-if="loading" class="row justify-center">
      <q-spinner-dots color="primary" size="50px" />
    </div>
    <div v-else-if="error">
      <q-banner class="bg-red text-white">
        Error carregant la domiciliació: {{ error.message }}
        <q-btn
          flat
          color="white"
          label="Reintentar"
          @click="refetch({ params: { filter: { order: ['member ASC'] } } })"
        />
      </q-banner>
    </div>
    <div v-else-if="data.length === 0">No s'han trobat domiciliacions.</div>
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
          <q-btn icon="edit" flat dense @click="editDirectDebit(props.row)" />
          <q-btn icon="delete" flat dense color="negative" @click="deleteDirectDebit(props.row)" />
        </q-td>
      </template>
    </SpTable>
    <div class="row items-center justify-end q-mt-md">
      <q-btn
        label="Nova domiciliació"
        color="primary"
        icon="add"
        class="q-mr-sm"
        @click="
          () => {
            selectedDirectDebit = null
            showDialog = true
          }
        "
      />
      <q-btn
        label="Actualitzar imports"
        color="secondary"
        icon="refresh"
        class="q-mr-sm"
        @click="showUpdateDialog = true"
      />
      <q-btn
        label="Registrar pagaments"
        color="accent"
        icon="payment"
        @click="showRegisterDialog = true"
      />
    </div>
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ selectedDirectDebit ? 'Editar domiciliació' : 'Afegir nova domiciliació' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <DirectDebitForm
            :directDebitToEdit="selectedDirectDebit"
            @success="onDirectDebitCreated"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showUpdateDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Actualitzar imports</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model.number="months"
            type="number"
            label="Número de mesos"
            :min="1"
            :max="12"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions class="justify-end">
          <q-btn flat label="Cancel·lar" v-close-popup />
          <q-btn
            color="primary"
            label="Actualitzar"
            :loading="updating"
            @click="updateCalculated"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showRegisterDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Registrar pagaments</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="registerDate"
            label="Data del pagament"
            outlined
            dense
            readonly
            class="cursor-pointer"
            @click="popupRegisterRef?.value?.show?.()"
          >
            <template v-slot:append>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click="popupRegisterRef?.value?.show?.()"
              />
            </template>

            <q-popup-proxy ref="popupRegisterRef" transition-show="scale" transition-hide="scale">
              <q-date
                v-model="registerDate"
                @update:model-value="popupRegisterRef?.hide?.()"
                color="primary"
              />
            </q-popup-proxy>
          </q-input>
          <q-input v-model="registerNote" type="text" label="Nota" outlined dense />
        </q-card-section>
        <q-card-actions class="justify-end">
          <q-btn flat label="Cancel·lar" v-close-popup />
          <q-btn
            color="primary"
            label="Registrar"
            :loading="registering"
            @click="registerDirectDebitPayments"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import SpTable from 'src/components/SpTable.vue'
import DirectDebitForm from 'src/components/DirectDebit/DirectDebitForm.vue'
import { useFetch } from 'src/composables/useFetch'
import { useCrudDialog } from 'src/composables/useCrudDialog'

const { data, loading, error, refetch } = useFetch('/direct-debits')

const { showDialog, selectedItem: selectedDirectDebit, openDialog, closeDialog } = useCrudDialog()

const editDirectDebit = (directDebit) => {
  openDialog(directDebit)
}

const onDirectDebitCreated = async () => {
  closeDialog()
  await refetch()
}

const showUpdateDialog = ref(false)
const months = ref(1)
const updating = ref(false)

const updateCalculated = async () => {
  try {
    updating.value = true
    await api.post('/direct-debits/update-calculated-amounts', { months: months.value })
    showUpdateDialog.value = false
    await refetch()
  } catch (error) {
    console.error('Error actualitzant els imports calculats:', error)
  } finally {
    updating.value = false
  }
}

const showRegisterDialog = ref(false)
const registerDate = ref('')
const registerNote = ref('')
const registering = ref(false)

const registerDirectDebitPayments = async () => {
  try {
    registering.value = true
    const formattedDate = registerDate.value ? registerDate.value.replace(/\//g, '-') : null

    await api.post('/members/register-all-direct-debit-payments', {
      date: formattedDate,
      note: registerNote.value,
    })

    showRegisterDialog.value = false

    await refetch()
  } catch (err) {
    console.error('Error registrant els pagaments:', err)
  } finally {
    registering.value = false
  }
}

const $q = useQuasar()

const deleteDirectDebit = (directDebit) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Segur que vols eliminar la domiciliació de ${directDebit.member.name} ${directDebit.member.surname}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/direct-debits/${directDebit.id}`)
      await refetch()
    } catch (err) {
      console.error('Error eliminant la domiciliació:', err)
    }
  })
}

const pagination = ref({
  sortBy: 'member',
  descending: false,
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
    name: 'member',
    label: 'Titular',
    align: 'left',
    field: (row) => `${row.member.name} ${row.member.surname}`,
    sortable: true,
  },
  {
    name: 'accountNumber',
    label: 'Iban',
    align: 'left',
    field: 'accountNumber',
    sortable: true,
  },
  {
    name: 'calculatedAmount',
    label: 'Quantitat calculada',
    align: 'right',
    field: 'calculatedAmount',
    format: (val) => (val != null ? `${val} €` : ''),
  },
  {
    name: 'actualAmount',
    label: 'Quantitat a domiciliar',
    align: 'right',
    field: 'actualAmount',
    format: (val) => (val != null ? `${val} €` : ''),
    classes: (row) => {
      const diff = row.calculatedAmount - row.actualAmount
      if (diff > 5) return 'text-red'
      if (diff >= -5 && diff <= 5) return 'text-green'
      if (diff < -5) return 'text-yellow'
      return ''
    },
  },
  {
    name: 'notes',
    label: 'Notes',
    align: 'left',
    field: 'notes',
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
