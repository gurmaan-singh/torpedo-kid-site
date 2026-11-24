import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Features (Anchor Link)',
      href: getPermalink('/#features'),
    },
    {
      text: 'Join Us',
      href: getPermalink('/join-us'),
    },
    {
      text: 'Partner With Us',
      href: getPermalink('/partner-with-us'),
    },
    {
      text: 'About us',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        { text: 'Features', href: getPermalink('/#features') },
        { text: 'Pricing', href: getPermalink('/pricing') },
        { text: 'Services', href: getPermalink('/services') },
        { text: 'Blog', href: getBlogPermalink() },
      ],
    },

    {
      title: 'Resources',
      links: [
        { text: 'Documentation', href: 'https://github.com/arthelokyo/astrowind#readme' },
        { text: 'Skills for AI agents', href: 'https://github.com/arthelokyo/astrowind/tree/main/.agents/skills' },
        { text: 'Releases', href: 'https://github.com/arthelokyo/astrowind/releases' },
        { text: 'Discussions', href: 'https://github.com/arthelokyo/astrowind/discussions' },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Report an issue', href: 'https://github.com/arthelokyo/astrowind/issues' },
        { text: 'License', href: 'https://github.com/arthelokyo/astrowind/blob/main/LICENSE.md' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/arthelokyo/astrowind' },
  ],
  footNote: `
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://arthelokyo.com"> Arthelokyo</a> · All rights reserved.
  `,
};
