<template>
  <q-table
    class="sp-table"
    flat
    bordered
    :rows="rows"
    :columns="columns"
    row-key="id"
    virtual-scroll
    virtual-scroll-item-size="48"
    virtual-scroll-slice-size="20"
    style="max-height: 70vh; overflow-y: auto"
    :rows-per-page-options="[0]"
    :pagination="{ rowsPerPage: 0 }"
    v-bind="$attrs"
  >
    <template v-for="(slotFn, name) in slots" :key="name" v-slot:[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </q-table>
</template>

<script setup>
import { useSlots } from 'vue'

const slots = useSlots()

defineProps({
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
})
</script>

<style lang="scss">
.sp-table thead tr {
  background-color: var(--q-primary);
  color: white;
}
</style>
