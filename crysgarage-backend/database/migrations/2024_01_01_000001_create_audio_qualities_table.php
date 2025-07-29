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
        Schema::create('audio_qualities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('sample_rate');
            $table->integer('bit_depth');
            $table->text('description');
            $table->decimal('price', 8, 2)->default(0.00);
            $table->json('is_free_for_tier')->nullable(); // Array of tiers that get this quality free
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audio_qualities');
    }
};