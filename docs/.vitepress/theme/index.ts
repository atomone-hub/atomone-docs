// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import FooterBottom from './FooterBottom.vue'
import VersionSwitcher from './VersionSwitcher.vue'
import VersionWrap from './VersionWrap.vue'
import './style.css'
import { createPinia } from 'pinia'

const pinia = createPinia()

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
    app.use(pinia)
    app.component('VersionWrap', VersionWrap);
  }
} satisfies Theme
