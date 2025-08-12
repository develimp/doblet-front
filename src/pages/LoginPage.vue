<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="width: 300px">
      <div class="flex justify-center q-my-md">
        <q-img
          alt="Falla logo"
          src="~assets/falla-logo.png"
          style="max-width: 100%; height: auto"
        />
      </div>
      <q-card-section>
        <q-form @submit.prevent="handleLogin">
          <q-input v-model="email" label="Correu electrònic" type="email" required />
          <q-input
            v-model="password"
            label="Contrasenya"
            type="password"
            required
            class="q-mt-md"
          />
          <q-btn
            label="Iniciar sessió"
            type="submit"
            color="primary"
            class="q-mt-lg full-width"
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { publicApi } from 'boot/axios'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  loading.value = true
  try {
    const res = await publicApi.post('/login', {
      email: email.value,
      password: password.value,
    })

    const token = res.data.token || res.data.idToken || res.data
    localStorage.setItem('token', token)

    router.push('/')
  } catch (err) {
    console.error('Login error', err)
    alert('Login incorrecto')
  } finally {
    loading.value = false
  }
}
</script>
