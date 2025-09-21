<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Doblet App </q-toolbar-title>
        <q-btn-dropdown
          flat
          color="white"
          icon="account_circle"
          :label="user?.name || 'Usuari'"
          class="normal-case"
        >
          <q-list>
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Tancar sessió</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <div class="flex justify-center q-my-md">
          <q-img
            alt="Falla logo"
            src="~assets/falla-logo.png"
            style="max-width: 50%; height: auto"
          />
        </div>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <div v-if="rightDrawerContent" class="q-pa-md">
        <component :is="rightDrawerContent" />
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'
import { api } from 'src/boot/axios'
import { rightDrawerContent } from 'src/composables/useRightDrawer'

const router = useRouter()

const linksList = [
  {
    title: 'Inici',
    caption: 'Pàgina principal',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Domiciliacions',
    caption: 'Gestió de domiciliacions',
    icon: 'credit_card',
    link: '/directDebit/list',
  },
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
    title: 'Grafana',
    caption: 'grafana.santspatrons.com',
    icon: 'analytics',
    link: 'https://grafana.santspatrons.com',
  },
  {
    title: 'Github',
    caption: 'github.com/develimp',
    icon: 'code',
    link: 'https://github.com/develimp',
  },
]

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(true)
const user = ref(null)

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

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.replace('/login')
    return
  }

  try {
    const res = await api.get('/whoami', {
      headers: { Authorization: `Bearer ${token}` },
    })
    user.value = res.data
  } catch (err) {
    console.error('Error cargando usuario', err)
    handleLogout()
  }
})
</script>
