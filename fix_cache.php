<?php
$content = file_get_contents('config/cache.php');
// Remplacer 'database' par 'file' comme driver par défaut
$content = str_replace("'default' => env('CACHE_DRIVER', 'database')", "'default' => env('CACHE_DRIVER', 'file')", $content);
file_put_contents('config/cache.php', $content);
echo "✓ config/cache.php mis a jour\n";

// Vérifier le .env
$env = file_get_contents('.env');
if (strpos($env, 'CACHE_DRIVER=file') === false) {
    $env = str_replace('CACHE_DRIVER=database', 'CACHE_DRIVER=file', $env);
    file_put_contents('.env', $env);
    echo "✓ .env mis a jour avec CACHE_DRIVER=file\n";
} else {
    echo "✓ CACHE_DRIVER=file deja present\n";
}