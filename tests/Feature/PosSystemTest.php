<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Product;
use App\Models\Customer;

class PosSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_product()
    {
        $response = $this->postJson('/api/products', [
            'name' => 'Laptop',
            'buying_price' => 500,
            'selling_price' => 700,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', [
            'name' => 'Laptop',
            'selling_price' => 700,
        ]);
    }

    public function test_can_create_customer()
    {
        $response = $this->postJson('/api/customers', [
            'name' => 'John Doe',
            'balance' => 0,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('customers', [
            'name' => 'John Doe',
        ]);
    }

    public function test_can_create_sale_invoice_and_update_wallet()
    {
        $product = Product::create([
            'name' => 'Phone',
            'buying_price' => 300,
            'selling_price' => 500,
        ]);

        $customer = Customer::create([
            'name' => 'Alice',
            'balance' => 0,
        ]);

        $response = $this->postJson('/api/invoices', [
            'customer_id' => $customer->id,
            'type' => 'sale',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 500
                ]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('profit', 400); // 1000 - 600 = 400

        // Assert database state
        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'total' => 1000,
            'type' => 'sale',
        ]);

        // Customer's balance should be decremented by total (sales = debit)
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'balance' => -1000,
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'customer_id' => $customer->id,
            'amount' => 1000,
            'type' => 'debit',
        ]);
    }


    public function test_can_update_invoice()
    {
        $product = Product::create([
            'name' => 'Tablet',
            'buying_price' => 200,
            'selling_price' => 300,
        ]);

        $customer = Customer::create([
            'name' => 'Bob',
            'balance' => 0,
        ]);

        // 1. Create initial invoice (sale of 1 tablet for 300)
        $invoiceResponse = $this->postJson('/api/invoices', [
            'customer_id' => $customer->id,
            'type' => 'sale',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'price' => 300
                ]
            ]
        ]);

        $invoiceId = $invoiceResponse->json('invoice.id');

        // Verify balance went down by 300
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'balance' => -300,
        ]);

        // 2. Update invoice (sale of 2 tablets for 300 each = 600)
        $updateResponse = $this->putJson("/api/invoices/{$invoiceId}", [
            'customer_id' => $customer->id,
            'type' => 'sale',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 300
                ]
            ]
        ]);

        $updateResponse->assertStatus(200);

        // Verify balance was properly reverted and re-applied (-300 + 300 - 600 = -600)
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'balance' => -600,
        ]);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoiceId,
            'total' => 600
        ]);
    }

    public function test_can_register_user()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['user', 'access_token', 'token_type']);
        $this->assertDatabaseHas('users', ['email' => 'admin@example.com']);
    }

    public function test_can_manage_settings()
    {
        $response = $this->postJson('/api/settings', [
            'settings' => [
                'app_name' => 'My POS',
                'currency' => 'USD'
            ]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('settings', ['key' => 'app_name', 'value' => 'My POS']);
        $this->assertDatabaseHas('settings', ['key' => 'currency', 'value' => 'USD']);
    }

}
