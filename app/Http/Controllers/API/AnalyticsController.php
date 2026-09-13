<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Basic metrics
        $totalSales = Invoice::where('type', 'sale')->sum('total');

        // Accurate historical profit based on cost_price stored in invoice_items
        $totalCost = InvoiceItem::whereHas('invoice', function($q) {
            $q->where('type', 'sale');
        })->sum(DB::raw('cost_price * quantity'));

        $totalProfit = $totalSales - $totalCost;

        $recentInvoices = Invoice::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'total_profit' => $totalProfit,
            'recent_invoices' => $recentInvoices
        ]);
    }
}
