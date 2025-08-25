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
            $table->string('tier')->default('free');
            $table->integer('credits')->default(5);
            $table->integer('total_tracks')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->string('api_token', 80)->unique()->nullable();
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
