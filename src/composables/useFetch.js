import { ref } from 'vue'
import { api } from 'boot/axios'

export function useFetch(endpoint) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const fetchData = async (options = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(endpoint, options)
      data.value = response.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  fetchData()

  return { data, loading, error, refetch: fetchData }
}
