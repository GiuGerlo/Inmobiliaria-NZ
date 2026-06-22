# Fusión NZ Fase 3 — Auth + roles — Implementation Plan

> **Estado: DONE 2026-06-19** (rama `fusion-nz`). Tasks 1–5 completas; Pest 158 verdes; seed real verificado; `/security-review` sin hallazgos.
>
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development o superpowers:executing-plans. Pasos con checkbox.
> Spec: `docs/superpowers/specs/2026-06-19-fusion-3-auth-roles-design.md`. ADR-0009.

**Goal:** Roles `superadmin`/`inmobiliaria` (tabla `roles` + FK `role_id`) que gatean la escritura de ventas al superadmin, exponiendo el rol en la API.

**Architecture:** Tabla `roles` + `users.role_id` (un rol por usuario). Gate `manage-sales` (= `isSuperadmin()`) aplicado a las rutas de escritura de ventas. Lecturas públicas y endpoints de alquileres sin cambios. Rol expuesto en `UserResource`.

**Tech Stack:** Laravel 12 / PHP 8.4, Eloquent, Sanctum, Pest.

## Global Constraints

- `declare(strict_types=1);` en archivos PHP nuevos. Clases `final` (salvo las de framework ya existentes). Pint.
- snake_case en columnas (`role_id`), PascalCase clases, camelCase métodos.
- `role_id` nullable → least privilege (`isSuperadmin()` null-safe = false).
- Una fase = un commit (lo hace el usuario al cierre). Pasos terminan en "tests verdes", no en `git commit`.
- Servicio Docker = `php-fpm`. Tests: `docker compose exec php-fpm ./vendor/bin/pest`.

---

### Task 1: Tabla roles, FK, modelos y factory states

**Files:**
- Create: `apps/api/database/migrations/2026_06_19_100001_create_roles_table.php`
- Create: `apps/api/database/migrations/2026_06_19_100002_add_role_id_to_users_table.php`
- Create: `apps/api/app/Models/Role.php`
- Modify: `apps/api/app/Models/User.php`
- Modify: `apps/api/database/factories/UserFactory.php`
- Test: `apps/api/tests/Feature/Api/RoleModelTest.php`

**Interfaces:**
- Produces: `App\Models\Role` (consts `Role::SUPERADMIN`, `Role::INMOBILIARIA`, `hasMany users`); `User::role()` (BelongsTo), `User::isSuperadmin(): bool`; `UserFactory::superadmin()` / `::inmobiliaria()`.

- [ ] **Step 1: Migraciones**

`2026_06_19_100001_create_roles_table.php`:
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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
```

`2026_06_19_100002_add_role_id_to_users_table.php`:
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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('password')
                ->constrained('roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
        });
    }
};
```

- [ ] **Step 2: Modelo Role**

`app/Models/Role.php`:
```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Role extends Model
{
    public const SUPERADMIN = 'superadmin';

    public const INMOBILIARIA = 'inmobiliaria';

    protected $fillable = ['name', 'label'];

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
```

- [ ] **Step 3: Modelo User (relación + helper)**

En `app/Models/User.php`: agregar `role_id` a `$fillable`, la relación y el helper.
```php
// use:
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// $fillable:
protected $fillable = ['Nombre_User', 'Email_User', 'password', 'role_id'];

// métodos:
/** @return BelongsTo<Role, $this> */
public function role(): BelongsTo
{
    return $this->belongsTo(Role::class);
}

public function isSuperadmin(): bool
{
    return $this->role?->name === Role::SUPERADMIN;
}
```

- [ ] **Step 4: Factory states**

En `apps/api/database/factories/UserFactory.php` agregar:
```php
// use App\Models\Role; arriba

public function superadmin(): static
{
    return $this->state(fn () => [
        'role_id' => Role::firstOrCreate(
            ['name' => Role::SUPERADMIN],
            ['label' => 'Superadministrador'],
        )->id,
    ]);
}

public function inmobiliaria(): static
{
    return $this->state(fn () => [
        'role_id' => Role::firstOrCreate(
            ['name' => Role::INMOBILIARIA],
            ['label' => 'Inmobiliaria'],
        )->id,
    ]);
}
```

