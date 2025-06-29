<template>
  <q-item
    clickable
    :to="isExternal ? undefined : link"
    :href="isExternal ? link : undefined"
    :target="isExternal ? '_blank' : undefined"
    v-ripple
    active-class="my-menu-link"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>{{ props.title }}</q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },
})
const isExternal = /^https?:\/\//.test(props.link)
</script>

<style lang="scss">
.my-menu-link {
  color: white;
  background: $primary;
}
</style>
