<template>
  <q-page padding>
    <q-btn
      label="Document d'adhesió a la falla"
      color="secondary"
      icon="picture_as_pdf"
      class="q-mr-sm"
      @click="downloadPDF"
    />
  </q-page>
</template>

<script setup>
import { api } from 'boot/axios'

const downloadPDF = async () => {
  try {
    const response = await api.get('/members/pdf', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

    window.open(url)
  } catch (error) {
    console.error('Error descargando PDF:', error)
  }
}
</script>
