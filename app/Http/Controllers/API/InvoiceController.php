<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class InvoiceController extends Controller
{
    public function index()
    {
        return response()->json(Invoice::with('items.product', 'customer')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'type' => 'required|in:purchase,sale,return',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'type' => $validated['type'],
                'total' => 0,
            ]);

            $total = 0;
            $totalCost = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                $itemData['cost_price'] = $product->buying_price;
                $itemData['price'] = $product->selling_price; // Authoritative price from DB

                $item = new InvoiceItem($itemData);
                $invoice->items()->save($item);

                $lineTotal = $itemData['quantity'] * $itemData['price'];
                $total += $lineTotal;

                $totalCost += ($itemData['cost_price'] * $itemData['quantity']);
            }

            $qrCodeData = url('/api/invoices/' . $invoice->id);
            $qrCodeBase64 = base64_encode(QrCode::format('svg')->size(100)->generate($qrCodeData));

            $invoice->update([
                'total' => $total,
                'qr_code' => $qrCodeBase64
            ]);

            $this->applyWalletTransaction($invoice);

            $profit = 0;
            if ($invoice->type === 'sale') {
                $profit = $total - $totalCost;
            }

            return response()->json([
                'invoice' => $invoice->load('items'),
                'profit' => $profit
            ], 201);
        });
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('items.product', 'customer'));
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'type' => 'required|in:purchase,sale,return',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $invoice) {
            // Revert original wallet transaction
            $this->revertWalletTransaction($invoice);

            // Update basic details
            $invoice->update([
                'customer_id' => $validated['customer_id'] ?? null,
                'type' => $validated['type'],
            ]);

            // Clear old items and recreate (simpler than syncing manually for this scope)
            $invoice->items()->delete();

            $total = 0;
            $totalCost = 0;

            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);
                $itemData['cost_price'] = $product->buying_price;
                $itemData['price'] = $product->selling_price; // Authoritative price from DB

                $item = new InvoiceItem($itemData);
                $invoice->items()->save($item);

                $lineTotal = $itemData['quantity'] * $itemData['price'];
                $total += $lineTotal;

                $totalCost += ($itemData['cost_price'] * $itemData['quantity']);
            }

            // Re-generate QR Code in case URL needs to hold updated data (keeping it simple here)
            $qrCodeData = url('/api/invoices/' . $invoice->id);
            $qrCodeBase64 = base64_encode(QrCode::format('svg')->size(100)->generate($qrCodeData));

            $invoice->update([
                'total' => $total,
                'qr_code' => $qrCodeBase64
            ]);

            // Apply new wallet transaction
            $this->applyWalletTransaction($invoice);

            $profit = 0;
            if ($invoice->type === 'sale') {
                $profit = $total - $totalCost;
            }

            return response()->json([
                'invoice' => $invoice->load('items'),
                'profit' => $profit
            ], 200);
        });
    }

    public function destroy(Invoice $invoice)
    {
        return DB::transaction(function () use ($invoice) {
            $this->revertWalletTransaction($invoice);
            $invoice->delete();
            return response()->json(null, 204);
        });
    }

    public function exportPdf(Invoice $invoice)
    {
        $invoice->load('items.product', 'customer');

        $html = "<h1>Invoice #{$invoice->id}</h1>";
        $html .= "<p>Type: " . e($invoice->type) . "</p>";
        $html .= "<p>Total: " . e($invoice->total) . "</p>";
        $html .= "<p>Items:</p><ul>";
        foreach ($invoice->items as $item) {
            $html .= "<li>" . e($item->product->name) . " (x" . e($item->quantity) . ") - " . e($item->price) . "</li>";
        }
        $html .= "</ul>";

        $pdf = Pdf::loadHTML($html);
        return $pdf->download("invoice_{$invoice->id}.pdf");
    }

    public function generateQrCode(Invoice $invoice)
    {
        $url = url('/api/invoices/' . $invoice->id);
        $qrCode = QrCode::format('svg')->size(300)->generate($url);
        return response($qrCode)->header('Content-type', 'image/svg+xml');
    }

    private function applyWalletTransaction(Invoice $invoice)
    {
        if (!$invoice->customer_id) return;

        $customer = Customer::find($invoice->customer_id);

        if ($invoice->type === 'sale') {
            WalletTransaction::create([
                'customer_id' => $customer->id,
                'amount' => $invoice->total,
                'type' => 'debit',
                'description' => "Invoice #{$invoice->id} Sale"
            ]);
            $customer->decrement('balance', $invoice->total);
        } elseif ($invoice->type === 'return' || $invoice->type === 'purchase') {
            WalletTransaction::create([
                'customer_id' => $customer->id,
                'amount' => $invoice->total,
                'type' => 'credit',
                'description' => "Invoice #{$invoice->id} {$invoice->type}"
            ]);
            $customer->increment('balance', $invoice->total);
        }
    }

    private function revertWalletTransaction(Invoice $invoice)
    {
        if (!$invoice->customer_id) return;

        $customer = Customer::find($invoice->customer_id);

        if ($invoice->type === 'sale') {
            // Reversing a sale (debit) means crediting the customer back
            WalletTransaction::create([
                'customer_id' => $customer->id,
                'amount' => $invoice->total,
                'type' => 'credit',
                'description' => "Revert Invoice #{$invoice->id} Sale"
            ]);
            $customer->increment('balance', $invoice->total);
        } elseif ($invoice->type === 'return' || $invoice->type === 'purchase') {
            // Reversing a return/purchase (credit) means debiting the customer back
            WalletTransaction::create([
                'customer_id' => $customer->id,
                'amount' => $invoice->total,
                'type' => 'debit',
                'description' => "Revert Invoice #{$invoice->id} {$invoice->type}"
            ]);
            $customer->decrement('balance', $invoice->total);
        }
    }
}
