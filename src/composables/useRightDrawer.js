import { ref } from 'vue'

export const rightDrawerContent = ref(null)

export function useRightDrawer() {
  const setRightDrawer = (content) => {
    rightDrawerContent.value = content
  }
  const clearRightDrawer = () => {
    rightDrawerContent.value = null
  }
  return { rightDrawerContent, setRightDrawer, clearRightDrawer }
}
