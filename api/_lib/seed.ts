// Seed script — populates DB with test data
// Usage: node api/_lib/seed.js
// Run AFTER init-db.js

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const categories = [
  { name: 'Electrónica', slug: 'electronica' },
  { name: 'Ropa y Moda', slug: 'ropa-moda' },
  { name: 'Hogar y Jardín', slug: 'hogar-jardin' },
  { name: 'Deportes', slug: 'deportes' },
  { name: 'Libros', slug: 'libros' },
  { name: 'Juguetes', slug: 'juguetes' },
  { name: 'Belleza y Salud', slug: 'belleza-salud' },
  { name: 'Automóvil', slug: 'automovil' },
  { name: 'Mascotas', slug: 'mascotas' },
  { name: 'Alimentación', slug: 'alimentacion' },
];

const products = [
  // Electrónica (cat 1)
  {
    name: 'Smartphone Samsung Galaxy A54',
    description:
      'Pantalla 6.4" Super AMOLED, 128GB, cámara triple 50MP. Ideal para uso diario con batería de larga duración.',
    price: 329.99,
    stock: 45,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
  },
  {
    name: 'Laptop HP Pavilion 15',
    description:
      'Intel Core i5 12th Gen, 16GB RAM, SSD 512GB, pantalla 15.6" FHD. Perfecta para trabajo y estudios.',
    price: 699.99,
    stock: 20,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'],
  },
  {
    name: 'Auriculares Sony WH-1000XM5',
    description:
      'Cancelación de ruido líder en la industria, 30h de batería, audio de alta resolución. Para música sin distracciones.',
    price: 279.99,
    stock: 30,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
  },
  {
    name: 'Smart TV LG 55" 4K',
    description:
      'UHD 4K, webOS, HDR, compatible con Alexa y Google Assistant. Experiencia cinematográfica en casa.',
    price: 549.99,
    stock: 15,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600'],
  },
  {
    name: 'Tablet iPad Air 5ta Gen',
    description:
      'Chip M1, pantalla Liquid Retina 10.9", 256GB, compatible con Apple Pencil. Creatividad sin límites.',
    price: 749.99,
    stock: 25,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
  },
  {
    name: 'Cámara Canon EOS R50',
    description:
      'Mirrorless 24.2MP, video 4K, AF inteligente con detección de sujetos. Para fotógrafos apasionados.',
    price: 899.99,
    stock: 10,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600'],
  },
  // Ropa (cat 2)
  {
    name: 'Sudadera Nike Tech Fleece',
    description:
      'Material tech fleece ultra suave, capucha ajustable, bolsillos con cremallera. Estilo y confort en uno.',
    price: 89.99,
    stock: 60,
    category: 'ropa-moda',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'],
  },
  {
    name: "Jeans Levi's 501 Original",
    description:
      "El jean icónico de Levi's. Corte recto clásico, denim 100% algodón, durabilidad legendaria.",
    price: 59.99,
    stock: 80,
    category: 'ropa-moda',
    images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600'],
  },
  {
    name: 'Vestido Zara Floral Midi',
    description:
      'Diseño floral elegante, tela fluida, largo midi. Perfecto para ocasiones especiales o paseos de verano.',
    price: 45.99,
    stock: 35,
    category: 'ropa-moda',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600'],
  },
  {
    name: 'Chaqueta de Cuero Marrón',
    description:
      'Cuero genuino, forro interior, múltiples bolsillos. Un clásico atemporal que nunca pasa de moda.',
    price: 149.99,
    stock: 20,
    category: 'ropa-moda',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'],
  },
  {
    name: 'Camiseta Básica Pack x5',
    description:
      '5 camisetas de algodón peinado 100%, cuello redondo, varios colores. El básico que todo closet necesita.',
    price: 29.99,
    stock: 100,
    category: 'ropa-moda',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
  },
  // Hogar (cat 3)
  {
    name: 'Cafetera Nespresso Vertuo Pop',
    description:
      'Sistema Vertuo, reconocimiento de cápsulas por código de barras, 5 tamaños de taza, calentamiento en 30 segundos.',
    price: 119.99,
    stock: 40,
    category: 'hogar-jardin',
    images: ['https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600'],
  },
  {
    name: 'Aspiradora Robot iRobot Roomba',
    description:
      'Navegación inteligente, limpieza automática programable, compatible con Alexa. Tu casa siempre limpia.',
    price: 349.99,
    stock: 18,
    category: 'hogar-jardin',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  },
  {
    name: 'Juego de Sábanas 3 Piezas',
    description:
      'Microfibra 1800 hilos, suaves y frescas, resistentes a manchas. King, Queen o Full disponibles.',
    price: 34.99,
    stock: 50,
    category: 'hogar-jardin',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],
  },
  {
    name: 'Lámpara LED de Pie Design',
    description:
      'Luz regulable 3000K-6500K, mando a distancia, diseño nórdico minimalista. Ilumina con estilo.',
    price: 79.99,
    stock: 22,
    category: 'hogar-jardin',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a35fb3e0d?w=600'],
  },
  {
    name: 'Set de Cuchillos Chef 6 Piezas',
    description:
      'Acero inoxidable alemán, mangos ergonómicos, funda de bambú. Para chefs profesionales y amateurs.',
    price: 64.99,
    stock: 35,
    category: 'hogar-jardin',
    images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600'],
  },
  // Deportes (cat 4)
  {
    name: 'Running Shoes Nike Air Zoom',
    description:
      'Amortiguación Air Zoom, upper de malla transpirable, suela de goma de tracción. Para corredores serios.',
    price: 129.99,
    stock: 55,
    category: 'deportes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
  },
  {
    name: 'Esterilla Yoga Premium 6mm',
    description:
      'Material TPE ecológico, antideslizante, con líneas de alineación, incluye bolsa de transporte.',
    price: 29.99,
    stock: 70,
    category: 'deportes',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'],
  },
  {
    name: 'Mancuernas Hexagonales 10kg',
    description:
      'Par de mancuernas hexagonales recubiertas de goma, grip antideslizante. Entrenamiento en casa efectivo.',
    price: 44.99,
    stock: 30,
    category: 'deportes',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
  },
  {
    name: 'Bicicleta Estática Pro',
    description:
      'Resistencia magnética de 8 niveles, pantalla LCD, sillín ajustable, silenciosa. Cardio desde casa.',
    price: 399.99,
    stock: 8,
    category: 'deportes',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'],
  },
  {
    name: 'Cuerda de Saltar Speed Rope',
    description:
      'Cable de acero revestido, rodamientos de bola, mangos ergonómicos de aluminio. Para HIIT y boxeo.',
    price: 19.99,
    stock: 0,
    category: 'deportes',
    images: ['https://images.unsplash.com/photo-1434596922112-19c563067271?w=600'],
  },
  // Libros (cat 5)
  {
    name: 'Atomic Habits - James Clear',
    description:
      'El libro definitivo sobre cómo crear buenos hábitos y eliminar los malos. Más de 10 millones de copias vendidas.',
    price: 16.99,
    stock: 90,
    category: 'libros',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'],
  },
  {
    name: 'El Poder del Ahora - Eckhart Tolle',
    description:
      'Una guía para la iluminación espiritual. Aprende a vivir en el momento presente y transformar tu vida.',
    price: 13.99,
    stock: 75,
    category: 'libros',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'],
  },
  {
    name: 'Padre Rico Padre Pobre - Kiyosaki',
    description:
      'La educación financiera que no te enseñaron en la escuela. El libro de finanzas personales más vendido del mundo.',
    price: 14.99,
    stock: 60,
    category: 'libros',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'],
  },
  {
    name: 'Sapiens - Yuval Noah Harari',
    description:
      'Una breve historia de la humanidad. Desde los primeros humanos hasta la era digital. Revolucionario.',
    price: 18.99,
    stock: 45,
    category: 'libros',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600'],
  },
  {
    name: 'Don Quijote de la Mancha',
    description:
      'La obra cumbre de la literatura en español de Miguel de Cervantes. Edición especial con ilustraciones.',
    price: 22.99,
    stock: 30,
    category: 'libros',
    images: ['https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600'],
  },
  // Juguetes (cat 6)
  {
    name: 'LEGO Star Wars Millennium Falcon',
    description:
      '7541 piezas, set coleccionable para adultos y jóvenes. El barco de naves más icónico del universo.',
    price: 849.99,
    stock: 5,
    category: 'juguetes',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'],
  },
  {
    name: 'Muñeca Barbie Profesional',
    description:
      'Doctora, astronauta, chef o presidenta — más de 20 carreras disponibles. Inspira a las niñas del futuro.',
    price: 24.99,
    stock: 65,
    category: 'juguetes',
    images: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600'],
  },
  {
    name: 'Drone DJI Mini 3 Con Cámara',
    description:
      'Grabación 4K/60fps, estabilización de 3 ejes, 38 min de vuelo, peso <249g sin registro necesario.',
    price: 499.99,
    stock: 12,
    category: 'juguetes',
    images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600'],
  },
  // Belleza (cat 7)
  {
    name: 'Sérum Vitamina C 30ml',
    description:
      'Concentración 20% vitamina C, ácido hialurónico, vitamina E. Ilumina y unifica el tono de tu piel.',
    price: 32.99,
    stock: 55,
    category: 'belleza-salud',
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600'],
  },
  {
    name: 'Perfume Chanel N°5 EDP 100ml',
    description:
      'La fragancia icónica de Chanel. Floral aldehídico atemporal con notas de ylang-ylang y jazmín.',
    price: 189.99,
    stock: 20,
    category: 'belleza-salud',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=600'],
  },
  {
    name: 'Secador de Pelo Dyson Supersonic',
    description:
      'Motor digital Dyson, secado rápido sin daño térmico, 3 velocidades, 4 temperaturas. El mejor del mercado.',
    price: 429.99,
    stock: 15,
    category: 'belleza-salud',
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
  },
  // Automóvil (cat 8)
  {
    name: 'Aspiradora Portátil para Auto',
    description:
      '12V, 7000Pa de succión, 4.8m de cable, múltiples accesorios. Limpieza profunda en movimiento.',
    price: 39.99,
    stock: 40,
    category: 'automovil',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  },
  {
    name: 'Cámara Dashcam 4K Ultra HD',
    description:
      'Grabación 4K frontal + 1080p trasera, visión nocturna, GPS integrado, modo parking automático.',
    price: 149.99,
    stock: 25,
    category: 'automovil',
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'],
  },
  {
    name: 'Soporte Magnético Celular Auto',
    description:
      'Montaje para ventilación o parabrisas, compatible con todos los smartphones, agarre ultra fuerte.',
    price: 18.99,
    stock: 85,
    category: 'automovil',
    images: ['https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600'],
  },
  // Mascotas (cat 9)
  {
    name: 'Cama Ortopédica para Perro L',
    description:
      'Espuma memory foam, funda lavable, antideslizante. Ideal para razas grandes con problemas articulares.',
    price: 59.99,
    stock: 30,
    category: 'mascotas',
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600'],
  },
  {
    name: 'Kit Rascador para Gato',
    description:
      'Torre de 3 niveles, sisal natural, plataformas y tobogán. Tu gato tendrá su propio rascacielos.',
    price: 79.99,
    stock: 20,
    category: 'mascotas',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600'],
  },
  {
    name: 'Alimento Royal Canin Medium 15kg',
    description:
      'Nutrición adaptada para perros medianos, croquetas de tamaño óptimo, mezcla de proteínas de alta calidad.',
    price: 64.99,
    stock: 40,
    category: 'mascotas',
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600'],
  },
  // Alimentación (cat 10)
  {
    name: 'Kit Café Specialty Colombia 1kg',
    description:
      'Café de origen único del Huila, Colombia. Notas de caramelo, manzana verde y chocolate. Molido o en grano.',
    price: 28.99,
    stock: 70,
    category: 'alimentacion',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'],
  },
  {
    name: 'Aceite de Oliva Extra Virgen 1L',
    description:
      'Primera prensada en frío, DOP Jaén, polifenoles naturales. El mejor AOVE para cocina mediterránea.',
    price: 19.99,
    stock: 55,
    category: 'alimentacion',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
  },
  {
    name: 'Pack Snacks Saludables x12',
    description:
      '12 unidades de mezcla de frutos secos y semillas, sin azúcar añadida, sin conservantes. Energía natural.',
    price: 24.99,
    stock: 80,
    category: 'alimentacion',
    images: ['https://images.unsplash.com/photo-1548940740-204726a19be3?w=600'],
  },
  {
    name: 'Chocolate Valrhona 70% 5kg',
    description:
      'Chocolate negro premium de la marca favorita de los pasteleros. Cobertura de alto contenido en cacao.',
    price: 89.99,
    stock: 15,
    category: 'alimentacion',
    images: ['https://images.unsplash.com/photo-1511381939415-e44f5e01b4b5?w=600'],
  },
  // More electronics
  {
    name: 'Smartwatch Apple Watch SE 2',
    description:
      'GPS, monitor cardíaco, detección de choque, altímetro. El compañero inteligente de tu estilo de vida activo.',
    price: 249.99,
    stock: 35,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600'],
  },
  {
    name: 'Teclado Mecánico RGB Keychron K2',
    description:
      'Switches Gateron, retroiluminación RGB, layout TKL, compatible Mac/Windows. Para developers exigentes.',
    price: 89.99,
    stock: 28,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'],
  },
  {
    name: 'Monitor Dell 27" 4K UHD',
    description:
      'Panel IPS 4K 60Hz, 99% sRGB, entrada HDMI/DisplayPort, altura ajustable. Productividad y diseño.',
    price: 449.99,
    stock: 12,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'],
  },
  {
    name: 'Altavoz JBL Charge 5',
    description:
      'IP67 resistente al agua, 20h batería, sonido 360°, powerbank integrado para cargar tu móvil.',
    price: 169.99,
    stock: 42,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
  },
  {
    name: 'Consola Nintendo Switch OLED',
    description:
      'Pantalla OLED 7", 64GB, modo portátil/sobremesa/tablón. El sistema de juego más versátil del mercado.',
    price: 349.99,
    stock: 22,
    category: 'electronica',
    images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600'],
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data (order matters due to FK constraints)
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM carts');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');

    // Reset sequences
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

    // Seed users
    const adminHash = await bcrypt.hash('Admin1234!', 12);
    const clienteHash = await bcrypt.hash('Cliente1234!', 12);

    await client.query(
      `INSERT INTO users (name, email, password_hash, roles) VALUES ($1, $2, $3, $4)`,
      [
        'Admin ShopFlow',
        'admin@shopflow.com',
        adminHash,
        JSON.stringify(['ROLE_USER', 'ROLE_ADMIN']),
      ],
    );
    await client.query(
      `INSERT INTO users (name, email, password_hash, roles) VALUES ($1, $2, $3, $4)`,
      ['Cliente Demo', 'cliente@shopflow.com', clienteHash, JSON.stringify(['ROLE_USER'])],
    );
    console.log('✅ Users seeded (admin@shopflow.com, cliente@shopflow.com)');

    // Seed categories
    const catMap = {};
    for (const cat of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`,
        [cat.name, cat.slug],
      );
      catMap[cat.slug] = result.rows[0].id;
    }
    console.log(`✅ ${categories.length} categories seeded`);

    // Seed products
    for (const product of products) {
      const categoryId = catMap[product.category];
      await client.query(
        `INSERT INTO products (name, description, price, stock, images, category_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          JSON.stringify(product.images),
          categoryId,
        ],
      );
    }
    console.log(`✅ ${products.length} products seeded`);

    await client.query('COMMIT');
    console.log('🎉 Database seeded successfully!');
    console.log('   Admin: admin@shopflow.com / Admin1234!');
    console.log('   User:  cliente@shopflow.com / Cliente1234!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
