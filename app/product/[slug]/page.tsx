import { Metadata } from 'next';
import ProductClientView from '@/components/ProductClientView';
import { notFound } from 'next/navigation';
import productService from '@/services/productService';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
    try {
        const response = await productService.getProductById(slug);
        return response.data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const description = product.description || 'No description available';
    const image = product.image || '/placeholder.png';

    return {
        title: product.title,
        description: description.substring(0, 160),
        openGraph: {
            title: product.title,
            description: description,
            images: [image],
            type: 'article',
        },
    };
}

export default async function ProductDetail({ params }: Props) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    if (!product) {
        notFound();
    }

    const description = product.description || 'No description available';
    const image = product.image || '/placeholder.png';

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: image,
        description: description,
        sku: product._id, // API returns _id
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 0,
            reviewCount: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : 0),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductClientView product={product} />
        </>
    );
}

