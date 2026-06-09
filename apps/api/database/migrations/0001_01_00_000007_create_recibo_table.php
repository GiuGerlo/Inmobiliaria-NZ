<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('recibo')) {
            return;
        }

        Schema::create('recibo', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->increments('Nro_Recibo');
            $table->unsignedSmallInteger('ID_FP');
            $table->unsignedSmallInteger('ID_Contrato');
            $table->date('F_Pago');
            $table->decimal('Pago_Propiedad', 15, 0);
            $table->decimal('Pago_Municipal', 15, 0)->nullable();
            $table->decimal('Pago_Agua', 15, 0)->nullable();
            $table->decimal('Honorarios', 15, 0)->nullable();
            $table->string('Mes_Rend', 15);
            $table->smallInteger('Ano_Rend');
            $table->decimal('Pago_Electricidad', 15, 0)->nullable();
            $table->decimal('Pago_Gas', 15, 0)->nullable();
            $table->decimal('Arreglos', 15, 0)->nullable();
            $table->decimal('Sepelio', 15, 0)->nullable();
            $table->string('Comentarios', 200)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recibo');
    }
};
