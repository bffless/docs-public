import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
        description: 'Get up and running with BFFless quickly.',
      },
      items: [
        'getting-started/quickstart',
        'getting-started/cloudflare-setup',
        'getting-started/letsencrypt-setup',
        'getting-started/setup-wizard',
        'getting-started/first-deployment',
        'getting-started/viewing-deployments',
        // 'getting-started/manual-setup',
        // 'getting-started/local-development',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      link: {
        type: 'generated-index',
        description: 'Explore the powerful features of BFFless.',
      },
      items: [
        'features/traffic-splitting',
        'features/share-links',
        'features/proxy-rules',
        'features/authorization',
        'features/repository-overview',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      link: {
        type: 'generated-index',
        description: 'Deploy BFFless to production environments.',
      },
      items: [
        'deployment/overview',
        'deployment/digitalocean',
        'deployment/ssl-certificates',
        'deployment/github-actions',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      link: {
        type: 'generated-index',
        description: 'Configure BFFless for your needs.',
      },
      items: [
        'configuration/environment-variables',
        'configuration/storage-backends',
        'configuration/authentication',
      ],
    },
    {
      type: 'category',
      label: 'Storage',
      link: {
        type: 'generated-index',
        description: 'Configure storage backends for your deployments.',
      },
      items: [
        'storage/overview',
        'storage/aws-s3',
        'storage/google-cloud-storage',
        'storage/azure-blob-storage',
        'storage/minio',
        'storage/caching',
        'storage/migration-guide',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      link: {
        type: 'generated-index',
        description: 'Technical reference documentation.',
      },
      items: [
        'reference/api',
        'reference/architecture',
        'reference/database-schema',
        'reference/security',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;
