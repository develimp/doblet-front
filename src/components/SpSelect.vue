<script setup>
import { ref, watch, useAttrs } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  emitValue: { type: Boolean, default: true },
  mapOptions: { type: Boolean, default: true },
  modelValue: { type: [String, Number, Object, Array, null], default: null },
})

const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const filteredOptions = ref([])

watch(
  () => props.options,
  (val) => {
    filteredOptions.value = val
  },
  { immediate: true },
)

const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      filteredOptions.value = props.options
      return
    }

    const needle = val.toLowerCase()
    const getLabel = attrs['option-label']

    filteredOptions.value = props.options.filter((opt) => {
      const label = typeof getLabel === 'function' ? getLabel(opt) : opt[getLabel]

      return String(label).toLowerCase().includes(needle)
    })
  })
}
</script>

<template>
  <q-select
    class="sp-select"
    outlined
    dense
    use-input
    input-debounce="300"
    clearable
    lazy-rules
    :options="filteredOptions"
    :emit-value="emitValue"
    :map-options="mapOptions"
    v-bind="$attrs"
    :model-value="modelValue"
    @filter="filterFn"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <template #prepend>
      <q-icon name="search" />
    </template>
  </q-select>
</template>

<style lang="scss">
.sp-select {
  width: 300px;
  max-width: 500px;
}
</style>
