import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/account/'],
        },
        sitemap: 'https://shopora.com/sitemap.xml', // Replace with actual domain
    };
}
