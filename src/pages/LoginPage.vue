<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin">
          <q-input v-model="email" label="Email" type="email" required />
          <q-input v-model="password" label="Password" type="password" required class="q-mt-md" />
          <q-btn
            label="Login"
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
import axios from 'axios'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

async function handleLogin() {
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/login', {
      email: email.value,
      password: password.value,
    })

    const token = res.data.token || res.data.idToken || res.data // según tu backend
    localStorage.setItem('token', token)

    // Redirigir a página protegida
    router.push('/')
  } catch (err) {
    console.error('Login error', err)
    alert('Login incorrecto')
  } finally {
    loading.value = false
  }
}
</script>
