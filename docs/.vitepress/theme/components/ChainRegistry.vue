<template>
    <h3>APIs</h3>
    <div class="tabs">
        <button :class="{ active: activeTab === 'RPC' }" @click="activeTab = 'RPC'">RPC</button>
        <button :class="{ active: activeTab === 'REST' }" @click="activeTab = 'REST'">REST</button>
        <button :class="{ active: activeTab === 'GRPC' }" @click="activeTab = 'GRPC'">GRPC</button>
        <button :class="{ active: activeTab === 'EXPLORERS' }" @click="activeTab = 'EXPLORERS'">Explorers</button>
    </div>
    <div class="providers">
        <div v-if="activeTab === 'RPC'" v-for="api in rpcAPIs" :key="api.address" class="provider">
            <div class="provider-name">{{ api.provider }}</div>
            <div class="combine hoverable" @click="copyToClipboard(api.address)">
                <div class="provider-address">{{ cleanUrl(api.address) }}</div>
                <div class="icon">
                    <Check v-if="lastCopiedToClipboard == api.address" />
                    <Copy v-else />
                </div>
            </div>
        </div>
        <div v-if="activeTab === 'REST'" v-for="api in restAPIs" :key="api.address" class="provider">
            <div class="provider-name">{{ api.provider }}</div>
            <div class="combine hoverable" @click="copyToClipboard(api.address)">
                <div class="provider-address">{{ cleanUrl(api.address) }}</div>
                <div class="icon">
                    <Check v-if="lastCopiedToClipboard == api.address" />
                    <Copy v-else />
                </div>
            </div>
        </div>
        <div v-if="activeTab === 'GRPC'" v-for="api in grpcAPIs" :key="api.address" class="provider">
            <div class="provider-name">{{ api.provider }}</div>
            <div class="combine hoverable" @click="copyToClipboard(api.address)">
                <div class="provider-address">{{ cleanUrl(api.address) }}</div>
                <div class="icon">
                    <Check v-if="lastCopiedToClipboard == api.address" />
                    <Copy v-else />
                </div>
            </div>
        </div>
        <div v-if="activeTab === 'EXPLORERS'" v-for="explorer in explorerAPIs" :key="explorer.kind" class="provider">
            <div class="provider-name">{{ explorer.kind }}</div>
            <a class="combine hoverable" :href="explorer.url" target="_blank">
                <div class="provider-address">{{ cleanUrl(explorer.url) }}</div>
                <div class="icon" @click="copyToClipboard(explorer.url)">
                    <Link />
                </div>
            </a>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useChainData } from '../composables/useChainData';
import Check from '../icons/Check.vue';
import Copy from '../icons/Copy.vue';
import Link from '../icons/Link.vue';

const { data } = useChainData();
const activeTab = ref<'RPC' | 'REST' | 'GRPC' | 'EXPLORERS'>('RPC');
const lastCopiedToClipboard = ref<string>('');

function cleanUrl(url: string) {
    return url.replace('http://', '').replace('https://', '');
}

function copyToClipboard(text: string) {
    lastCopiedToClipboard.value = text;

    navigator.clipboard
        .writeText(text)
        .then(function () {
            console.log('Text successfully copied to clipboard!');
        })
        .catch(function (error) {
            console.error('Unable to copy text to clipboard: ', error);
        });
}

const restAPIs = computed(() => {
    if (!data.value) {
        return [];
    }

    return data.value.apis.rest;
});

const rpcAPIs = computed(() => {
    if (!data.value) {
        return [];
    }

    return data.value.apis.rpc;
});

const grpcAPIs = computed(() => {
    if (!data.value) {
        return [];
    }

    return data.value.apis.grpc;
});

const explorerAPIs = computed(() => {
    if (!data.value) {
        return [];
    }

    return data.value.explorers;
});
</script>

<style scoped>
.icon {
    width: 24px;
    height: 24px;
}

.combine {
    display: flex;
    gap: 12px;
}

.hoverable:hover {
    cursor: pointer;
    color: #fff;
}

.tabs button {
    padding: 10px;
    cursor: pointer;
    width: 100%;
    border-radius: 6px;
}

.tabs button.active {
    background-color: var(--vp-c-bg-soft);
    color: white;
}

.tabs {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 12px;
    background: #0f0e19;
    padding: 12px;
    border-radius: 6px;
}

.provider {
    display: flex;
    width: 100%;
    justify-content: space-between;
    justify-items: center;
    align-items: center;
    word-wrap: break-word;
    word-break: break-all;
    padding: 6px 0px;
    border-top: 1px solid var(--vp-c-divider);
}

.provider-name {
    font-size: 12px;
}

.provider-address {
    text-align: right;
    font-size: 12px;
}

.providers {
    padding: 6px;
    margin-top: 24px;
}
</style>
