import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'BFFless',
  tagline: 'Self-hosted static site hosting made simple',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  url: 'https://docs.bffless.com',
  baseUrl: '/',

  trailingSlash: true,
  organizationName: 'bffless',
  projectName: 'bffless',

  onBrokenLinks: 'throw',

  clientModules: ['./src/gtag-stub.ts'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogTitle: 'BFFless Blog',
          blogDescription: 'News and updates from the BFFless team',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-T20LHNBRK6',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    navbar: {
      title: 'BFFless',
      logo: {
        alt: 'BFFless Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          href: 'https://discord.gg/BfyJwZqS',
          label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/bffless/ce',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/BfyJwZqS',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/bffless/ce',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BFFless. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'docker', 'nginx'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
