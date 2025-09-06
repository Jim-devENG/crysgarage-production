<?php
$base = '/var/www/crysgarage-deploy/crysgarage-backend/laravel';
require $base . '/vendor/autoload.php';
$app = require $base . '/bootstrap/app.php';
/** @var \Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::updateOrCreate(
    ['email' => 'dev@crysgarage.studio'],
    [
        'name' => 'Crys Garage',
        'password' => bcrypt('crysgarage-dev'),
        'tier' => 'advanced',
        'credits' => 9999,
    ]
);

echo 'USER_ID=' . $user->id . "\n";
echo 'EMAIL=' . $user->email . "\n";
echo 'TIER=' . $user->tier . "\n";
echo 'CREDITS=' . $user->credits . "\n";