- [ ] **Step 5: Test de modelo/relación**

`tests/Feature/Api/RoleModelTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marca superadmin solo cuando el rol es superadmin', function () {
    $super = User::factory()->superadmin()->create();
    $staff = User::factory()->inmobiliaria()->create();
    $sinRol = User::factory()->create();

    expect($super->isSuperadmin())->toBeTrue()
        ->and($staff->isSuperadmin())->toBeFalse()
        ->and($sinRol->isSuperadmin())->toBeFalse();
});

it('relaciona role hasMany users', function () {
    $user = User::factory()->superadmin()->create();
    $role = Role::where('name', Role::SUPERADMIN)->first();

    expect($role->users)->toHaveCount(1)
        ->and($user->role->name)->toBe(Role::SUPERADMIN);
});
```

- [ ] **Step 6: Migrar y correr**

Run: `docker compose exec php-fpm php artisan migrate`
Then: `docker compose exec php-fpm ./vendor/bin/pest --filter=RoleModelTest`
Expected: migra ok; 2 PASS.

---

### Task 2: Seeder de roles

**Files:**
- Create: `apps/api/database/seeders/RoleSeeder.php`
- Modify: `apps/api/database/seeders/DatabaseSeeder.php`
- Test: `apps/api/tests/Feature/RoleSeederTest.php`

**Interfaces:**
- Consumes: `Role`, `User`.
- Produces: `RoleSeeder` que crea los 2 roles y asigna `ggiuliano526@gmail.com` → superadmin, resto → inmobiliaria.

- [ ] **Step 1: Seeder**

`database/seeders/RoleSeeder.php`:
```php
<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

final class RoleSeeder extends Seeder
{
    private const SUPERADMIN_EMAIL = 'ggiuliano526@gmail.com';

    public function run(): void
    {
        $superadmin = Role::firstOrCreate(['name' => Role::SUPERADMIN], ['label' => 'Superadministrador']);
        $inmobiliaria = Role::firstOrCreate(['name' => Role::INMOBILIARIA], ['label' => 'Inmobiliaria']);

        // Todos los usuarios sin rol → inmobiliaria (least privilege por default).
        User::query()->whereNull('role_id')->update(['role_id' => $inmobiliaria->id]);

        // El superadmin, por email (hardcodeado).
        User::query()->where('Email_User', self::SUPERADMIN_EMAIL)
            ->update(['role_id' => $superadmin->id]);
    }
}
```

- [ ] **Step 2: Wire en DatabaseSeeder**

En `apps/api/database/seeders/DatabaseSeeder.php`, llamar `RoleSeeder` **siempre** (los roles se necesitan también en prod), antes del bloque demo local:
```php
public function run(): void
{
    // Datos demo solo en local — jamás en producción.
    if (app()->environment('local')) {
        User::query()->firstOrCreate(
            ['Email_User' => 'demo@example.com'],
            ['Nombre_User' => 'Demo', 'Pass_User' => '', 'password' => bcrypt('password')],
        );

        $this->call(DemoSeeder::class);
    }

    $this->call(RoleSeeder::class);
}
```

- [ ] **Step 3: Test del seeder**

`tests/Feature/RoleSeederTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('asigna superadmin a Giuliano y inmobiliaria al resto', function () {
    $giuli = User::factory()->create(['Email_User' => 'ggiuliano526@gmail.com']);
    $otro = User::factory()->create(['Email_User' => 'staff@example.com']);

    $this->seed(\Database\Seeders\RoleSeeder::class);

    expect($giuli->refresh()->role->name)->toBe(Role::SUPERADMIN)
        ->and($otro->refresh()->role->name)->toBe(Role::INMOBILIARIA);
});
```

- [ ] **Step 4: Correr**

Run: `docker compose exec php-fpm ./vendor/bin/pest --filter=RoleSeederTest`
Expected: 1 PASS.

---

### Task 3: Gate `manage-sales` + middleware en rutas de ventas + actualizar tests Fase 2

