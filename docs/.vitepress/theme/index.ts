// https://vitepress.dev/guide/custom-theme
import { h, ref } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import FooterBottom from './FooterBottom.vue'
import VersionSwitcher from './VersionSwitcher.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h(FooterBottom),
      'nav-bar-content-after': () => h(VersionSwitcher)
    })
  },
  enhanceApp({ app, router, siteData }) {
    const version = ref<string>("main");
    app.provide('version', version);
  }
} satisfies Theme
