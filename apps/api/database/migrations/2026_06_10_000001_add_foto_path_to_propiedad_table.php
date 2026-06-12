<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Foto de propiedad pasa a archivo en disco (WebP) + path en DB.
// Las columnas LONGBLOB legacy (Foto_Propiedad*) quedan intactas — muertas,
// se eliminan cuando el legacy salga de servicio.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('propiedad', 'foto_path')) {
            Schema::table('propiedad', function (Blueprint $table) {
                $table->string('foto_path', 255)->nullable()->after('Foto_Propiedad_GXI');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('propiedad', 'foto_path')) {
            Schema::table('propiedad', function (Blueprint $table) {
                $table->dropColumn('foto_path');
            });
        }
    }
};
