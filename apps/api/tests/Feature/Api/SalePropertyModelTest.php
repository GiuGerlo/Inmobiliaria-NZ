<?php

declare(strict_types=1);

use App\Models\PropertyImage;
use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('relaciona tipo, propiedad e imágenes', function () {
    $type = PropertyType::factory()->create(['name' => 'Casas']);
    $property = SaleProperty::factory()->for($type, 'type')->create();
    PropertyImage::factory()->count(2)->create(['sale_property_id' => $property->id]);

    expect($property->type->name)->toBe('Casas')
        ->and($property->images)->toHaveCount(2)
        ->and($type->saleProperties)->toHaveCount(1);
});

it('castea is_sold y borra imágenes en cascada', function () {
    $property = SaleProperty::factory()->sold()->create();
    PropertyImage::factory()->create(['sale_property_id' => $property->id]);

    expect($property->is_sold)->toBeTrue();

    $property->delete();
    expect(PropertyImage::count())->toBe(0);
});

it('genera un slug único desde el título + id al crear', function () {
    $a = SaleProperty::factory()->create(['title' => 'Casa en Funes']);
    $b = SaleProperty::factory()->create(['title' => 'Casa en Funes']);

    expect($a->slug)->toBe("casa-en-funes-{$a->id}")
        ->and($b->slug)->toBe("casa-en-funes-{$b->id}")
        ->and($a->slug)->not->toBe($b->slug);
});

it('cae a "propiedad-{id}" cuando el título es nulo', function () {
    $property = SaleProperty::factory()->create(['title' => null]);

    expect($property->slug)->toBe("propiedad-{$property->id}");
});

it('regenera el slug al cambiar el título', function () {
    $property = SaleProperty::factory()->create(['title' => 'Lote 1']);
    $property->update(['title' => 'Quinta con pileta']);

    expect($property->fresh()->slug)->toBe("quinta-con-pileta-{$property->id}");
});
