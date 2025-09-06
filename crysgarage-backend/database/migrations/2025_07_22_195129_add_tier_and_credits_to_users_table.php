<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('tier')->default('free')->after('email');
            $table->integer('credits')->default(0)->after('tier'); // Free tier users start with 0 credits (pay per download)
            $table->integer('total_tracks')->default(0)->after('credits');
            $table->decimal('total_spent', 10, 2)->default(0.00)->after('total_tracks');
            $table->string('api_token', 80)->nullable()->after('total_spent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tier', 'credits', 'total_tracks', 'total_spent', 'api_token']);
        });
    }
};
