<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_filename');
            $table->string('original_path');
            $table->bigInteger('file_size');
            $table->decimal('duration', 8, 2)->nullable();
            $table->integer('sample_rate')->nullable();
            $table->integer('bit_depth')->nullable();
            $table->integer('channels')->nullable();
            $table->string('format');
            $table->string('genre');
            $table->string('tier');
            $table->string('status')->default('uploaded');
            $table->timestamp('processing_started_at')->nullable();
            $table->timestamp('processing_completed_at')->nullable();
            $table->json('processed_files')->nullable();
            $table->json('ml_recommendations')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audio');
    }
};
