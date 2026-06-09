<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contrato')) {
            return;
        }

        Schema::create('contrato', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->smallIncrements('ID_Contrato');
            $table->unsignedSmallInteger('ID_Dueno');
            $table->unsignedSmallInteger('ID_Inquilino');
            $table->unsignedSmallInteger('ID_Propiedad');
            $table->date('F_Inicio');
            $table->date('F_Fin');
            $table->decimal('Saldo', 15, 0)->nullable();
            $table->string('Certificacion', 2);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrato');
    }
};
