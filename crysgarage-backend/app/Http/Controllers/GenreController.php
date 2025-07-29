<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Genre;

class GenreController extends Controller
{
    /**
     * Get all genres for a specific tier
     */
    public function getGenresForTier(Request $request)
    {
        $tier = $request->query('tier', 'free');
        
        \Log::info('Getting genres for tier', ['tier' => $tier]);
        
        $genres = Genre::getGenresForTier($tier);
        
        return response()->json([
            'genres' => $genres,
            'tier' => $tier
        ]);
    }

    /**
     * Get all genres (admin endpoint)
     */
    public function getAllGenres()
    {
        $genres = Genre::orderBy('sort_order')->get();
        
        return response()->json([
            'genres' => $genres
        ]);
    }

    /**
     * Create a new genre (admin endpoint)
     */
    public function createGenre(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'is_free_for_tier' => 'array',
            'icon' => 'string|max:50',
            'sort_order' => 'integer'
        ]);

        $genre = Genre::create($request->all());

        return response()->json([
            'message' => 'Genre created successfully',
            'genre' => $genre
        ], 201);
    }

    /**
     * Update a genre (admin endpoint)
     */
    public function updateGenre(Request $request, $id)
    {
        $genre = Genre::findOrFail($id);
        
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'is_free_for_tier' => 'array',
            'icon' => 'string|max:50',
            'sort_order' => 'integer'
        ]);

        $genre->update($request->all());

        return response()->json([
            'message' => 'Genre updated successfully',
            'genre' => $genre
        ]);
    }

    /**
     * Delete a genre (admin endpoint)
     */
    public function deleteGenre($id)
    {
        $genre = Genre::findOrFail($id);
        $genre->delete();

        return response()->json([
            'message' => 'Genre deleted successfully'
        ]);
    }
}