<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    // Tablas legacy en la MISMA conexión de test, pobladas con un fixture chico.
    Schema::create('tipos_propiedad', function ($t) {
        $t->integer('id');
        $t->string('nombre_categoria')->nullable();
    });
    Schema::create('propiedades', function ($t) {
        $t->integer('id');
        $t->integer('categoria')->nullable();
        $t->string('titulo')->nullable();
        $t->string('localidad')->nullable();
        $t->text('ubicacion')->nullable();
        $t->string('tamanio')->nullable();
        $t->text('servicios')->nullable();
        $t->text('caracteristicas')->nullable();
        $t->text('mapa')->nullable();
        $t->integer('orden')->nullable();
        $t->boolean('vendida')->nullable();
        $t->decimal('latitud', 10, 8)->nullable();
        $t->decimal('longitud', 11, 8)->nullable();
    });
    Schema::create('imagenes_propiedades', function ($t) {
        $t->integer('id');
        $t->integer('id_propiedad')->nullable();
        $t->string('ruta_imagen')->nullable();
        $t->integer('orden')->nullable();
    });

    DB::table('tipos_propiedad')->insert(['id' => 1, 'nombre_categoria' => 'Casas']);
    DB::table('propiedades')->insert([
        'id' => 10, 'categoria' => 1, 'titulo' => 'Casa test', 'orden' => 0, 'vendida' => 0,
    ]);
    DB::table('imagenes_propiedades')->insert([
        'id' => 1, 'id_propiedad' => 10, 'ruta_imagen' => 'no-existe.webp', 'orden' => 0,
    ]);
});

afterEach(function () {
    Schema::dropIfExists('imagenes_propiedades');
    Schema::dropIfExists('propiedades');
    Schema::dropIfExists('tipos_propiedad');
});

it('migra categorías y propiedades (imágenes faltantes no abortan)', function () {
    $this->artisan('ventas:import', ['--connection' => config('database.default')])
        ->assertSuccessful();

    expect(PropertyType::where('name', 'Casas')->exists())->toBeTrue()
        ->and(SaleProperty::where('title', 'Casa test')->exists())->toBeTrue()
        ->and(SaleProperty::where('title', 'Casa test')->first()->property_type_id)
        ->toBe(PropertyType::where('name', 'Casas')->first()->id);
});
