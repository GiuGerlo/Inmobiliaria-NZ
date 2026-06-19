# Fusión NZ Fase 2 — Dominio ventas — Implementation Plan

> **Estado: DONE 2026-06-19** (rama `fusion-nz`). Tasks 1–6 completas; Pest 151 verdes; smoke real verificado; `/security-review` sin hallazgos. Nota de ejecución: el servicio Docker es `php-fpm` (no `php`); nginx sirve `/storage` por alias directo (sin `storage:link`).
>
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans. Pasos con checkbox (`- [ ]`).
> Spec: `docs/superpowers/specs/2026-06-19-fusion-2-ventas-design.md`. Plan paraguas: `2026-06-19-fusion-nz-design.md`. ADR-0009.

**Goal:** Traer el dominio "ventas" (propiedades en venta, categorías, imágenes) al backend Laravel: 3 tablas + modelos + API REST (lectura pública + CRUD autenticado) + comando one-shot que migra datos e imágenes del dump nz-estudio.

**Architecture:** Tablas nuevas en inglés/snake_case (las ventas no son legacy → sin `MapsLegacyFields`). Controllers siguen el patrón existente (spatie/query-builder + FormRequests + API Resources). Imágenes reusan el pipeline WebP de `PropertyPhotoController`. Migración vía `php artisan ventas:import` leyendo de una conexión secundaria a la base `nzestudio`.

**Tech Stack:** Laravel 12 / PHP 8.4, Eloquent, spatie/laravel-query-builder, Intervention Image (GD), Pest, Scramble (OpenAPI auto).

## Global Constraints

- `declare(strict_types=1);` en cada archivo PHP nuevo. Clases `final`. PSR-12 (Pint).
- snake_case en columnas/variables, PascalCase en clases/modelos/Requests/Resources, camelCase en métodos.
- Toda validación por **FormRequest**; toda respuesta por **API Resource** (nunca model crudo).
- Uploads: validar **mime real** con `Illuminate\Validation\Rules\File::image()->types([...])` (no extensión).
- Writes detrás de `auth:sanctum` + `NoStoreHeaders`; reads públicos fuera del grupo auth. Gating fino a rol → Fase 3.
- **Una fase = un commit**, lo hace el usuario al cierre. Los pasos terminan en "tests verdes", NO en `git commit` por paso.
- Idioma: identificadores en inglés; mensajes al usuario en español.

---

### Task 1: Migraciones, modelos y factories

**Files:**
- Create: `apps/api/database/migrations/2026_06_19_100001_create_property_types_table.php`
- Create: `apps/api/database/migrations/2026_06_19_100002_create_sale_properties_table.php`
- Create: `apps/api/database/migrations/2026_06_19_100003_create_property_images_table.php`
- Create: `apps/api/app/Models/PropertyType.php`, `SaleProperty.php`, `PropertyImage.php`
- Create: `apps/api/database/factories/PropertyTypeFactory.php`, `SalePropertyFactory.php`, `PropertyImageFactory.php`
- Test: `apps/api/tests/Feature/Api/SalePropertyModelTest.php`

**Interfaces:**
- Produces: modelos `App\Models\{PropertyType,SaleProperty,PropertyImage}`; relaciones `PropertyType::saleProperties()`, `SaleProperty::type()` + `SaleProperty::images()`, `PropertyImage::saleProperty()`. Tablas `property_types`, `sale_properties`, `property_images`.

- [ ] **Step 1: Escribir las migraciones**

`..._create_property_types_table.php`:
```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_types');
    }
};
```

`..._create_sale_properties_table.php`:
```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_type_id')->nullable()
                ->constrained('property_types')->restrictOnDelete();
            $table->string('title')->nullable();
            $table->string('locality')->nullable();
            $table->text('location')->nullable();
            $table->string('size')->nullable();
            $table->text('services')->nullable();
            $table->text('features')->nullable();
            $table->text('map_embed')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_sold')->default(false);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_properties');
    }
};
```

`..._create_property_images_table.php`:
```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_property_id')
                ->constrained('sale_properties')->cascadeOnDelete();
            $table->string('path');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};
```

- [ ] **Step 2: Escribir los modelos**

`app/Models/PropertyType.php`:
```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PropertyType extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyTypeFactory> */
    use HasFactory;

    protected $fillable = ['name'];

    /** @return HasMany<SaleProperty> */
    public function saleProperties(): HasMany
    {
        return $this->hasMany(SaleProperty::class);
    }
}
```

