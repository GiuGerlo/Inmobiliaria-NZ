<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Espejo exacto de la tabla legacy. Si ya existe (DB con dump importado),
// se saltea: baseline. Ver docs/adr/0002-preservar-nombres-legacy.md.
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ciudad')) {
            return;
        }

        Schema::create('ciudad', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->string('CodP', 8)->primary();
            $table->string('Nombre_Ciudad', 100);
            $table->string('Provincia', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ciudad');
    }
};
