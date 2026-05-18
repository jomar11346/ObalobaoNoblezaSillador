<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FlowerController extends Controller
{
    public function loadFlowers() {
        $flowers = Flower::where('tbl_flowers.is_deleted', false)
            ->get();

        $flowers->transform(function ($flower) {
            $flower->image = $flower->image ? url('storage/public/img/flower/image/' . $flower->image) : null;
            return $flower;
        });

        return response()->json([
            'flowers' => $flowers
        ], 200);
    }

    public function storeFlower(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'min:3', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'max:500'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg'],
            'category' => ['required', 'max:50']
        ]);

        if ($request->hasFile('image')) {
            $filenameWithExtension = $request->file('image');
            $filename = pathinfo($filenameWithExtension->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $filenameWithExtension->getClientOriginalExtension();
            $filenameToStore = sha1($filename . '_' . time() . '.' . $extension);
            $filenameWithExtension->storeAs('public/img/flower/image', $filenameToStore);
            $validated['image'] = $filenameToStore;
        }

        Flower::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock_quantity' => $validated['stock_quantity'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'category' => $validated['category']
        ]);

        return response()->json([
            'message' => 'Flower Successfully Saved.'
        ], 200);
    }

    public function getFlower($flowerID) {
        $flower = Flower::find($flowerID);
        $flower->image = $flower->image ? url('storage/public/img/flower/image/' . $flower->image) : null;

        return response()->json([
            'flower' => $flower,
        ], 200);
    }

    public function updateFlower(Request $request, Flower $flower)
    {
        $validated = $request->validate([
            'name' => ['required', 'min:3', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'max:500'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg'],
            'category' => ['required', 'max:50']
        ]);

        if ($request->has('remove_image') && $request->remove_image == '1') {
            if ($flower->image && Storage::exists('public/img/flower/image/' . $flower->image)) {
                Storage::delete('public/img/flower/image/' . $flower->image);
                $flower->image = null;
            }
        } else if ($request->hasFile('image')) {
            if ($flower->image && Storage::exists('public/img/flower/image/' . $flower->image)) {
                Storage::delete('public/img/flower/image/' . $flower->image);
            }

            $filenameWithExtension = $request->file('image');
            $filename = pathinfo($filenameWithExtension->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $filenameWithExtension->getClientOriginalExtension();
            $filenameToStore = sha1($filename . '_' . time() . '.' . $extension);
            $filenameWithExtension->storeAs('public/img/flower/image', $filenameToStore);
            $validated['image'] = $filenameToStore;
        }

        $flower->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock_quantity' => $validated['stock_quantity'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? $flower->image,
            'category' => $validated['category']
        ]);

        $flower->image = $flower->image ? url('storage/public/img/flower/image/' . $flower->image) : null;

        return response()->json([
            'flower' => $flower->fresh(),
            'message' => 'Flower Successfully Updated.',
        ], 200);
    }

    public function destroyFlower(Flower $flower)
    {
        $flower->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'Flower Successfully Deleted.',
        ], 200);
    }
}