`app/Models/SaleProperty.php`:
```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class SaleProperty extends Model
{
    /** @use HasFactory<\Database\Factories\SalePropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'property_type_id', 'title', 'locality', 'location', 'size',
        'services', 'features', 'map_embed', 'sort_order', 'is_sold',
        'latitude', 'longitude',
    ];

    protected function casts(): array
    {
        return [
            'is_sold' => 'boolean',
            'sort_order' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /** @return BelongsTo<PropertyType, SaleProperty> */
    public function type(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class, 'property_type_id');
    }

    /** @return HasMany<PropertyImage> */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }
}
```

`app/Models/PropertyImage.php`:
```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PropertyImage extends Model
{
    /** @use HasFactory<\Database\Factories\PropertyImageFactory> */
    use HasFactory;

    protected $fillable = ['sale_property_id', 'path', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    /** @return BelongsTo<SaleProperty, PropertyImage> */
    public function saleProperty(): BelongsTo
    {
        return $this->belongsTo(SaleProperty::class);
    }
}
```

- [ ] **Step 3: Escribir las factories**

`database/factories/PropertyTypeFactory.php`:
```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PropertyType> */
final class PropertyTypeFactory extends Factory
{
    protected $model = PropertyType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Casas', 'Terrenos', 'Locales', 'Quintas', 'Cocheras', 'Departamentos',
            ]),
        ];
    }
}
```

`database/factories/SalePropertyFactory.php`:
```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SaleProperty> */
final class SalePropertyFactory extends Factory
{
    protected $model = SaleProperty::class;

    public function definition(): array
    {
        return [
            'property_type_id' => PropertyType::factory(),
            'title' => $this->faker->sentence(3),
            'locality' => $this->faker->city(),
            'location' => $this->faker->address(),
            'size' => $this->faker->numberBetween(50, 500).' m2',
            'services' => 'Luz, Agua, Gas',
            'features' => $this->faker->sentence(),
            'map_embed' => null,
            'sort_order' => 0,
            'is_sold' => false,
            'latitude' => $this->faker->latitude(-33, -31),
            'longitude' => $this->faker->longitude(-63, -61),
        ];
    }

    public function sold(): static
    {
        return $this->state(fn () => ['is_sold' => true]);
    }
}
```

`database/factories/PropertyImageFactory.php`:
```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PropertyImage;
use App\Models\SaleProperty;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PropertyImage> */
final class PropertyImageFactory extends Factory
{
    protected $model = PropertyImage::class;

    public function definition(): array
    {
        return [
            'sale_property_id' => SaleProperty::factory(),
            'path' => 'sale-properties/1/'.$this->faker->uuid().'.webp',
            'sort_order' => 0,
        ];
    }
}
```

- [ ] **Step 4: Escribir el test de modelos/relaciones**

`tests/Feature/Api/SalePropertyModelTest.php`:
```php
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
```

- [ ] **Step 5: Migrar y correr el test**

Run: `docker compose exec php php artisan migrate`
Then: `docker compose exec php ./vendor/bin/pest --filter=SalePropertyModelTest`
Expected: migraciones ok; 2 tests PASS.

---

### Task 2: API PropertyType (lectura pública + CRUD admin)

**Files:**
- Create: `apps/api/app/Http/Resources/PropertyTypeResource.php`
- Create: `apps/api/app/Http/Requests/PropertyType/StorePropertyTypeRequest.php`, `UpdatePropertyTypeRequest.php`
- Create: `apps/api/app/Http/Controllers/Api/V1/PropertyTypeController.php`
- Modify: `apps/api/routes/api.php` (rutas públicas + admin)
- Test: `apps/api/tests/Feature/Api/PropertyTypeTest.php`

**Interfaces:**
- Consumes: `App\Models\PropertyType`.
- Produces: endpoints `GET /api/v1/property-types` (público), `POST/PATCH/DELETE /api/v1/property-types` (auth). `PropertyTypeResource` → `{ id, name }`.

- [ ] **Step 1: Resource y FormRequests**

`PropertyTypeResource.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PropertyType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read PropertyType $resource */
final class PropertyTypeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
        ];
    }
}
```

`StorePropertyTypeRequest.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\PropertyType;

use Illuminate\Foundation\Http\FormRequest;

final class StorePropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:50', 'unique:property_types,name']];
    }
}
```

