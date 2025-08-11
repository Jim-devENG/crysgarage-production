<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Genre;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genres = [
            [
                'name' => 'Pop',
                'description' => 'Modern pop with balanced dynamics',
                'price' => 1.00,
                'is_free_for_tier' => ['professional'],
                'icon' => 'music',
                'sort_order' => 1
            ],
            [
                'name' => 'Rock',
                'description' => 'Powerful rock with punch and clarity',
                'price' => 1.00,
                'is_free_for_tier' => ['professional'],
                'icon' => 'music2',
                'sort_order' => 2
            ],
            [
                'name' => 'Reggae',
                'description' => 'Rhythmic reggae with deep bass',
                'price' => 1.00,
                'is_free_for_tier' => ['professional'],
                'icon' => 'music3',
                'sort_order' => 3
            ],
            [
                'name' => 'Electronic',
                'description' => 'Electronic music with crisp highs',
                'price' => 1.00,
                'is_free_for_tier' => [],
                'icon' => 'music4',
                'sort_order' => 4
            ],
            [
                'name' => 'Jazz',
                'description' => 'Smooth jazz with natural dynamics',
                'price' => 1.00,
                'is_free_for_tier' => ['advanced'],
                'icon' => 'music',
                'sort_order' => 5
            ],
            [
                'name' => 'Classical',
                'description' => 'Classical with wide dynamic range',
                'price' => 1.00,
                'is_free_for_tier' => [],
                'icon' => 'music2',
                'sort_order' => 6
            ],
            [
                'name' => 'Hip-Hop',
                'description' => 'Hip-hop with powerful low end',
                'price' => 1.00,
                'is_free_for_tier' => [],
                'icon' => 'music3',
                'sort_order' => 7
            ],
            [
                'name' => 'Country',
                'description' => 'Country with vocal clarity',
                'price' => 1.00,
                'is_free_for_tier' => [],
                'icon' => 'music4',
                'sort_order' => 8
            ],
            [
                'name' => 'Folk',
                'description' => 'Acoustic folk with warmth',
                'price' => 1.00,
                'is_free_for_tier' => [],
                'icon' => 'music',
                'sort_order' => 9
            ],
            [
                'name' => 'Afrobeats',
                'description' => 'Afrobeats with rhythmic energy',
                'price' => 1.00,
                'is_free_for_tier' => ['advanced'],
                'icon' => 'music2',
                'sort_order' => 10
            ]
        ];

        foreach ($genres as $genre) {
            Genre::updateOrCreate(
                ['name' => $genre['name']],
                $genre
            );
        }

        $this->command->info('Genres seeded successfully!');
    }
}