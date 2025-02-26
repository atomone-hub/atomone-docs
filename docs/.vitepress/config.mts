import { defineConfig } from 'vitepress'
import { generateSidebar } from './utility/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AtomOne Docs",
  description: "Documentation by developers, for developers",
  appearance: 'force-dark',
  ignoreDeadLinks: false,
  cleanUrls: false,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  markdown: {
    math: true
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started'},
      { text: 'Architecture', link: '/architecture' },
      { text: 'Modules', items: [
          { text: 'x/gov', link: '/modules/gov'},
          { text: 'x/photon', link: '/modules/photon'},
        ] 
      }
    ],
    sidebar: {
      '/getting-started': generateSidebar('docs/getting-started'),
      '/architecture': generateSidebar('docs/architecture'),
      '/modules/gov': generateSidebar('docs/modules/gov'),
      '/modules/photon': generateSidebar('docs/modules/photon'),
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
