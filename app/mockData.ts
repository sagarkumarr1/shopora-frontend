export interface Product {
    id: string | number;
    title: string;
    price: number;
    originalPrice: number;
    discount: string;
    rating: number;
    reviews: number;
    description: string;
    image: string;
    specs: { [key: string]: string };
}

export const allProducts: Product[] = [
    {
        id: 101,
        title: "Apple iPhone 14 (128GB) - Midnight",
        price: 54999, originalPrice: 69900, discount: "21%",
        rating: 4.6, reviews: 3421,
        description: "Super Retina XDR display. Advanced camera system for better photos in any light. Cinematic mode now in 4K Dolby Vision up to 30 fps. Action mode for smooth, steady, handheld videos.",
        image: "https://images.unsplash.com/photo-1678685888221-c4e9c1851c8e?w=500&q=80",
        specs: { "Display": "6.1-inch Super Retina XDR", "Processor": "A15 Bionic chip", "Camera": "12MP + 12MP", "Battery": "Up to 20 hrs playback" }
    },
    {
        id: 102,
        title: "Samsung Galaxy S23 Ultra 5G",
        price: 89999, originalPrice: 124999, discount: "28%",
        rating: 4.7, reviews: 1205,
        description: "Experience the ultimate with the Galaxy S23 Ultra. Nightography camera, faster processor, and S Pen support.",
        image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&q=80",
        specs: { "Display": "6.8-inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 2", "Camera": "200MP + 10MP + 12MP", "Battery": "5000 mAh" }
    },
];
