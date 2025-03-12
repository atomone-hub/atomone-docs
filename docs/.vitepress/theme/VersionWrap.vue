<script lang="ts" setup>
import { useVersionStore } from "./composables/useVersionStore";

const versionStore = useVersionStore();
const props = defineProps<{ v: string }>();
</script>

<template>
  <div v-if="props.v == versionStore.version">
    <slot></slot>
  </div>
</template>