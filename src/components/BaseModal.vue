<template>
  <div
    v-show="modalStore.isOpen(name)"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4 transition-opacity duration-300"
    :class="{ 'opacity-100': modalStore.isOpen(name), 'opacity-0': !modalStore.isOpen(name) }"
    @click.self="modalStore.close()"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 my-auto transition-transform duration-300 ease-out"
      :class="{
        'scale-100 translate-y-0': modalStore.isOpen(name),
        'scale-95 translate-y-4': !modalStore.isOpen(name),
      }"
      @click.stop
    >
      <header class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {{ title }}
        </h3>
        <button
          @click="modalStore.close()"
          aria-label="close"
          class="text-gray-600 dark:text-gray-300 hover:text-gray-900"
        >
          ✕
        </button>
      </header>

      <div class="mb-4">
        <slot name="body" />
      </div>

      <footer v-if="$slots.footer" class="flex justify-end gap-2">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useModalStore } from '@/stores/useModal'

const props = defineProps<{ name: string; title?: string }>()
const modalStore = useModalStore()

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modalStore.isOpen(props.name)) {
    modalStore.close()
  }
}

watch(
  () => modalStore.isOpen(props.name),
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>
