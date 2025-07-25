<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Doblet App </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="logout"
          aria-label="Logout"
          @click="handleLogout"
          class="q-mr-sm"
          v-tooltip.bottom="'Cerrar sesión'"
        />

        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header> Enllaços </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()

const linksList = [
  {
    title: 'Categories',
    caption: 'Categories dels fallers',
    icon: 'category',
    link: '/category/list',
  },
  {
    title: 'Compres',
    caption: 'Compres efectuades',
    icon: 'shopping_cart',
    link: '/buy/list',
  },
  {
    title: 'Vendes',
    caption: 'Vendes efectuades',
    icon: 'local_mall',
    link: '/sale/list',
  },
  {
    title: 'Proveïdors',
    caption: 'Proveïdors',
    icon: 'local_shipping',
    link: '/supplier/list',
  },
  {
    title: 'Clients',
    caption: 'Clients',
    icon: 'people',
    link: '/client/list',
  },
  {
    title: 'Github',
    caption: 'github.com/develimp',
    icon: 'code',
    link: 'https://github.com/develimp',
  },
]

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

function handleLogout() {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>
