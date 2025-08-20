import { ref } from 'vue'

export function useCrudDialog() {
  const showDialog = ref(false)
  const selectedItem = ref(null)

  const openDialog = (item = null) => {
    selectedItem.value = item
    showDialog.value = true
  }

  const closeDialog = () => {
    showDialog.value = false
    selectedItem.value = null
  }

  return {
    showDialog,
    selectedItem,
    openDialog,
    closeDialog,
  }
}
