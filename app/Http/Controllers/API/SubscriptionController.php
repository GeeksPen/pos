<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index()
    {
        return response()->json(Subscription::with('user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan' => 'required|string',
            'expires_at' => 'nullable|date',
        ]);

        $subscription = Subscription::create($validated);
        return response()->json($subscription, 201);
    }

    public function show(Subscription $subscription)
    {
        return response()->json($subscription->load('user'));
    }

    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'plan' => 'sometimes|required|string',
            'expires_at' => 'nullable|date',
        ]);

        $subscription->update($validated);
        return response()->json($subscription);
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();
        return response()->json(null, 204);
    }
}
