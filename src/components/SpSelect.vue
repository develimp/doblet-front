<!--
  SpSelect
  Wrapper de q-select amb estil unificat.

  - class sp-select per a estilització comuna
  - outlined es fixa ací
  - use-input es fixa ací per a permetre cerca
  - input-debounce es fixa a 300ms per a millorar rendiment en cerques
  - clearable es fixa ací per a permetre netejar la selecció
  - lazy-rules es fixa ací per a millorar rendiment en validacions
  - options es una prop pròpia requerida (és el contingut del select)
  - emit-value i map-options es fixen a true per a facilitar l'ús (es pot ficar a false en el cas que es necessite)
  - $attrs es reenvía al q-select per a suportar qualsevol altre atribut de q-select
  - model-value i update:model-value per a v-model i també es important per a compatibilitat amb q-select
-->
<template>
  <q-select
    class="sp-select"
    outlined
    use-input
    input-debounce="300"
    clearable
    lazy-rules
    :options="options"
    :emit-value="emitValue"
    :map-options="mapOptions"
    v-bind="$attrs"
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <template #prepend>
      <q-icon name="search" />
    </template>
  </q-select>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  emitValue: { type: Boolean, default: true },
  mapOptions: { type: Boolean, default: true },
  modelValue: { type: [String, Number, Object, Array, null], default: null },
})

const emit = defineEmits(['update:modelValue'])
</script>

<style lang="scss">
.sp-select {
  max-width: 500px;
}
</style>
