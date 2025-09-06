<?php
$base = '/var/www/crysgarage-deploy/crysgarage-backend/laravel';
require $base . '/vendor/autoload.php';
$app = require $base . '/bootstrap/app.php';
/** @var \Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'dev@crysgarage.studio')->first();
if (!$user) {
    echo "NO_USER\n";
    exit(1);
}

echo 'USER_ID=' . $user->id . "\n";
echo 'TIER=' . $user->tier . "\n";
echo 'CREDITS=' . $user->credits . "\n";
echo 'PWD_SET=' . ($user->password ? 'yes' : 'no') . "\n";
echo 'HASH_CHECK=' . (Hash::check('crysgarage-dev', $user->password) ? 'OK' : 'FAIL') . "\n";

