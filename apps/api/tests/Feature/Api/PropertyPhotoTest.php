<?php

declare(strict_types=1);

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    // post() multipart real (postJson no transporta archivos) + respuestas JSON
    $this->withHeader('Accept', 'application/json');
    $this->actingAs(User::factory()->create());
});

it('sube una foto y la convierte a webp', function () {
    $property = Property::factory()->create();

    $response = $this->post("/api/v1/properties/{$property->ID_Propiedad}/photo", [
        'photo' => UploadedFile::fake()->image('casa.jpg', 640, 480),
    ]);

    $path = "propiedades/{$property->ID_Propiedad}/foto.webp";

    $response->assertOk()->assertJsonPath('data.photo_url', Storage::disk('public')->url($path));

    Storage::disk('public')->assertExists($path);
    expect($property->refresh()->foto_path)->toBe($path);

    // Contenido realmente WebP (magic bytes RIFF....WEBP)
    $contents = Storage::disk('public')->get($path);
    expect(substr($contents, 0, 4))->toBe('RIFF')
        ->and(substr($contents, 8, 4))->toBe('WEBP');
});

it('rechaza un archivo que no es imagen', function () {
    $property = Property::factory()->create();

    // En producción finfo detecta el contenido real; en testing el fake
    // toma el mime del 3er argumento — un PDF no pasa File::image().
    $this->post("/api/v1/properties/{$property->ID_Propiedad}/photo", [
        'photo' => UploadedFile::fake()->create('documento.pdf', 64, 'application/pdf'),
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['photo']);
});

it('reemplaza la foto anterior al subir otra', function () {
    $property = Property::factory()->create();
    $url = "/api/v1/properties/{$property->ID_Propiedad}/photo";

    $this->post($url, ['photo' => UploadedFile::fake()->image('a.jpg', 100, 100)])->assertOk();
    $primera = Storage::disk('public')->get("propiedades/{$property->ID_Propiedad}/foto.webp");

    $this->post($url, ['photo' => UploadedFile::fake()->image('b.png', 500, 500)])->assertOk();
    $segunda = Storage::disk('public')->get("propiedades/{$property->ID_Propiedad}/foto.webp");

    expect($segunda)->not->toBe($primera);
});

it('borra la foto', function () {
    $property = Property::factory()->create();
    $url = "/api/v1/properties/{$property->ID_Propiedad}/photo";

    $this->post($url, ['photo' => UploadedFile::fake()->image('a.jpg', 100, 100)])->assertOk();

    $this->deleteJson($url)->assertNoContent();

    Storage::disk('public')->assertMissing("propiedades/{$property->ID_Propiedad}/foto.webp");
    expect($property->refresh()->foto_path)->toBeNull();
});

it('al borrar la propiedad se borra su carpeta de fotos', function () {
    $property = Property::factory()->create();

    $this->post("/api/v1/properties/{$property->ID_Propiedad}/photo", [
        'photo' => UploadedFile::fake()->image('a.jpg', 100, 100),
    ])->assertOk();

    $this->deleteJson("/api/v1/properties/{$property->ID_Propiedad}")->assertNoContent();

    Storage::disk('public')->assertMissing("propiedades/{$property->ID_Propiedad}/foto.webp");
});
