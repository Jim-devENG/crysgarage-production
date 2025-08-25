<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function getGenresForTier(Request $request)
    {
        return response()->json([
            'genres' => [
                ['id' => 1, 'name' => 'Pop', 'description' => 'Popular music'],
                ['id' => 2, 'name' => 'Rock', 'description' => 'Rock music'],
                ['id' => 3, 'name' => 'Hip Hop', 'description' => 'Hip hop music'],
                ['id' => 4, 'name' => 'Electronic', 'description' => 'Electronic music'],
                ['id' => 5, 'name' => 'Jazz', 'description' => 'Jazz music'],
                ['id' => 6, 'name' => 'Classical', 'description' => 'Classical music'],
            ]
        ]);
    }

    public function getAllGenres(Request $request)
    {
        return response()->json([
            'genres' => [
                ['id' => 1, 'name' => 'Pop', 'description' => 'Popular music'],
                ['id' => 2, 'name' => 'Rock', 'description' => 'Rock music'],
                ['id' => 3, 'name' => 'Hip Hop', 'description' => 'Hip hop music'],
                ['id' => 4, 'name' => 'Electronic', 'description' => 'Electronic music'],
                ['id' => 5, 'name' => 'Jazz', 'description' => 'Jazz music'],
                ['id' => 6, 'name' => 'Classical', 'description' => 'Classical music'],
            ]
        ]);
    }

    public function createGenre(Request $request)
    {
        return response()->json(['message' => 'Genre created successfully']);
    }

    public function updateGenre(Request $request, $id)
    {
        return response()->json(['message' => 'Genre updated successfully']);
    }

    public function deleteGenre(Request $request, $id)
    {
        return response()->json(['message' => 'Genre deleted successfully']);
    }
}
