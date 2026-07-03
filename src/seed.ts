import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model';
import { VendorProfile } from './models/vendorProfile.model';
import { Category } from './models/category.model';
import { Product } from './models/product.model';
import { Cart } from './models/cart.model';
import { Order } from './models/order.model';
import { Review } from './models/review.model';
import { hashPassword } from './utils/password';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/marketplace';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // ─── Clean existing data ───────────────────────────────────────────
    await Promise.all([
        User.deleteMany({}),
        VendorProfile.deleteMany({}),
        Category.deleteMany({}),
        Product.deleteMany({}),
        Cart.deleteMany({}),
        Order.deleteMany({}),
        Review.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ─── Categories ────────────────────────────────────────────────────
    const categories = await Category.insertMany([
        { name: 'Electronics', slug: 'electronics', parentCategory: null },
        { name: 'Clothing', slug: 'clothing', parentCategory: null },
        { name: 'Books', slug: 'books', parentCategory: null },
        { name: 'Home & Kitchen', slug: 'home-kitchen', parentCategory: null },
        { name: 'Sports', slug: 'sports', parentCategory: null },
    ]);
    console.log('Categories seeded');

    const electronicsId = categories[0]._id;
    const sportsId = categories[4]._id;

    // ─── Users ─────────────────────────────────────────────────────────
    const passwordHash = await hashPassword('TestPass123');

    const [_admin, customer1, customer2, vendorUser] = await User.insertMany([{
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin',
        isActive: true,
    },
    {
        name: 'Ram Sharma',
        email: 'ram@example.com',
        passwordHash,
        role: 'customer',
        isActive: true,
    },
    {
        name: 'Sita Thapa',
        email: 'sita@example.com',
        passwordHash,
        role: 'customer',
        isActive: true,
    },
    {
        name: 'Bikash Vendor',
        email: 'bikash@example.com',
        passwordHash,
        role: 'vendor',
        isActive: true,
    },
    ]);
    console.log('Users seeded');

    // ─── Vendor Profile ────────────────────────────────────────────────
    const vendorProfile = await VendorProfile.create({
        userId: vendorUser._id,
        storeName: 'Bikash Electronics',
        storeDescription: 'Quality electronics at best prices in Nepal',
        approvalStatus: 'approved',
    });
    console.log('Vendor profile seeded');

    // ─── Products ──────────────────────────────────────────────────────
    const products = await Product.insertMany([
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'iPhone 15 Pro',
            slug: 'iphone-15-pro',
            description: 'Latest Apple iPhone with A17 Pro chip, titanium design, and advanced camera system. Experience the most powerful iPhone ever made.',
            price: 159999,
            stock: 25,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'Samsung Galaxy S24',
            slug: 'samsung-galaxy-s24',
            description: 'Flagship Android phone with AI features, stunning display and long battery life. The future of mobile photography.',
            price: 119999,
            stock: 30,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'Sony WH-1000XM5 Headphones',
            slug: 'sony-wh-1000xm5',
            description: 'Industry leading noise cancelling wireless headphones with 30 hour battery life and premium sound quality.',
            price: 34999,
            stock: 50,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'MacBook Air M2',
            slug: 'macbook-air-m2',
            description: 'Supercharged by M2 chip, incredibly thin design with all day battery life. The worlds best consumer laptop.',
            price: 189999,
            stock: 15,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'iPad Pro 12.9',
            slug: 'ipad-pro-12-9',
            description: 'The ultimate iPad experience with M2 chip, Liquid Retina XDR display and Apple Pencil support.',
            price: 139999,
            stock: 20,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: sportsId,
            name: 'Nike Running Shoes',
            slug: 'nike-running-shoes',
            description: 'Lightweight and comfortable running shoes with responsive cushioning for maximum performance.',
            price: 8999,
            stock: 100,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: sportsId,
            name: 'Yoga Mat Premium',
            slug: 'yoga-mat-premium',
            description: 'Extra thick non-slip yoga mat with carrying strap. Perfect for yoga, pilates and floor exercises.',
            price: 2499,
            stock: 75,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
        {
            vendorId: vendorProfile._id,
            categoryId: electronicsId,
            name: 'Apple Watch Series 9',
            slug: 'apple-watch-series-9',
            description: 'The most powerful Apple Watch with advanced health sensors, crash detection and all day battery.',
            price: 59999,
            stock: 40,
            images: ['/uploads/products/placeholder.png'],
            status: 'active',
            averageRating: 0,
            reviewCount: 0,
        },
    ]);
    console.log('Products seeded');

    // ─── Orders ────────────────────────────────────────────────────────
    const order1 = await Order.create({
        customerId: customer1._id,
        items: [
            {
                productId: products[0]._id,
                vendorId: vendorProfile._id,
                name: products[0].name,
                price: products[0].price,
                quantity: 1,
                itemStatus: 'delivered',
            },
            {
                productId: products[2]._id,
                vendorId: vendorProfile._id,
                name: products[2].name,
                price: products[2].price,
                quantity: 2,
                itemStatus: 'shipped',
            },
        ],
        shippingAddress: {
            fullName: 'Ram Sharma',
            phone: '9801234567',
            addressLine1: 'Thamel Marg',
            city: 'Kathmandu',
            postalCode: '44600',
            country: 'Nepal',
        },
        totalAmount: products[0].price + products[2].price * 2,
        paymentStatus: 'paid',
        paymentMethod: 'cash_on_delivery',
    });

    const order2 = await Order.create({
        customerId: customer2._id,
        items: [
            {
                productId: products[1]._id,
                vendorId: vendorProfile._id,
                name: products[1].name,
                price: products[1].price,
                quantity: 1,
                itemStatus: 'delivered',
            },
        ],
        shippingAddress: {
            fullName: 'Sita Thapa',
            phone: '9807654321',
            addressLine1: 'Lazimpat Road',
            city: 'Kathmandu',
            postalCode: '44600',
            country: 'Nepal',
        },
        totalAmount: products[1].price,
        paymentStatus: 'paid',
        paymentMethod: 'esewa',
    });

    await Order.create({
        customerId: customer1._id,
        items: [
            {
                productId: products[3]._id,
                vendorId: vendorProfile._id,
                name: products[3].name,
                price: products[3].price,
                quantity: 1,
                itemStatus: 'pending',
            },
        ],
        shippingAddress: {
            fullName: 'Ram Sharma',
            phone: '9801234567',
            addressLine1: 'Thamel Marg',
            city: 'Kathmandu',
            postalCode: '44600',
            country: 'Nepal',
        },
        totalAmount: products[3].price,
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery',
    });

    console.log('Orders seeded');

    // ─── Reviews ───────────────────────────────────────────────────────
    await Review.create({
        productId: products[0]._id,
        customerId: customer1._id,
        orderId: order1._id,
        rating: 5,
        comment: 'Amazing phone, very fast and the camera quality is outstanding. Worth every penny!',
    });

    await Review.create({
        productId: products[1]._id,
        customerId: customer2._id,
        orderId: order2._id,
        rating: 4,
        comment: 'Great phone with excellent AI features. Battery life could be better but overall very satisfied.',
    });

    // Update product ratings after creating reviews
    await Product.findByIdAndUpdate(products[0]._id, {
        averageRating: 5,
        reviewCount: 1,
    });

    await Product.findByIdAndUpdate(products[1]._id, {
        averageRating: 4,
        reviewCount: 1,
    });

    console.log('Reviews seeded');

    // ─── Summary ───────────────────────────────────────────────────────
    console.log('\n✅ Seeding complete!\n');
    console.log('─────────────────────────────────────');
    console.log('Test accounts (all passwords: TestPass123)');
    console.log('─────────────────────────────────────');
    console.log(`Admin:    admin@example.com`);
    console.log(`Customer: ram@example.com`);
    console.log(`Customer: sita@example.com`);
    console.log(`Vendor:   bikash@example.com`);
    console.log('─────────────────────────────────────');
    console.log(`Categories: ${categories.length}`);
    console.log(`Products:   ${products.length}`);
    console.log(`Orders:     3`);
    console.log(`Reviews:    2`);
    console.log('─────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});