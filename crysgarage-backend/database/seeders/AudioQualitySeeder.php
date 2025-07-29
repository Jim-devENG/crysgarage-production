<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AudioQuality;

class AudioQualitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $qualityOptions = [
            [
                'name' => 'Standard Quality',
                'sample_rate' => 44100,
                'bit_depth' => 16,
                'description' => 'CD quality audio (44.1kHz, 16-bit)',
                'price' => 0.00,
                'is_free_for_tier' => ['free', 'professional', 'advanced'],
                'sort_order' => 1
            ],
            [
                'name' => 'High Quality',
                'sample_rate' => 48000,
                'bit_depth' => 24,
                'description' => 'Professional quality audio (48kHz, 24-bit)',
                'price' => 1.00,
                'is_free_for_tier' => ['professional', 'advanced'],
                'sort_order' => 2
            ],
            [
                'name' => 'Studio Quality',
                'sample_rate' => 96000,
                'bit_depth' => 24,
                'description' => 'Studio quality audio (96kHz, 24-bit)',
                'price' => 2.00,
                'is_free_for_tier' => ['advanced'],
                'sort_order' => 3
            ],
            [
                'name' => 'Ultra High Quality',
                'sample_rate' => 192000,
                'bit_depth' => 32,
                'description' => 'Ultra high quality audio (192kHz, 32-bit)',
                'price' => 3.00,
                'is_free_for_tier' => ['advanced'],
                'sort_order' => 4
            ]
        ];

        foreach ($qualityOptions as $quality) {
            AudioQuality::updateOrCreate(
                ['name' => $quality['name']],
                $quality
            );
        }

        $this->command->info('Audio quality options seeded successfully!');
    }
}