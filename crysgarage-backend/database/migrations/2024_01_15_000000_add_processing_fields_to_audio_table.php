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
        Schema::table('audio', function (Blueprint $table) {
            // Processing status fields
            $table->string('processing_status')->default('pending')->after('status');
            $table->timestamp('processed_at')->nullable()->after('processing_status');
            
            // ML and processing data
            $table->json('ml_parameters')->nullable()->after('processed_at');
            $table->json('processed_files')->nullable()->after('ml_parameters');
            $table->json('download_urls')->nullable()->after('processed_files');
            
            // Job tracking
            $table->string('job_id')->nullable()->after('download_urls');
            $table->integer('retry_count')->default(0)->after('job_id');
            $table->timestamp('failed_at')->nullable()->after('retry_count');
            $table->text('failure_reason')->nullable()->after('failed_at');
            
            // Tier and format tracking
            $table->string('tier')->default('free')->after('failure_reason');
            $table->json('requested_formats')->nullable()->after('tier');
            
            // Performance metrics
            $table->integer('processing_time_seconds')->nullable()->after('requested_formats');
            $table->decimal('file_size_mb', 8, 2)->nullable()->after('processing_time_seconds');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audio', function (Blueprint $table) {
            $table->dropColumn([
                'processing_status',
                'processed_at',
                'ml_parameters',
                'processed_files',
                'download_urls',
                'job_id',
                'retry_count',
                'failed_at',
                'failure_reason',
                'tier',
                'requested_formats',
                'processing_time_seconds',
                'file_size_mb'
            ]);
        });
    }
};