**Files:**
- Modify: `apps/api/app/Providers/AppServiceProvider.php`
- Modify: `apps/api/routes/api.php`
- Modify: `apps/api/tests/Feature/Api/PropertyTypeTest.php`, `SalePropertyTest.php`, `SalePropertyImageTest.php`
- Test: `apps/api/tests/Feature/Api/SalesAuthorizationTest.php`

**Interfaces:**
- Consumes: `User::isSuperadmin()`, factory states.
- Produces: Gate `manage-sales`; rutas de escritura de ventas con `can:manage-sales`.

- [ ] **Step 1: Definir el Gate**

En `apps/api/app/Providers/AppServiceProvider.php`, en `boot()`:
```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('manage-sales', fn (User $user) => $user->isSuperadmin());
}
```

- [ ] **Step 2: Aplicar middleware a las rutas de escritura de ventas**

En `apps/api/routes/api.php`, dentro del grupo `auth:sanctum`, envolver las rutas de escritura de ventas
(las 3 de `property-types` + las 3 de `sale-properties` + reorder + las 3 de imágenes) en un sub-grupo:
```php
// ── Ventas (Fusión NZ): escritura solo superadmin ──
Route::middleware('can:manage-sales')->group(function () {
    Route::post('/property-types', [PropertyTypeController::class, 'store']);
    Route::patch('/property-types/{propertyType}', [PropertyTypeController::class, 'update']);
    Route::delete('/property-types/{propertyType}', [PropertyTypeController::class, 'destroy']);

    Route::patch('/sale-properties/reorder', [SalePropertyController::class, 'reorder']);
    Route::post('/sale-properties', [SalePropertyController::class, 'store']);
    Route::patch('/sale-properties/{saleProperty}', [SalePropertyController::class, 'update']);
    Route::delete('/sale-properties/{saleProperty}', [SalePropertyController::class, 'destroy']);

    Route::patch('/sale-property-images/reorder', [SalePropertyImageController::class, 'reorder']);
    Route::post('/sale-properties/{saleProperty}/images', [SalePropertyImageController::class, 'store']);
    Route::delete('/sale-property-images/{propertyImage}', [SalePropertyImageController::class, 'destroy']);
});
```
> Reemplaza los `Route::post/patch/delete` de ventas que hoy están sueltos en el grupo auth. Mantener `reorder` antes del binding `{saleProperty}`.

- [ ] **Step 3: Actualizar tests de Fase 2 (writes como superadmin)**

En `PropertyTypeTest.php`, `SalePropertyTest.php`, `SalePropertyImageTest.php`: cambiar las creaciones de usuario
que ejercen **writes** de `User::factory()->create()` a `User::factory()->superadmin()->create()`.
- `SalePropertyImageTest.php`: en el `beforeEach`, `$this->actingAs(User::factory()->superadmin()->create());`.
- `PropertyTypeTest.php` y `SalePropertyTest.php`: en los `it(...)` que hacen POST/PATCH/DELETE, usar `->superadmin()`. Los `it` de lectura pública no usan auth — no se tocan.

- [ ] **Step 4: Test de autorización**

`tests/Feature/Api/SalesAuthorizationTest.php`:
```php
<?php

declare(strict_types=1);

use App\Models\PropertyType;
use App\Models\SaleProperty;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('inmobiliaria no puede escribir ventas (403)', function () {
    $this->actingAs(User::factory()->inmobiliaria()->create());

    $this->postJson('/api/v1/property-types', ['name' => 'X'])->assertForbidden();
    $this->postJson('/api/v1/sale-properties', ['title' => 'X'])->assertForbidden();

    $property = SaleProperty::factory()->create();
    $this->patchJson("/api/v1/sale-properties/{$property->id}", ['is_sold' => true])->assertForbidden();
    $this->deleteJson("/api/v1/sale-properties/{$property->id}")->assertForbidden();
    $this->patchJson('/api/v1/sale-properties/reorder', ['ids' => [$property->id]])->assertForbidden();
});

it('superadmin sí puede escribir ventas', function () {
    $this->actingAs(User::factory()->superadmin()->create());
    $type = PropertyType::factory()->create();

    $this->postJson('/api/v1/sale-properties', [
        'property_type_id' => $type->id,
        'title' => 'Casa',
    ])->assertCreated();
});

it('la lectura pública de ventas sigue sin auth', function () {
    SaleProperty::factory()->count(2)->create();

    $this->getJson('/api/v1/sale-properties')->assertOk()->assertJsonCount(2, 'data');
    $this->getJson('/api/v1/property-types')->assertOk();
});
```

