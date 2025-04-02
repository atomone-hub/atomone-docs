import { defineConfig } from 'vitepress';
import { generateSidebar } from './utility/sidebar';
import packageJson from '../../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'AtomOne Docs',
    description: 'Documentation by developers, for developers',
    appearance: 'force-dark',
    ignoreDeadLinks: true, // Leave this on because the inherited docs will create broken links
    cleanUrls: false,
    lastUpdated: false,
    head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    markdown: {
        math: true,
        languageAlias: {
            golang: 'go',
        },
        // This fixes an issue with formatting in files
        attrs: { 
          disable: true 
        }
    },
    themeConfig: {
        search: {
            provider: 'local',
            options: {
                detailedView: true,
            },
        },
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Node Setup', link: '/node' },
            { text: 'Architecture', link: '/architecture' },
            { text: 'Modules', items: getModuleNavbar() },
        ],
        sidebar: {
            '/getting-started': generateSidebar('docs/getting-started'),
            '/architecture': generateSidebar('docs/architecture'),
            '/node': generateSidebar('docs/node'),
            ...getModuleSidebar()
        },
        socialLinks: [
            { icon: 'x', link: 'https://x.com/_atomone' },
            { icon: 'github', link: 'https://github.com/atomone-hub' },
            { icon: 'discord', link: 'https://discord.com/invite/atomone' },
            { icon: 'youtube', link: 'https://www.youtube.com/@AtomOneHub' },
            { icon: 'reddit', link: 'https://www.reddit.com/r/atomone/' },
        ],
        logo: '/logo.svg',
    },
});

function getModuleSidebar() {
    const tags = {};
    for(let tag of packageJson.repoTags) {
        tags[`/modules/${tag}`] = [ { text: tag, items: generateSidebar(`docs/modules/${tag}`) } ];
    }

    return tags;
}

function getModuleNavbar() {
    const links: { text: string, link: string }[] = [];
    for(let tag of packageJson.repoTags) {
        const modulePath = `/modules/${tag}`
        links.push({ text: tag, link: modulePath });
    }

    return links;
}
