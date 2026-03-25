<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Product;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    public function load(ObjectManager $manager): void
    {
        // ── Users ──────────────────────────────────────────────
        $admin = (new User())
            ->setName('Admin ShopFlow')
            ->setEmail('admin@shopflow.com')
            ->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
        $admin->setPasswordHash($this->hasher->hashPassword($admin, 'Admin1234!'));
        $manager->persist($admin);

        $cliente = (new User())
            ->setName('Cliente Demo')
            ->setEmail('cliente@shopflow.com')
            ->setRoles(['ROLE_USER']);
        $cliente->setPasswordHash($this->hasher->hashPassword($cliente, 'Cliente1234!'));
        $manager->persist($cliente);

        // ── Categories ─────────────────────────────────────────
        $cats = [
            'electronica'   => 'Electrónica',
            'ropa-moda'     => 'Ropa y Moda',
            'hogar-jardin'  => 'Hogar y Jardín',
            'deportes'      => 'Deportes',
            'libros'        => 'Libros',
            'juguetes'      => 'Juguetes',
            'belleza-salud' => 'Belleza y Salud',
            'automovil'     => 'Automóvil',
            'mascotas'      => 'Mascotas',
            'alimentacion'  => 'Alimentación',
        ];

        /** @var Category[] $catMap */
        $catMap = [];
        foreach ($cats as $slug => $name) {
            $cat = (new Category())->setName($name)->setSlug($slug);
            $manager->persist($cat);
            $catMap[$slug] = $cat;
        }

        // ── Products ───────────────────────────────────────────
        $products = [
            ['Smartphone Samsung Galaxy A54',     'Pantalla 6.4" Super AMOLED, 128GB, cámara triple 50MP.',        329.99, 45,  'electronica',   ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600']],
            ['Laptop HP Pavilion 15',              'Intel Core i5 12th Gen, 16GB RAM, SSD 512GB, 15.6" FHD.',       699.99, 20,  'electronica',   ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600']],
            ['Auriculares Sony WH-1000XM5',        'Cancelación de ruido, 30h batería, audio alta resolución.',     279.99, 30,  'electronica',   ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600']],
            ['Smart TV LG 55" 4K',                 'UHD 4K, webOS, HDR, Alexa y Google Assistant.',                549.99, 15,  'electronica',   ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600']],
            ['Tablet iPad Air 5ta Gen',            'Chip M1, Liquid Retina 10.9", 256GB, Apple Pencil.',            749.99, 25,  'electronica',   ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600']],
            ['Cámara Canon EOS R50',               'Mirrorless 24.2MP, video 4K, AF inteligente.',                 899.99, 10,  'electronica',   ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600']],
            ['Smartwatch Apple Watch SE 2',        'GPS, monitor cardíaco, detección de choque.',                   249.99, 35,  'electronica',   ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600']],
            ['Teclado Mecánico RGB Keychron K2',   'Switches Gateron, RGB, TKL, Mac/Windows.',                      89.99, 28,  'electronica',   ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600']],
            ['Monitor Dell 27" 4K UHD',            'Panel IPS 4K 60Hz, 99% sRGB, HDMI/DisplayPort.',               449.99, 12,  'electronica',   ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600']],
            ['Altavoz JBL Charge 5',               'IP67, 20h batería, sonido 360°, powerbank integrado.',         169.99, 42,  'electronica',   ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600']],
            ['Consola Nintendo Switch OLED',       'Pantalla OLED 7", 64GB, modo portátil/sobremesa.',             349.99, 22,  'electronica',   ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600']],
            ['Sudadera Nike Tech Fleece',          'Tech fleece ultra suave, capucha ajustable.',                    89.99, 60,  'ropa-moda',     ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600']],
            ["Jeans Levi's 501 Original",          'El jean icónico, corte recto, denim 100% algodón.',              59.99, 80,  'ropa-moda',     ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600']],
            ['Vestido Zara Floral Midi',            'Diseño floral, tela fluida, largo midi.',                       45.99, 35,  'ropa-moda',     ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600']],
            ['Chaqueta de Cuero Marrón',           'Cuero genuino, forro interior, múltiples bolsillos.',          149.99, 20,  'ropa-moda',     ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600']],
            ['Camiseta Básica Pack x5',            '5 camisetas algodón peinado 100%, cuello redondo.',              29.99, 100, 'ropa-moda',     ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600']],
            ['Cafetera Nespresso Vertuo Pop',      'Sistema Vertuo, 5 tamaños de taza, calentamiento 30s.',        119.99, 40,  'hogar-jardin',  ['https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600']],
            ['Aspiradora Robot iRobot Roomba',     'Navegación inteligente, programable, Alexa.',                  349.99, 18,  'hogar-jardin',  ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']],
            ['Juego de Sábanas 3 Piezas',          'Microfibra 1800 hilos, suaves, resistentes a manchas.',         34.99, 50,  'hogar-jardin',  ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600']],
            ['Lámpara LED de Pie Design',          'Luz regulable 3000K-6500K, mando a distancia, nórdico.',        79.99, 22,  'hogar-jardin',  ['https://images.unsplash.com/photo-1513506003901-1e6a35fb3e0d?w=600']],
            ['Set de Cuchillos Chef 6 Piezas',     'Acero inoxidable alemán, mangos ergonómicos.',                  64.99, 35,  'hogar-jardin',  ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600']],
            ['Running Shoes Nike Air Zoom',         'Air Zoom, malla transpirable, suela goma tracción.',           129.99, 55,  'deportes',      ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600']],
            ['Esterilla Yoga Premium 6mm',         'TPE ecológico, antideslizante, líneas de alineación.',          29.99, 70,  'deportes',      ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600']],
            ['Mancuernas Hexagonales 10kg',        'Par recubiertas de goma, grip antideslizante.',                 44.99, 30,  'deportes',      ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600']],
            ['Bicicleta Estática Pro',             'Resistencia magnética 8 niveles, LCD, silenciosa.',            399.99,  8,  'deportes',      ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600']],
            ['Cuerda de Saltar Speed Rope',        'Cable acero revestido, rodamientos de bola, aluminio.',         19.99,  0,  'deportes',      ['https://images.unsplash.com/photo-1434596922112-19c563067271?w=600']],
            ['Atomic Habits - James Clear',        'El libro definitivo sobre hábitos. +10M copias vendidas.',      16.99, 90,  'libros',        ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600']],
            ['El Poder del Ahora - Eckhart Tolle', 'Guía para la iluminación espiritual.',                          13.99, 75,  'libros',        ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600']],
            ['Padre Rico Padre Pobre - Kiyosaki',  'Educación financiera que no enseñan en la escuela.',            14.99, 60,  'libros',        ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600']],
            ['Sapiens - Yuval Noah Harari',        'Una breve historia de la humanidad.',                           18.99, 45,  'libros',        ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600']],
            ['Don Quijote de la Mancha',           'La obra cumbre de Cervantes. Edición especial.',                22.99, 30,  'libros',        ['https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600']],
            ['LEGO Star Wars Millennium Falcon',   '7541 piezas, set coleccionable para adultos.',                 849.99,  5,  'juguetes',      ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600']],
            ['Muñeca Barbie Profesional',          'Doctora, astronauta, chef — +20 carreras.',                     24.99, 65,  'juguetes',      ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600']],
            ['Drone DJI Mini 3 Con Cámara',        '4K/60fps, estabilización 3 ejes, 38 min vuelo.',               499.99, 12,  'juguetes',      ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600']],
            ['Sérum Vitamina C 30ml',              '20% vitamina C, ácido hialurónico, vitamina E.',                32.99, 55,  'belleza-salud', ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600']],
            ['Perfume Chanel N°5 EDP 100ml',       'La fragancia icónica. Floral aldehídico atemporal.',           189.99, 20,  'belleza-salud', ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=600']],
            ['Secador de Pelo Dyson Supersonic',   'Motor digital Dyson, secado rápido sin daño térmico.',         429.99, 15,  'belleza-salud', ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600']],
            ['Aspiradora Portátil para Auto',      '12V, 7000Pa succión, 4.8m cable, accesorios.',                  39.99, 40,  'automovil',     ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']],
            ['Cámara Dashcam 4K Ultra HD',         '4K frontal + 1080p trasera, visión nocturna, GPS.',            149.99, 25,  'automovil',     ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600']],
            ['Soporte Magnético Celular Auto',     'Ventilación o parabrisas, compatible todos smartphones.',       18.99, 85,  'automovil',     ['https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600']],
            ['Cama Ortopédica para Perro L',       'Memory foam, funda lavable, antideslizante.',                   59.99, 30,  'mascotas',      ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600']],
            ['Kit Rascador para Gato',             'Torre 3 niveles, sisal natural, plataformas.',                  79.99, 20,  'mascotas',      ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600']],
            ['Alimento Royal Canin Medium 15kg',   'Nutrición perros medianos, proteínas alta calidad.',            64.99, 40,  'mascotas',      ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600']],
            ['Kit Café Specialty Colombia 1kg',    'Origen único Huila. Notas caramelo, manzana, chocolate.',       28.99, 70,  'alimentacion',  ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600']],
            ['Aceite de Oliva Extra Virgen 1L',    'Primera prensada frío, DOP Jaén, polifenoles.',                 19.99, 55,  'alimentacion',  ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600']],
            ['Pack Snacks Saludables x12',         '12 uds frutos secos y semillas, sin azúcar añadida.',           24.99, 80,  'alimentacion',  ['https://images.unsplash.com/photo-1548940740-204726a19be3?w=600']],
            ['Chocolate Valrhona 70% 5kg',         'Negro premium, favorito de pasteleros. 70% cacao.',             89.99, 15,  'alimentacion',  ['https://images.unsplash.com/photo-1511381939415-e44f5e01b4b5?w=600']],
        ];

        foreach ($products as [$name, $desc, $price, $stock, $catSlug, $images]) {
            $p = (new Product())
                ->setName($name)
                ->setDescription($desc)
                ->setPrice((float) $price)
                ->setStock((int) $stock)
                ->setImages($images)
                ->setCategory($catMap[$catSlug]);
            $manager->persist($p);
        }

        $manager->flush();
        echo '✅ Fixtures: 2 usuarios, 10 categorías, ' . count($products) . " productos\n";
    }
}
