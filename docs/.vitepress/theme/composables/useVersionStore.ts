import { ref } from 'vue';
import packageJson from '../../../../package.json'
import { defineStore } from 'pinia';

export const useVersionStore = defineStore('versions', () => {
    const version = ref(packageJson.repoTags[0]);
    const versions = ref(packageJson.repoTags);
    return { version, versions }
});
