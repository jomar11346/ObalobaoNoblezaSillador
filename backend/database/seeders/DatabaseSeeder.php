<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Gender;
use App\Models\Flower;
use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
      Gender::factory()->createMany([
    ['gender' => 'Male'],
    ['gender' => 'Female'],
    ['gender' => 'Prefer Not to Say']
    ]);

    $birthDate = fake()->date();
    $age = date_diff(date_create($birthDate), date_create('now'))->y;

    User::factory()->create([
        'first_name' => 'John',
        'middle_name' => 'Santos',
        'last_name' => 'Doe',
        'suffix_name' => null,
        'gender_id' => Gender::inRandomOrder()->first()->gender_id,
        'birth_date' => $birthDate,
        'age' => $age,
        'username' => 'johndoe',
    'password' => 'johndoe'
    ]);

    User::factory(100)->create();

        Flower::insert([
            ['name' => 'Red Roses Bouquet', 'price' => 599.00, 'stock_quantity' => 25, 'description' => 'Classic red roses', 'category' => 'Bouquet', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sunflower Bundle', 'price' => 349.00, 'stock_quantity' => 8, 'description' => 'Bright sunflowers', 'category' => 'Bundle', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lily Arrangement', 'price' => 449.00, 'stock_quantity' => 15, 'description' => 'Elegant white lilies', 'category' => 'Arrangement', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Customer::insert([
            ['name' => 'Maria Santos', 'contact' => '09171234567', 'address' => 'Quezon City', 'email' => 'maria@example.com', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Juan Dela Cruz', 'contact' => '09189876543', 'address' => 'Manila', 'email' => 'juan@example.com', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