- [ ] **Step 5: Correr**

Run: `docker compose exec php-fpm ./vendor/bin/pest --filter="SalesAuthorization|PropertyType|SaleProperty"`
Expected: todos PASS (autorización + los de Fase 2 actualizados).

---

### Task 4: Exponer rol en UserResource

**Files:**
- Modify: `apps/api/app/Http/Resources/UserResource.php`
- Test: `apps/api/tests/Feature/Auth/ProfileTest.php` (agregar aserción) o nuevo caso en `SalesAuthorizationTest`.

**Interfaces:**
- Produces: `UserResource` con `role` e `is_superadmin`.

- [ ] **Step 1: UserResource**

En `apps/api/app/Http/Resources/UserResource.php`, agregar al array:
```php
'role' => $this->resource->role?->name,
'is_superadmin' => $this->resource->isSuperadmin(),
```

- [ ] **Step 2: Test de /me con rol**

Agregar a `tests/Feature/Api/SalesAuthorizationTest.php`:
```php
it('/me expone el rol del usuario', function () {
    $this->actingAs(User::factory()->superadmin()->create());

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('data.role', 'superadmin')
        ->assertJsonPath('data.is_superadmin', true);
});
```
> Nota: confirmar que `/me` envuelve en `data` (UserResource). Si `ProfileController@show` devuelve sin wrapper `data`, ajustar el path (`role` en vez de `data.role`).

- [ ] **Step 3: Correr**

Run: `docker compose exec php-fpm ./vendor/bin/pest --filter=SalesAuthorization`
Expected: todos PASS.

---

### Task 5: Suite completa, lint y cierre

- [ ] **Step 1: Pint** — `docker compose exec php-fpm ./vendor/bin/pint app/Models/Role.php app/Models/User.php app/Providers/AppServiceProvider.php app/Http/Resources/UserResource.php database/seeders/RoleSeeder.php`. Sin issues (o auto-fix).
- [ ] **Step 2: Suite completa** — `docker compose exec php-fpm ./vendor/bin/pest`. Todo verde.
- [ ] **Step 3: Seed real** — `docker compose exec php-fpm php artisan migrate` + `php artisan db:seed --class=RoleSeeder`. Verificar en DB que Giuliano = superadmin, Demo = inmobiliaria.
- [ ] **Step 4: Smoke manual** — login como Giuliano → `POST /sale-properties` 201; login como Demo → 403; `GET /me` muestra `role`/`is_superadmin`; `GET /sale-properties` público sigue 200.
- [ ] **Step 5: `/security-review`** sobre la rama (foco: gate sin bypass, default sin privilegios). Sin hallazgos.
- [ ] **Step 6: `/fase-close`** — roadmap + changelog + plan DONE + commit sugerido (lo hace el usuario).

---

## Self-Review

- **Cobertura del spec**: tabla roles+FK+modelos (Task 1), seeder hardcodeado (Task 2), Gate + middleware en writes + tests Fase 2 actualizados (Task 3), rol en UserResource (Task 4), verificación/cierre (Task 5). ✔
- **Placeholders**: sin TBD; todo el código escrito. Único condicional: en Task 4 Step 2 se verifica si `/me` envuelve en `data` (instrucción concreta de ajuste, no placeholder).
- **Consistencia de tipos**: `Role::SUPERADMIN`/`INMOBILIARIA` (consts) usados igual en modelo, factory, seeder y tests; `isSuperadmin()` y la relación `role()` consistentes; rutas `reorder` antes del binding mantenido.
