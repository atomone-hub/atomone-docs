<script setup>
import { ref, onBeforeUnmount } from "vue";
import { useVersionStore } from "./composables/useVersionStore";

const modalOpen = ref(false);
const versionStore = useVersionStore();

function switchVersion(newVersion) {
  versionStore.version = newVersion;
  modalOpen.value = false;
  document.removeEventListener("click", handleClickOutside);
}

function showModal() {
  modalOpen.value = true;

  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 500);
}

function handleClickOutside(event) {
  const modal = document.querySelector(".modal");
  if (modal && !modal.contains(event.target)) {
    modalOpen.value = false;
    document.removeEventListener("click", handleClickOutside);
  }
}

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="version-selector">
    <div class="divider"></div>
    <button class="dropdown-btn" @click="showModal">
      {{ versionStore.version }}
    </button>
    <div v-if="modalOpen" class="overlay">
      <div class="modal">
        <h2>Select Version</h2>
        <div class="version-options">
          <div class="dropdown-item" v-for="(version, index) in versionStore.versions" :key="index" @click="switchVersion(version)">{{ version }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.divider {
  margin-right: 16px;
  margin-left: 16px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  content: "";
}

.version-selector {
  display: flex;
  align-items: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  backdrop-filter: blur(10px);
}

.modal {
  background-color: var(--vp-c-bg);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.version-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: var(--vp-c-bg-soft);
}

.dropdown-btn {
  padding: 8px 8px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  transition: opacity 0.3s ease;
}

.dropdown-btn:hover {
  opacity: 0.8;
}
</style>
