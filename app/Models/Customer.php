<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'balance',
        'image_path',
    ];

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
