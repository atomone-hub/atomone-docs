// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import FooterBottom from './FooterBottom.vue';
import ChainRegistry from './components/ChainRegistry.vue';
import ValidatorRegistry from './components/ValidatorRegistry.vue';
import './style.css';

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
            'layout-bottom': () => h(FooterBottom),
        });
    },
    enhanceApp({ app, router, siteData }) {
        app.component('ChainRegistry', ChainRegistry);
        app.component('ValidatorRegistry', ValidatorRegistry);
    },
} satisfies Theme;
