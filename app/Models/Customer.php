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
    ];

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
