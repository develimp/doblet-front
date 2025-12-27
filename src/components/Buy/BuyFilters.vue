<template>
  <div class="q-pa-md column q-gutter-md">
    <q-toolbar class="bg-grey-2 text-dark rounded-borders q-mb-md">
      <q-toolbar-title>Filtres</q-toolbar-title>
    </q-toolbar>
    <SpSelect
      v-model="selectedSupplier"
      :options="suppliers"
      option-label="name"
      option-value="id"
      label="Proveïdor"
    />
    <SpSelect v-model="selectedPayMethod" :options="payMethods" label="Mètode de pagament" />
    <q-input v-model="dateRangeLabel" label="Període" outlined clearable class="q-mb-md" readonly>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date
              v-model="modelDateRange"
              range
              mask="YYYY-MM-DD"
              @update:model-value="emitDateRange"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-btn label="Netejar filtres" color="secondary" flat icon="clear" @click="clearFilters" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'boot/axios'
import SpSelect from 'src/components/SpSelect.vue'

const props = defineProps({
  supplier: [Number, String, null],
  payMethod: [String, null],
  buyedFrom: [String, null],
  buyedTo: [String, null],
})
const emit = defineEmits([
  'update:supplier',
  'update:payMethod',
  'update:buyedFrom',
  'update:buyedTo',
])

const selectedSupplier = ref(props.supplier)
const selectedPayMethod = ref(props.payMethod)
const modelDateRange = ref(
  props.buyedFrom && props.buyedTo ? { from: props.buyedFrom, to: props.buyedTo } : null,
)
const dateRangeLabel = ref(
  props.buyedFrom && props.buyedTo ? `${props.buyedFrom} → ${props.buyedTo}` : '',
)

watch(selectedSupplier, (val) => emit('update:supplier', val))
watch(selectedPayMethod, (val) => emit('update:payMethod', val))

const emitDateRange = (val) => {
  if (typeof val === 'string') {
    emit('update:buyedFrom', val)
    emit('update:buyedTo', val)
    dateRangeLabel.value = val
  } else if (val?.from && val?.to) {
    emit('update:buyedFrom', val.from)
    emit('update:buyedTo', val.to)
    dateRangeLabel.value = `${val.from} → ${val.to}`
  } else {
    emit('update:buyedFrom', null)
    emit('update:buyedTo', null)
    dateRangeLabel.value = ''
  }
}

const suppliers = ref([])
const payMethods = [
  { label: 'Efectiu', value: 'efectiu' },
  { label: 'Banc', value: 'banc' },
]

const fetchSuppliers = async () => {
  try {
    const res = await api.get('/suppliers', {
      params: { filter: { order: ['name ASC'] } },
    })
    suppliers.value = res.data
  } catch (err) {
    console.error('Error cargando proveedores:', err)
  }
}
fetchSuppliers()

const clearFilters = () => {
  selectedSupplier.value = null
  selectedPayMethod.value = null
  modelDateRange.value = null
  dateRangeLabel.value = ''
  emit('update:buyedFrom', null)
  emit('update:buyedTo', null)
}
</script>
