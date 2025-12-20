import { MetadataRoute } from 'next';
import productService from '@/services/productService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://shopora.com'; // Replace with actual domain

    // Get all products
    let products = [];
    try {
        const res = await productService.getProducts({});
        products = res.data;
    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    const productUrls = products.map((product: any) => ({
        url: `${baseUrl}/product/${product.slug || product._id}`,
        lastModified: new Date(product.updatedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/return-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...productUrls,
    ];
}
