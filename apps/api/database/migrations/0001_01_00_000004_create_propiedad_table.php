<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('propiedad')) {
            return;
        }

        Schema::create('propiedad', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->smallIncrements('ID_Propiedad');
            $table->string('Dir_Propiedad', 100);
            $table->string('CodP', 8);
            $table->string('Tipo_Propiedad', 50);
            $table->string('Serv_Propiedad', 200);
            $table->decimal('Precio_Propiedad', 15, 0);
            $table->string('Caract_Propiedad', 200);
            $table->binary('Foto_Propiedad')->nullable(); // longblob — se ajusta abajo
            $table->string('Foto_Propiedad_GXI', 2048)->nullable();
        });

        // Blueprint::binary genera BLOB; el legacy usa LONGBLOB.
        DB::statement('ALTER TABLE propiedad MODIFY Foto_Propiedad LONGBLOB NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('propiedad');
    }
};
