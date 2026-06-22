<?php

declare(strict_types=1);

use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->withHeader('Accept', 'application/json');
    $this->actingAs(User::factory()->superadmin()->create());
});

it('sube varias imágenes y las convierte a webp', function () {
    $property = SaleProperty::factory()->create();

    $response = $this->post("/api/v1/sale-properties/{$property->id}/images", [
        'images' => [
            UploadedFile::fake()->image('a.jpg', 640, 480),
            UploadedFile::fake()->image('b.png', 320, 240),
        ],
    ]);

    $response->assertOk()->assertJsonCount(2, 'data');
    expect($property->images()->count())->toBe(2);

    $path = $property->images()->first()->path;
    $contents = Storage::disk('public')->get($path);
    expect(substr($contents, 0, 4))->toBe('RIFF')
        ->and(substr($contents, 8, 4))->toBe('WEBP');
});

it('rechaza un archivo que no es imagen', function () {
    $property = SaleProperty::factory()->create();

    $this->post("/api/v1/sale-properties/{$property->id}/images", [
        'images' => [UploadedFile::fake()->create('x.pdf', 64, 'application/pdf')],
    ])->assertUnprocessable()->assertJsonValidationErrors(['images.0']);
});

it('borra una imagen', function () {
    $property = SaleProperty::factory()->create();
    $this->post("/api/v1/sale-properties/{$property->id}/images", [
        'images' => [UploadedFile::fake()->image('a.jpg', 100, 100)],
    ])->assertOk();
    $image = $property->images()->first();

    $this->deleteJson("/api/v1/sale-property-images/{$image->id}")->assertNoContent();
    Storage::disk('public')->assertMissing($image->path);
});

it('reordena propiedades por la lista de ids', function () {
    $a = SaleProperty::factory()->create(['sort_order' => 0]);
    $b = SaleProperty::factory()->create(['sort_order' => 1]);

    $this->patchJson('/api/v1/sale-properties/reorder', ['ids' => [$b->id, $a->id]])
        ->assertNoContent();

    expect($b->refresh()->sort_order)->toBe(0)
        ->and($a->refresh()->sort_order)->toBe(1);
});