`UpdatePropertyTypeRequest.php` (igual, `unique` ignorando el id actual):
```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\PropertyType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdatePropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:50',
                Rule::unique('property_types', 'name')->ignore($this->route('property_type')),
            ],
        ];
    }
}
```

- [ ] **Step 2: Controller**

`PropertyTypeController.php` (reusa `HandlesRestrictedDelete` para el 409):
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyType\StorePropertyTypeRequest;
use App\Http\Requests\PropertyType\UpdatePropertyTypeRequest;
use App\Http\Resources\PropertyTypeResource;
use App\Models\PropertyType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class PropertyTypeController extends Controller
{
    use HandlesRestrictedDelete;

    public function index(): AnonymousResourceCollection
    {
        return PropertyTypeResource::collection(PropertyType::orderBy('name')->get());
    }

    public function store(StorePropertyTypeRequest $request): JsonResponse
    {
        $type = PropertyType::create($request->validated());

        return (new PropertyTypeResource($type))->response()->setStatusCode(201);
    }

    public function update(UpdatePropertyTypeRequest $request, PropertyType $propertyType): PropertyTypeResource
    {
        $propertyType->update($request->validated());

        return new PropertyTypeResource($propertyType);
    }

    public function destroy(PropertyType $propertyType): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $propertyType,
            'No se puede eliminar la categoría: tiene propiedades asociadas.',
        );
    }
}
```

- [ ] **Step 3: Rutas**

En `apps/api/routes/api.php`: agregar la lectura pública **fuera** del grupo `auth:sanctum` (junto a `/health`), y los writes **dentro** del grupo auth.

Público (fuera del grupo auth):
```php
Route::get('/property-types', [\App\Http\Controllers\Api\V1\PropertyTypeController::class, 'index']);
```
Admin (dentro del grupo `auth:sanctum`):
```php
Route::post('/property-types', [\App\Http\Controllers\Api\V1\PropertyTypeController::class, 'store']);
Route::patch('/property-types/{propertyType}', [\App\Http\Controllers\Api\V1\PropertyTypeController::class, 'update']);
Route::delete('/property-types/{propertyType}', [\App\Http\Controllers\Api\V1\PropertyTypeController::class, 'destroy']);
```

- [ ] **Step 4: Test**

`tests/Feature/Api/PropertyTypeTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista categorías sin auth (público)', function () {
    PropertyType::factory()->count(2)->create();

    $this->getJson('/api/v1/property-types')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure(['data' => [['id', 'name']]]);
});

it('rechaza crear categoría sin auth', function () {
    $this->postJson('/api/v1/property-types', ['name' => 'Galpones'])->assertUnauthorized();
});

