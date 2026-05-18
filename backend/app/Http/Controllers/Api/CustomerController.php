<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function loadCustomers(Request $request)
    {
        $search = $request->input('search');

        $customers = Customer::where('tbl_customers.is_deleted', false)
            ->orderBy('tbl_customers.name', 'asc');

        if ($search) {
            $customers->where(function ($customer) use ($search) {
                $customer->where('tbl_customers.name', 'like', "%{$search}%")
                    ->orWhere('tbl_customers.contact', 'like', "%{$search}%")
                    ->orWhere('tbl_customers.email', 'like', "%{$search}%");
            });
        }

        $customers = $customers->paginate(15);

        return response()->json([
            'customers' => $customers
        ], 200);
    }

    public function storeCustomer(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:100'],
            'contact' => ['required', 'max:20'],
            'address' => ['required', 'max:255'],
            'email' => ['nullable', 'email', 'max:100']
        ]);

        Customer::create([
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'address' => $validated['address'],
            'email' => $validated['email'] ?? null
        ]);

        return response()->json([
            'message' => 'Customer Successfully Saved.'
        ], 200);
    }

    public function updateCustomer(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:100'],
            'contact' => ['required', 'max:20'],
            'address' => ['required', 'max:255'],
            'email' => ['nullable', 'email', 'max:100']
        ]);

        $customer->update([
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'address' => $validated['address'],
            'email' => $validated['email'] ?? null
        ]);

        return response()->json([
            'message' => 'Customer Successfully Updated.',
            'customer' => $customer
        ], 200);
    }

    public function destroyCustomer(Customer $customer)
    {
        $customer->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'Customer Successfully Deleted.'
        ], 200);
    }
}
