import { defineConfig } from 'vitepress'
import { generateSidebar } from './utility/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AtomOne Docs",
  description: "Documentation by developers, for developers",
  appearance: 'force-dark',
  ignoreDeadLinks: true, // Leave this on because the inherited docs will create broken links
  cleanUrls: false,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  markdown: {
    math: true,
    languageAlias: {
      'golang': 'go'
    }
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started'},
      { text: 'Architecture', link: '/architecture' },
      { text: 'Modules', link: '/modules' },
    ],
    sidebar: {
      '/getting-started': generateSidebar('docs/getting-started'),
      '/architecture': generateSidebar('docs/architecture'),
      '/modules': generateSidebar('docs/modules'),
    },
    socialLinks: [
      { icon: 'x', link: 'https://x.com/_atomone'},
      { icon: 'github', link: 'https://github.com/atomone-hub' },
      { icon: 'discord', link: 'https://discord.com/invite/atomone'},
      { icon: 'youtube', link: 'https://www.youtube.com/@AtomOneHub'},
      { icon: 'reddit', link: 'https://www.reddit.com/r/atomone/'}
    ],
    logo: '/logo.svg',
  },
})
