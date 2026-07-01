import { cartRepository } from '@repositories/cart.repository';
import { productRepository } from '@repositories/product.repository';
import { ApiError } from '@utils/ApiError';
import { ICart } from '@models/cart.model';
import { IProduct } from '@models/product.model';

interface CartItemWithProduct {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        stock: number;
    };
    quantity: number;
    subtotal: number;
}

interface CartSummary {
    items: CartItemWithProduct[];
    totalItems: number;
    totalAmount: number;
}

function buildCartSummary(cart: ICart): CartSummary {
    let totalAmount = 0;
    let totalItems = 0;

    const items: CartItemWithProduct[] = [];

    for (const item of cart.items) {
        const product = item.productId as unknown as IProduct;
        if (!product || product.status !== 'active') continue;
        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        totalItems += item.quantity;

        items.push({
            product: {
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                image: product.images[0],
                stock: product.stock,
            },
            quantity: item.quantity,
            subtotal,
        });
    }

    return { items, totalItems, totalAmount };
}

export const cartService = {
    async getCart(userId: string): Promise<CartSummary> {
        await cartRepository.upsert(userId);

        const cart = await cartRepository.findByUserIdWithProducts(userId);
        if (!cart) throw ApiError.notFound('Cart not found');

        return buildCartSummary(cart);
    },

    async addItem(userId: string, productId: string, quantity: number): Promise<CartSummary> {
        const product = await productRepository.findById(productId);
        if (!product) throw ApiError.notFound('Product not found');
        if (product.status !== 'active') {
            throw ApiError.badRequest('This product is not available');
        }
        if (product.stock < quantity) {
            throw ApiError.badRequest(
                `Only ${product.stock} units available in stock`
            );
        }

        await cartRepository.addOrUpdateItem(userId, productId, quantity);

        const cart = await cartRepository.findByUserIdWithProducts(userId);
        if (!cart) throw ApiError.notFound('Cart not found');
        return buildCartSummary(cart);
    },

    async updateItem(
        userId: string,
        productId: string,
        quantity: number
    ): Promise<CartSummary> {
        const product = await productRepository.findById(productId);
        if (!product) throw ApiError.notFound('Product not found');
        if (product.stock < quantity) {
            throw ApiError.badRequest(
                `Only ${product.stock} units available in stock`
            );
        }

        const cart = await cartRepository.findByUserId(userId);
        if (!cart) throw ApiError.notFound('Cart not found');

        const itemExists = cart.items.some(
            (item) => item.productId.toString() === productId
        );
        if (!itemExists) {
            throw ApiError.notFound('Item not found in cart');
        }

        await cartRepository.addOrUpdateItem(userId, productId, quantity);

        const updatedCart = await cartRepository.findByUserIdWithProducts(userId);
        if (!updatedCart) throw ApiError.notFound('Cart not found');
        return buildCartSummary(updatedCart);
    },

    async removeItem(userId: string, productId: string): Promise<CartSummary> {
        const cart = await cartRepository.findByUserId(userId);
        if (!cart) throw ApiError.notFound('Cart not found');

        const itemExists = cart.items.some(
            (item) => item.productId.toString() === productId
        );
        if (!itemExists) {
            throw ApiError.notFound('Item not found in cart');
        }

        await cartRepository.removeItem(userId, productId);

        const updatedCart = await cartRepository.findByUserIdWithProducts(userId);
        if (!updatedCart) throw ApiError.notFound('Cart not found');
        return buildCartSummary(updatedCart);
    },

    async clearCart(userId: string): Promise<void> {
        await cartRepository.clearCart(userId);
    },
};