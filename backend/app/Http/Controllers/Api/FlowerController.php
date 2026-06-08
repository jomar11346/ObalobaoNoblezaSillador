<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FlowerController extends Controller
{
    private const IMAGE_DISK = 'public';
    private const IMAGE_PATH = 'img/flower/image';

    private function flowerImageUrl(?string $filename): ?string
    {
        return $filename
            ? Storage::disk(self::IMAGE_DISK)->url(self::IMAGE_PATH . '/' . $filename)
            : null;
    }

    private function storeUploadedImage(Request $request, string $field = 'image'): ?string
    {
        if (!$request->hasFile($field)) {
            return null;
        }

        $file = $request->file($field);
        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $filenameToStore = sha1($filename . '_' . time() . '.' . $extension);

        $file->storeAs(self::IMAGE_PATH, $filenameToStore, self::IMAGE_DISK);

        return $filenameToStore;
    }

    private function deleteStoredImage(?string $filename): void
    {
        if (!$filename) {
            return;
        }

        $path = self::IMAGE_PATH . '/' . $filename;

        if (Storage::disk(self::IMAGE_DISK)->exists($path)) {
            Storage::disk(self::IMAGE_DISK)->delete($path);
        }
    }

    public function loadFlowers() {
        $flowers = Flower::where('tbl_flowers.is_deleted', false)
            ->get();

        $flowers->transform(function ($flower) {
            $flower->image = $this->flowerImageUrl($flower->image);
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
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg'],
        ]);

        $storedImage = $this->storeUploadedImage($request);

        Flower::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock_quantity' => $validated['stock_quantity'],
            'image' => $storedImage,
        ]);

        return response()->json([
            'message' => 'Flower Successfully Saved.'
        ], 200);
    }

    public function getFlower($flowerID) {
        $flower = Flower::find($flowerID);
        $flower->image = $this->flowerImageUrl($flower->image);

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
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg'],
            'remove_image' => ['nullable', 'in:0,1'],
        ]);

        $imageFilename = $flower->image;

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($flower->image);
            $imageFilename = $this->storeUploadedImage($request);
        } elseif ($request->has('remove_image') && $request->remove_image == '1') {
            $this->deleteStoredImage($flower->image);
            $imageFilename = null;
        }

        $flower->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock_quantity' => $validated['stock_quantity'],
            'image' => $imageFilename,
        ]);

        $flower->refresh();
        $flower->image = $this->flowerImageUrl($flower->image);

        return response()->json([
            'flower' => $flower,
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
