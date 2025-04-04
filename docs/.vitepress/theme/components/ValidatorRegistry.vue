<template>
    <div class="validator-list">
        <div class="validator" v-for="(validator, index) in sortedValidators" :key="index">
            <div>{{ validator.moniker }}</div>
            <div class="combine">
                <a
                    :href="'mailto:' + validator.security_contact"
                    class="icon"
                    target="_blank"
                    :class="validator.security_contact !== '' ? ['icon-active'] : ['icon-inactive']"
                >
                    <Email />
                </a>
                <a
                    :href="validator.website"
                    class="icon"
                    target="_blank"
                    :class="validator.website !== '' ? ['icon-active'] : ['icon-inactive']"
                >
                    <WorldIcon />
                </a>
            </div>
        </div>
        <em class="small-text">This list is automatically generated from API endpoints.</em>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import WorldIcon from '../icons/World.vue';
import Email from '../icons/Email.vue';
import { ValidatorResponse } from '../types/validatorResponse';

type ValidatorInfo = { moniker: string; security_contact: string; website: string };

const ENDPOINT = `https://atomone-api.allinbits.com/cosmos/staking/v1beta1/validators`;

const validators = ref<ValidatorInfo[]>([]);

async function fetchValidators(nextKey: string | null = null, allValidators: ValidatorInfo[] = []) {
    const url = nextKey ? `${ENDPOINT}?pagination.key=${encodeURIComponent(nextKey)}` : ENDPOINT;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const data = (await response.json()) as ValidatorResponse;
    const filteredValidators = data.validators.filter(x => !x.jailed);
    const validators = filteredValidators.map((v) => ({
        moniker: v.description.moniker,
        security_contact: v.description.security_contact,
        website: v.description.website.startsWith('https://') ? v.description.website : 'https://' + v.description.website,
    }));

    allValidators = allValidators.concat(validators);
    return data.pagination?.next_key ? fetchValidators(data.pagination.next_key, allValidators) : allValidators;
}

async function update() {
    validators.value = await fetchValidators();
}

const sortedValidators = computed(() => {
    return validators.value.sort((a, b) => {
        if (a.moniker < b.moniker) {
            return -1;
        }

        if (a.moniker > b.moniker) {
            return 1;
        }

        return 0;
    });
});

onMounted(update);
</script>

<style scoped>
.validator-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 12px;
    gap: 12px;
    background: #0f0e19;
    border-radius: 12px;
}

.validator {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--vp-c-divider);
}

.combine {
    display: flex;
    flex-direction: row;
    gap: 4px;
}

.icon {
    width: 24px;
    height: 24px;
}

.icon-active:hover {
    cursor: pointer;
    color: #fff;
}

.icon-inactive {
    cursor: not-allowed;
    color: var(--vp-c-bg-soft);
}

.small-text {
    font-size: 12px;
    text-align: right;
}
</style>
