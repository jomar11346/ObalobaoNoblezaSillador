<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gender;
use Illuminate\Http\Request;

class GenderController extends Controller
{
    public function loadGenders()
    {
        $genders = Gender::where('tbl_genders.is_deleted', false)
            ->get();

        return response()->json([
            'genders' => $genders
        ], 200);
    }
}
