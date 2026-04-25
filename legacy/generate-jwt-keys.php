<?php
$config = ['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA];
$res = openssl_pkey_new($config);
if (!$res) {
    echo 'ERROR: OpenSSL not available. Install php-openssl extension.' . PHP_EOL;
    exit(1);
}
openssl_pkey_export($res, $privKey, 'shopflow_jwt_passphrase_dev');
$pubKey = openssl_pkey_get_details($res)['key'];
@mkdir(__DIR__ . '/config/jwt', 0700, true);
file_put_contents(__DIR__ . '/config/jwt/private.pem', $privKey);
file_put_contents(__DIR__ . '/config/jwt/public.pem', $pubKey);
echo '✅ JWT keys generated: config/jwt/private.pem and config/jwt/public.pem' . PHP_EOL;
