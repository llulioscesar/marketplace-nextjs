import {prisma} from '../src/lib/db';
import bcrypt from 'bcryptjs';
import {UserRole} from "@prisma/client";

async function main() {
    console.log('🌱 Starting seed...');

    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Bussiner users
    const business1 = await prisma.user.create({
        data: {
            email: 'business1@test.com',
            password: hashedPassword,
            name: 'Business 1',
            role: UserRole.BUSINESS,
        }
    });

    const business2 = await prisma.user.create({
        data: {
            email: 'business2@test.com',
            password: hashedPassword,
            name: 'Business 2',
            role: UserRole.BUSINESS,
        }
    });

    const customer1 = await prisma.user.create({
        data: {
            email: 'customer1@test.com',
            password: hashedPassword,
            name: 'Customer 1',
            role: UserRole.CUSTOMER,
        }
    });

    const customer2 = await prisma.user.create({
        data: {
            email: 'customer2@test.com',
            password: hashedPassword,
            name: 'Customer 2',
            role: UserRole.CUSTOMER,
        }
    });

    const store1 = await prisma.store.create({
        data: {
            name: 'Electrónica Digital',
            description: 'Todo en tecnología y gadgets',
            slug: 'electronica-digital',
            imageUrl: 'https://picsum.photos/seed/store1/400/300',
            businessId: business1.id,
            products: {
                create: [
                    {
                        name: 'Laptop Gaming Pro',
                        description: 'Laptop de alta gama para gaming',
                        price: 1299.99,
                        stock: 10,
                        imageUrl: 'https://picsum.photos/seed/laptop/400/300',
                    },
                    {
                        name: 'Mouse Inalámbrico RGB',
                        description: 'Mouse gaming con iluminación RGB',
                        price: 59.99,
                        stock: 25,
                        imageUrl: 'https://picsum.photos/seed/mouse/400/300',
                    },
                    {
                        name: 'Teclado Mecánico',
                        description: 'Teclado mecánico con switches blue',
                        price: 89.99,
                        stock: 15,
                        imageUrl: 'https://picsum.photos/seed/keyboard/400/300',
                    },
                    {
                        name: 'Monitor 4K 27"',
                        description: 'Monitor UHD para diseño y gaming',
                        price: 449.99,
                        stock: 8,
                        imageUrl: 'https://picsum.photos/seed/monitor/400/300',
                    },
                ],
            },
        },
        include: {
            products: true,
        },
    });

    const store2 = await prisma.store.create({
        data: {
            name: 'Audio Premium',
            description: 'Especialistas en audio de alta calidad',
            slug: 'audio-premium',
            imageUrl: 'https://picsum.photos/seed/store2/400/300',
            businessId: business1.id,
            products: {
                create: [
                    {
                        name: 'Auriculares Bluetooth Pro',
                        description: 'Auriculares con cancelación de ruido',
                        price: 199.99,
                        stock: 20,
                        imageUrl: 'https://picsum.photos/seed/headphones/400/300',
                    },
                    {
                        name: 'Altavoz Portátil',
                        description: 'Altavoz Bluetooth resistente al agua',
                        price: 79.99,
                        stock: 30,
                        imageUrl: 'https://picsum.photos/seed/speaker/400/300',
                    },
                ],
            },
        },
        include: {
            products: true,
        },
    });

    const store3 = await prisma.store.create({
        data: {
            name: 'Moda Urbana',
            description: 'Ropa y accesorios de última tendencia',
            slug: 'moda-urbana',
            imageUrl: 'https://picsum.photos/seed/store3/400/300',
            businessId: business2.id,
            products: {
                create: [
                    {
                        name: 'Camiseta Premium',
                        description: 'Camiseta de algodón orgánico',
                        price: 29.99,
                        stock: 50,
                        imageUrl: 'https://picsum.photos/seed/tshirt/400/300',
                    },
                    {
                        name: 'Jeans Slim Fit',
                        description: 'Jeans de corte moderno',
                        price: 79.99,
                        stock: 35,
                        imageUrl: 'https://picsum.photos/seed/jeans/400/300',
                    },
                    {
                        name: 'Zapatillas Deportivas',
                        description: 'Zapatillas cómodas para el día a día',
                        price: 89.99,
                        stock: 25,
                        imageUrl: 'https://picsum.photos/seed/shoes/400/300',
                    },
                ],
            },
        },
        include: {
            products: true,
        },
    });

    const store4 = await prisma.store.create({
        data: {
            name: 'Librería Cultura',
            description: 'Libros, papelería y más',
            slug: 'libreria-cultura',
            imageUrl: 'https://picsum.photos/seed/store4/400/300',
            businessId: business2.id,
            products: {
                create: [
                    {
                        name: 'Pack Best Sellers 2024',
                        description: 'Los 5 libros más vendidos del año',
                        price: 59.99,
                        stock: 15,
                        imageUrl: 'https://picsum.photos/seed/books/400/300',
                    },
                    {
                        name: 'Agenda 2025',
                        description: 'Agenda anual con diseño minimalista',
                        price: 19.99,
                        stock: 40,
                        imageUrl: 'https://picsum.photos/seed/agenda/400/300',
                    },
                    {
                        name: 'Set de Plumas Premium',
                        description: 'Set de 3 plumas de lujo',
                        price: 34.99,
                        stock: 20,
                        imageUrl: 'https://picsum.photos/seed/pens/400/300',
                    },
                ],
            },
        },
        include: {
            products: true,
        },
    });

    console.log('✅ Seed completed successfully!');
    console.log('\n📧 Test accounts created:');
    console.log('Business accounts:');
    console.log('  - Email: business1@test.com | Password: password123');
    console.log('  - Email: business2@test.com | Password: password123');
    console.log('Customer accounts:');
    console.log('  - Email: customer1@test.com | Password: password123');
    console.log('  - Email: customer2@test.com | Password: password123');
    console.log('\n🏪 Stores created:');
    console.log(`  - ${store1.name} (${store1.products.length} products)`);
    console.log(`  - ${store2.name} (${store2.products.length} products)`);
    console.log(`  - ${store3.name} (${store3.products.length} products)`);
    console.log(`  - ${store4.name} (${store4.products.length} products)`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });