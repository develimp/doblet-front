import { ref } from 'vue'
import { api } from 'boot/axios'

export function useFetch(initialEndpoint = null, initialOptions = {}, config = {}) {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)

  let endpoint = initialEndpoint

  const fetchData = async ({ url, options } = {}) => {
    const finalUrl = url || endpoint

    // 🔒 Protección clave
    if (!finalUrl) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get(finalUrl, options || initialOptions)
      data.value = response.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 👇 solo ejecuta si quieres
  if (config.immediate !== false && initialEndpoint) {
    fetchData()
  }

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
