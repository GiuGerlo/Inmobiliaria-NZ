<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Legacy dado de baja: Pass_User (MD5 / texto plano heredado) ya no se usa para
// loguear. Se elimina para no guardar credenciales viejas. No se restaura el dato.
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'Pass_User')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('Pass_User');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'Pass_User')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('Pass_User', 35)->default('');
            });
        }
    }
};
