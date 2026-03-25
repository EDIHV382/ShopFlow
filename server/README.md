# ShopFlow — Servidor Symfony 6

Backend alternativo del proyecto ShopFlow implementado en **PHP 8 + Symfony 6**, con los mismos endpoints que la API de producción (Node.js en `/api`). Diseñado para desarrollo local y demostración de habilidades backend en PHP.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Symfony 6.4 (LTS) |
| ORM | Doctrine ORM |
| Base de datos | Neon PostgreSQL (misma BD que la API de producción) |
| Autenticación | JWT via LexikJWTAuthenticationBundle |
| CORS | NelmioCorsBundle |
| Pagos | Stripe PHP SDK |
| Fixtures | DoctrineFixturesBundle |

## Requisitos

- PHP 8.2+
- Composer
- Extensiones PHP: `openssl`, `pdo_pgsql`, `intl`

## Instalación

```bash
cd server
composer install
```

## Configuración

Copia `.env` a `.env.local` y ajusta:

```env
DATABASE_URL="postgresql://USER:PASS@ep-xxx.neon.tech/neondb?sslmode=require&serverVersion=16"
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
```

El `DATABASE_URL` debe apuntar a la misma base de datos Neon que usa la API de producción.

## Generar claves JWT

```bash
php -r "
\$res = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
openssl_pkey_export(\$res, \$priv, 'shopflow_jwt_passphrase_dev');
\$pub = openssl_pkey_get_details(\$res)['key'];
file_put_contents('config/jwt/private.pem', \$priv);
file_put_contents('config/jwt/public.pem', \$pub);
echo 'JWT keys OK';
"
```

## Cargar fixtures (datos de prueba)

```bash
php bin/console doctrine:fixtures:load --no-interaction
```

Crea los mismos 47 productos, 10 categorías y 2 usuarios que el seed.js de Node.js:
- `admin@shopflow.com` / `Admin1234!`
- `cliente@shopflow.com` / `Cliente1234!`

## Iniciar servidor de desarrollo

```bash
php bin/console server:start
# o
symfony server:start
```

El servidor corre en `http://localhost:8000`.

## Endpoints API

Todos los endpoints son equivalentes a los de la API Node.js en `/api`:

### Auth
| Método | Ruta | Auth |
|---|---|---|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | Público |
| GET | `/api/auth/me` | JWT |
| POST | `/api/auth/logout` | JWT |

### Productos
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/products` | Público (filtros: category, minPrice, maxPrice, search, sortBy, available, page, limit) |
| GET | `/api/products/{id}` | Público |
| POST | `/api/products` | ROLE_ADMIN |
| PUT | `/api/products/{id}` | ROLE_ADMIN |
| DELETE | `/api/products/{id}` | ROLE_ADMIN |

### Categorías
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/categories` | Público |
| POST | `/api/categories` | ROLE_ADMIN |
| PUT | `/api/categories/{id}` | ROLE_ADMIN |
| DELETE | `/api/categories/{id}` | ROLE_ADMIN |

### Carrito
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/cart` | JWT |
| DELETE | `/api/cart` | JWT |
| POST | `/api/cart/items` | JWT |
| PUT | `/api/cart/items/{id}` | JWT |
| DELETE | `/api/cart/items/{id}` | JWT |

### Pedidos
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/orders` | JWT |
| GET | `/api/orders/{id}` | JWT |
| POST | `/api/orders` | JWT |

### Admin
| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/admin/dashboard` | ROLE_ADMIN |
| GET | `/api/admin/sales-chart` | ROLE_ADMIN |
| GET | `/api/admin/orders` | ROLE_ADMIN |
| PATCH | `/api/admin/orders/{id}/status` | ROLE_ADMIN |
| GET | `/api/admin/users` | ROLE_ADMIN |
| PATCH | `/api/admin/users?id={id}` | ROLE_ADMIN |
| DELETE | `/api/admin/users?id={id}` | ROLE_ADMIN |

### Stripe
| Método | Ruta | Auth |
|---|---|---|
| POST | `/api/stripe/create-payment-intent` | JWT |

## Usar este backend con el frontend Nuxt

En `client/.env.local`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

Reinicia el servidor Nuxt y el frontend usará este backend Symfony.