it('crea categoría autenticado', function () {
    $this->actingAs(User::factory()->create());

    $this->postJson('/api/v1/property-types', ['name' => 'Galpones'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Galpones');
});

it('rechaza nombre duplicado', function () {
    $this->actingAs(User::factory()->create());
    $type = PropertyType::factory()->create();

    $this->postJson('/api/v1/property-types', ['name' => $type->name])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('devuelve 409 al borrar categoría con propiedades', function () {
    $this->actingAs(User::factory()->create());
    $type = PropertyType::factory()->create();
    SaleProperty::factory()->for($type, 'type')->create();

    $this->deleteJson("/api/v1/property-types/{$type->id}")
        ->assertStatus(409)
        ->assertJsonStructure(['message']);
});
```

- [ ] **Step 5: Correr**

Run: `docker compose exec php ./vendor/bin/pest --filter=PropertyTypeTest`
Expected: 5 PASS.

---

### Task 3: API SaleProperty (lectura pública con filtros + CRUD admin)

**Files:**
- Create: `apps/api/app/Http/Resources/SalePropertyResource.php`, `PropertyImageResource.php`
- Create: `apps/api/app/Http/Requests/SaleProperty/StoreSalePropertyRequest.php`, `UpdateSalePropertyRequest.php`
- Create: `apps/api/app/Http/Controllers/Api/V1/SalePropertyController.php`
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/Api/SalePropertyTest.php`

**Interfaces:**
- Consumes: `SaleProperty`, `PropertyTypeResource`.
- Produces: `GET /sale-properties` (público, filtros `type`/`sold`/`q`, sort, paginación), `GET /sale-properties/{saleProperty}` (público), `POST/PATCH/DELETE /sale-properties` (auth). `SalePropertyResource` con `images[]` y `type`.

- [ ] **Step 1: Resources**

`PropertyImageResource.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @property-read PropertyImage $resource */
final class PropertyImageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'url' => Storage::disk('public')->url($this->resource->path),
            'sort_order' => $this->resource->sort_order,
        ];
    }
}
```

`SalePropertyResource.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SaleProperty;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read SaleProperty $resource */
final class SalePropertyResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'property_type_id' => $this->resource->property_type_id,
            'title' => $this->resource->title,
            'locality' => $this->resource->locality,
            'location' => $this->resource->location,
            'size' => $this->resource->size,
            'services' => $this->resource->services,
            'features' => $this->resource->features,
            'map_embed' => $this->resource->map_embed,
            'sort_order' => $this->resource->sort_order,
            'is_sold' => $this->resource->is_sold,
            'latitude' => $this->resource->latitude,
            'longitude' => $this->resource->longitude,
            'type' => new PropertyTypeResource($this->whenLoaded('type')),
            'images' => PropertyImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
```

- [ ] **Step 2: FormRequests**

`StoreSalePropertyRequest.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSalePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'property_type_id' => ['nullable', 'integer', 'exists:property_types,id'],
            'title' => ['required', 'string', 'max:255'],
            'locality' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string'],
            'size' => ['nullable', 'string', 'max:255'],
            'services' => ['nullable', 'string'],
            'features' => ['nullable', 'string'],
            'map_embed' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_sold' => ['nullable', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
```

`UpdateSalePropertyRequest.php`: idéntico pero `title` pasa a `['sometimes','required','string','max:255']` y el resto agrega `sometimes` al frente. (Repetir el array con `sometimes` antepuesto en cada campo.)

- [ ] **Step 3: Controller**

`SalePropertyController.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleProperty\StoreSalePropertyRequest;
use App\Http\Requests\SaleProperty\UpdateSalePropertyRequest;
use App\Http\Resources\SalePropertyResource;
use App\Models\SaleProperty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class SalePropertyController extends Controller
{
    private const PER_PAGE_MAX = 100;

    public function index(Request $request): AnonymousResourceCollection
    {
        $properties = QueryBuilder::for(SaleProperty::class)
            ->allowedFilters([
                AllowedFilter::exact('type', 'property_type_id'),
                AllowedFilter::exact('sold', 'is_sold'),
            ])
            ->allowedSorts([
                AllowedSort::field('sort_order'),
                AllowedSort::field('title'),
                AllowedSort::field('id'),
            ])
            ->defaultSort('sort_order')
            ->with(['type', 'images'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('title', 'like', "%{$q}%")
                        ->orWhere('locality', 'like', "%{$q}%");
                });
            })
            ->paginate(min((int) $request->integer('per_page', 15), self::PER_PAGE_MAX))
            ->appends($request->query());

        return SalePropertyResource::collection($properties);
    }

    public function show(SaleProperty $saleProperty): SalePropertyResource
    {
        return new SalePropertyResource($saleProperty->load(['type', 'images']));
    }

    public function store(StoreSalePropertyRequest $request): JsonResponse
    {
        $property = SaleProperty::create($request->validated());

        return (new SalePropertyResource($property->load(['type', 'images'])))
            ->response()->setStatusCode(201);
    }

    public function update(UpdateSalePropertyRequest $request, SaleProperty $saleProperty): SalePropertyResource
    {
        $saleProperty->update($request->validated());

        return new SalePropertyResource($saleProperty->load(['type', 'images']));
    }

    public function destroy(SaleProperty $saleProperty): Response
    {
        Storage::disk('public')->deleteDirectory("sale-properties/{$saleProperty->id}");
        $saleProperty->delete();

        return response()->noContent();
    }
}
```

- [ ] **Step 4: Rutas**

Público (fuera del grupo auth):
```php
Route::get('/sale-properties', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'index']);
Route::get('/sale-properties/{saleProperty}', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'show']);
```
Admin (dentro del grupo `auth:sanctum`):
```php
Route::post('/sale-properties', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'store']);
Route::patch('/sale-properties/{saleProperty}', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'update']);
Route::delete('/sale-properties/{saleProperty}', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'destroy']);
```

- [ ] **Step 5: Test**

`tests/Feature/Api/SalePropertyTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista propiedades sin auth con meta de paginación', function () {
    SaleProperty::factory()->count(3)->create();

    $this->getJson('/api/v1/sale-properties')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'title', 'is_sold', 'images', 'type']],
            'meta' => ['current_page', 'per_page', 'total'],
        ]);
});

it('filtra por tipo y por vendida', function () {
    $casas = PropertyType::factory()->create(['name' => 'Casas']);
    SaleProperty::factory()->for($casas, 'type')->create();
    SaleProperty::factory()->sold()->create();

    $this->getJson("/api/v1/sale-properties?filter[type]={$casas->id}")
        ->assertOk()->assertJsonCount(1, 'data');

    $this->getJson('/api/v1/sale-properties?filter[sold]=1')
        ->assertOk()->assertJsonCount(1, 'data');
});

it('muestra el detalle público con imágenes', function () {
    $property = SaleProperty::factory()->create();

    $this->getJson("/api/v1/sale-properties/{$property->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $property->id)
        ->assertJsonStructure(['data' => ['images', 'type']]);
});

it('rechaza crear sin auth', function () {
    $this->postJson('/api/v1/sale-properties', ['title' => 'X'])->assertUnauthorized();
});

it('crea, edita y borra autenticado', function () {
    $this->actingAs(User::factory()->create());
    $type = PropertyType::factory()->create();

    $id = $this->postJson('/api/v1/sale-properties', [
        'property_type_id' => $type->id,
        'title' => 'Casa céntrica',
    ])->assertCreated()->json('data.id');

    $this->patchJson("/api/v1/sale-properties/{$id}", ['is_sold' => true])
        ->assertOk()->assertJsonPath('data.is_sold', true);

    $this->deleteJson("/api/v1/sale-properties/{$id}")->assertNoContent();
    $this->assertDatabaseMissing('sale_properties', ['id' => $id]);
});
```

- [ ] **Step 6: Correr**

Run: `docker compose exec php ./vendor/bin/pest --filter=SalePropertyTest`
Expected: 5 PASS.

---

### Task 4: Imágenes (multi-upload WebP + borrar + reordenar) y reorder de propiedades

**Files:**
- Create: `apps/api/app/Http/Requests/SaleProperty/StorePropertyImagesRequest.php`, `ReorderRequest.php`
- Create: `apps/api/app/Http/Controllers/Api/V1/SalePropertyImageController.php`
- Modify: `apps/api/app/Http/Controllers/Api/V1/SalePropertyController.php` (método `reorder`)
- Modify: `apps/api/routes/api.php`
- Test: `apps/api/tests/Feature/Api/SalePropertyImageTest.php`

**Interfaces:**
- Consumes: `SaleProperty`, `PropertyImage`, pipeline WebP de `PropertyPhotoController.php:27-32`.
- Produces: `POST /sale-properties/{saleProperty}/images`, `DELETE /sale-property-images/{propertyImage}`, `PATCH /sale-property-images/reorder`, `PATCH /sale-properties/reorder` (todos auth).

- [ ] **Step 1: FormRequests**

`StorePropertyImagesRequest.php` (mime real, hasta 5 MB c/u, igual que `StorePropertyPhotoRequest`):
```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

final class StorePropertyImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'min:1'],
            'images.*' => [
                'required',
                File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(5 * 1024),
            ],
        ];
    }
}
```

`ReorderRequest.php` (lista de ids en el orden deseado):
```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;

final class ReorderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ];
    }
}
```

- [ ] **Step 2: SalePropertyImageController (upload/delete/reorder)**

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleProperty\ReorderRequest;
use App\Http\Requests\SaleProperty\StorePropertyImagesRequest;
use App\Http\Resources\PropertyImageResource;
use App\Models\PropertyImage;
use App\Models\SaleProperty;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class SalePropertyImageController extends Controller
{
    private const WEBP_QUALITY = 82;

    public function store(StorePropertyImagesRequest $request, SaleProperty $saleProperty): AnonymousResourceCollection
    {
        $next = (int) $saleProperty->images()->max('sort_order') + 1;
        $created = [];

        foreach ($request->file('images') as $file) {
            $webp = ImageManager::usingDriver(GdDriver::class)
                ->decodePath($file->getRealPath())
                ->encodeUsingFormat(Format::WEBP, quality: self::WEBP_QUALITY);

            $path = "sale-properties/{$saleProperty->id}/".Str::uuid()->toString().'.webp';
            Storage::disk('public')->put($path, (string) $webp);

            $created[] = $saleProperty->images()->create([
                'path' => $path,
                'sort_order' => $next++,
            ]);
        }

        return PropertyImageResource::collection(collect($created));
    }

    public function destroy(PropertyImage $propertyImage): Response
    {
        Storage::disk('public')->delete($propertyImage->path);
        $propertyImage->delete();

        return response()->noContent();
    }

    public function reorder(ReorderRequest $request): Response
    {
        foreach ($request->integer('ids') === null ? [] : $request->validated()['ids'] as $position => $id) {
            PropertyImage::where('id', $id)->update(['sort_order' => $position]);
        }

        return response()->noContent();
    }
}
```
> Nota: el `foreach` recorre `$request->validated()['ids']` con su índice como `sort_order`.

- [ ] **Step 3: Método `reorder` en SalePropertyController**

Agregar a `SalePropertyController`:
```php
public function reorder(\App\Http\Requests\SaleProperty\ReorderRequest $request): Response
{
    foreach ($request->validated()['ids'] as $position => $id) {
        SaleProperty::where('id', $id)->update(['sort_order' => $position]);
    }

    return response()->noContent();
}
```

- [ ] **Step 4: Rutas (todas dentro del grupo `auth:sanctum`)**

```php
Route::patch('/sale-properties/reorder', [\App\Http\Controllers\Api\V1\SalePropertyController::class, 'reorder']);
Route::post('/sale-properties/{saleProperty}/images', [\App\Http\Controllers\Api\V1\SalePropertyImageController::class, 'store']);
Route::delete('/sale-property-images/{propertyImage}', [\App\Http\Controllers\Api\V1\SalePropertyImageController::class, 'destroy']);
Route::patch('/sale-property-images/reorder', [\App\Http\Controllers\Api\V1\SalePropertyImageController::class, 'reorder']);
```
> **Importante**: registrar `/sale-properties/reorder` ANTES que `/sale-properties/{saleProperty}` (definida en Task 3) para que `reorder` no caiga en el route-model-binding del show/patch. Mover/colocar la línea de `reorder` por encima.

- [ ] **Step 5: Test**

`tests/Feature/Api/SalePropertyImageTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\PropertyImage;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->withHeader('Accept', 'application/json');
    $this->actingAs(User::factory()->create());
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
```

- [ ] **Step 6: Correr**

Run: `docker compose exec php ./vendor/bin/pest --filter=SalePropertyImageTest`
Expected: 4 PASS.

---

### Task 5: Comando `ventas:import` (migración de datos + imágenes)

**Files:**
- Modify: `apps/api/config/database.php` (conexión `nzestudio`)
- Modify: `apps/api/.env.example` (vars `NZ_LEGACY_DB_*`, `NZ_LEGACY_UPLOADS_PATH`)
- Create: `apps/api/app/Console/Commands/ImportVentas.php`
- Test: `apps/api/tests/Feature/VentasImportTest.php`

**Interfaces:**
- Consumes: conexión `nzestudio` (tablas `tipos_propiedad`, `propiedades`, `imagenes_propiedades`), modelos del Task 1, pipeline WebP.
- Produces: comando artisan `ventas:import`; deja `property_types`/`sale_properties`/`property_images` pobladas + WebP en `storage/app/public/sale-properties/{id}/`.

- [ ] **Step 1: Conexión secundaria + env**

En `apps/api/config/database.php`, dentro de `'connections' => [ ... ]`, agregar:
```php
'nzestudio' => [
    'driver' => 'mariadb',
    'host' => env('NZ_LEGACY_DB_HOST', 'mariadb'),
    'port' => env('NZ_LEGACY_DB_PORT', '3306'),
    'database' => env('NZ_LEGACY_DB_DATABASE', 'nzestudio'),
    'username' => env('NZ_LEGACY_DB_USERNAME', env('DB_USERNAME')),
    'password' => env('NZ_LEGACY_DB_PASSWORD', env('DB_PASSWORD')),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_general_ci',
    'prefix' => '',
    'strict' => false,
],
```

En `apps/api/.env.example` agregar (valores de ejemplo, sin secretos):
```env
# Migración one-shot de ventas (Fase 2) — base legacy nz-estudio importada localmente
NZ_LEGACY_DB_HOST=mariadb
NZ_LEGACY_DB_DATABASE=nzestudio
NZ_LEGACY_UPLOADS_PATH=/var/www/html/storage/app/import/uploads
```

- [ ] **Step 2: Comando**

`app/Console/Commands/ImportVentas.php`:
```php
<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\PropertyImage;
use App\Models\PropertyType;
use App\Models\SaleProperty;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;

final class ImportVentas extends Command
{
    protected $signature = 'ventas:import {--connection=nzestudio}';

    protected $description = 'Migra propiedades en venta, categorías e imágenes del legacy nz-estudio.';

    public function handle(): int
    {
        $conn = (string) $this->option('connection');
        $uploads = rtrim((string) env('NZ_LEGACY_UPLOADS_PATH', ''), '/');

        $this->info('Limpiando tablas de ventas…');
        Schema::disableForeignKeyConstraints();
        PropertyImage::truncate();
        SaleProperty::truncate();
        PropertyType::truncate();
        Schema::enableForeignKeyConstraints();
        Storage::disk('public')->deleteDirectory('sale-properties');

        // 1) Categorías — mapeo legacy id -> nuevo id
        $typeMap = [];
        foreach (DB::connection($conn)->table('tipos_propiedad')->get() as $row) {
            $type = PropertyType::create(['name' => (string) ($row->nombre_categoria ?? 'Sin categoría')]);
            $typeMap[(int) $row->id] = $type->id;
        }
        $this->info(count($typeMap).' categorías.');

        // 2) Propiedades — mapeo legacy id -> nuevo id
        $propMap = [];
        $props = DB::connection($conn)->table('propiedades')->get();
        foreach ($props as $row) {
            $property = SaleProperty::create([
                'property_type_id' => $typeMap[(int) $row->categoria] ?? null,
                'title' => $row->titulo,
                'locality' => $row->localidad,
                'location' => $row->ubicacion,
                'size' => $row->tamanio,
                'services' => $row->servicios,
                'features' => $row->caracteristicas,
                'map_embed' => $row->mapa,
                'sort_order' => (int) ($row->orden ?? 0),
                'is_sold' => (bool) ($row->vendida ?? false),
                'latitude' => $row->latitud,
                'longitude' => $row->longitud,
            ]);
            $propMap[(int) $row->id] = $property->id;
        }
        $this->info(count($propMap).' propiedades.');

        // 3) Imágenes — copia/convierte el WebP de uploads a storage
        $images = 0;
        $missing = 0;
        foreach (DB::connection($conn)->table('imagenes_propiedades')->orderBy('orden')->get() as $row) {
            $newId = $propMap[(int) $row->id_propiedad] ?? null;
            if ($newId === null) {
                continue;
            }
            $source = $uploads.'/'.ltrim((string) $row->ruta_imagen, '/');
            // ruta_imagen suele venir como 'uploads/propiedades/...': normalizamos al basename del path legacy
            if (! is_file($source)) {
                $source = $uploads.'/'.basename((string) $row->ruta_imagen);
            }
            if (! is_file($source)) {
                $missing++;
                $this->warn("Imagen faltante: {$row->ruta_imagen}");
                continue;
            }

            $webp = ImageManager::usingDriver(GdDriver::class)
                ->decodePath($source)
                ->encodeUsingFormat(Format::WEBP, quality: 82);

            $path = "sale-properties/{$newId}/".Str::uuid()->toString().'.webp';
            Storage::disk('public')->put($path, (string) $webp);

            PropertyImage::create([
                'sale_property_id' => $newId,
                'path' => $path,
                'sort_order' => (int) ($row->orden ?? 0),
            ]);
            $images++;
        }
        $this->info("{$images} imágenes ({$missing} faltantes).");

        return self::SUCCESS;
    }
}
```
> *Ponytail:* el matching de `ruta_imagen` legacy (path completo vs basename) tiene un techo conocido — si los paths del dump no resuelven, el comando avisa "Imagen faltante" sin abortar y se ajusta el `NZ_LEGACY_UPLOADS_PATH`. No se sobre-ingenieriza el parseo de rutas.

- [ ] **Step 3: Test del comando con conexión fake**

`tests/Feature/VentasImportTest.php` — usa una tabla temporal en la conexión default como "legacy" via `--connection`:
```php
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

    // Crea las tablas legacy en la MISMA conexión de test y las puebla.
    Schema::create('tipos_propiedad', function ($t) {
        $t->integer('id'); $t->string('nombre_categoria')->nullable();
    });
    Schema::create('propiedades', function ($t) {
        $t->integer('id'); $t->integer('categoria')->nullable();
        $t->string('titulo')->nullable(); $t->string('localidad')->nullable();
        $t->text('ubicacion')->nullable(); $t->string('tamanio')->nullable();
        $t->text('servicios')->nullable(); $t->text('caracteristicas')->nullable();
        $t->text('mapa')->nullable(); $t->integer('orden')->nullable();
        $t->boolean('vendida')->nullable(); $t->decimal('latitud', 10, 8)->nullable();
        $t->decimal('longitud', 11, 8)->nullable();
    });
    Schema::create('imagenes_propiedades', function ($t) {
        $t->integer('id'); $t->integer('id_propiedad')->nullable();
        $t->string('ruta_imagen')->nullable(); $t->integer('orden')->nullable();
    });

    DB::table('tipos_propiedad')->insert(['id' => 1, 'nombre_categoria' => 'Casas']);
    DB::table('propiedades')->insert([
        'id' => 10, 'categoria' => 1, 'titulo' => 'Casa test', 'orden' => 0, 'vendida' => 0,
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
        ->and(SaleProperty::where('title', 'Casa test')->exists())->toBeTrue();
});
```

- [ ] **Step 4: Correr**

Run: `docker compose exec php ./vendor/bin/pest --filter=VentasImportTest`
Expected: 1 PASS.

---

### Task 6: Suite completa, doc, lint y verificación manual

- [ ] **Step 1: Pint**

Run: `docker compose exec php ./vendor/bin/pint`
Expected: sin diffs de estilo (o auto-fix aplicado).

- [ ] **Step 2: Suite completa Pest**

Run: `docker compose exec php ./vendor/bin/pest`
Expected: todo verde (los ~134 existentes + los nuevos de Tasks 1-5).

- [ ] **Step 3: Doc OpenAPI (Scramble)**

Abrir `http://localhost:8080/docs/api` (o la ruta que exponga scramble) y verificar que aparecen los endpoints `sale-properties` y `property-types`.
Expected: ambos grupos documentados automáticamente.

- [ ] **Step 4: Smoke manual con el dump real**

1. Importar el dump a la base `nzestudio` en la mariadb local (phpMyAdmin → importar `nzestudio.sql`, o `docker compose exec mariadb sh -c 'mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS nzestudio"' ` y luego importar).
2. Dejar los WebP originales de `C:\laragon\www\nz-estudio\uploads` en `apps/api/storage/app/import/uploads` (ruta gitignored) o ajustar `NZ_LEGACY_UPLOADS_PATH`.
3. Run: `docker compose exec php php artisan ventas:import`
   Expected: reporta ~6 categorías, ~67 propiedades, ~130 imágenes (faltantes avisadas).
4. `GET http://localhost:8080/api/v1/sale-properties` y `/sale-properties/{id}` devuelven datos + URLs de imágenes válidas.

- [ ] **Step 5: `/security-review` + cierre**

- Correr `/security-review` sobre la rama `fusion-nz` (foco: SQLi en el import — todo via query builder parametrizado; uploads por mime real; sin secrets). Sin hallazgos.
- `/fase-close`: actualizar `roadmap.md` (Fase 2 DONE), `changelog.md`, marcar este plan DONE, sugerir commit Conventional. El commit lo hace el usuario.

---

## Self-Review

- **Cobertura del spec**: schema (Task 1) · API pública+admin property-types (Task 2) y sale-properties (Task 3) · imágenes WebP + reorder (Task 4) · comando `ventas:import` (Task 5) · doc Scramble + security + manual (Task 6). ✔ todas las secciones del spec tienen task.
- **Placeholders**: sin TBD/TODO; todo el código está escrito. `UpdateSalePropertyRequest` se describe como "Store con `sometimes`" (patrón claro) — al implementar, copiar el array de Store anteponiendo `sometimes`.
- **Consistencia de tipos**: `reorder(ReorderRequest)` usa `validated()['ids']`; rutas `reorder` registradas antes del binding `{saleProperty}`; nombres de relaciones (`type`, `images`, `saleProperties`) consistentes entre modelos, controllers, resources y tests.
- **Naming binding**: parámetros de ruta `{saleProperty}`, `{propertyType}`, `{propertyImage}` matchean los type-hints de los controllers (route-model binding implícito).
