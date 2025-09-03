<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'tier',
        'payment_amount',
        'payment_method',
        'description',
        'metadata'
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_amount' => 'decimal:2',
        'metadata' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
