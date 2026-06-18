<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Guarda la plantilla + variables de cada mensaje de texto (sub-J) para poder
// reenviar (reintentar fallidos) sin depender de datos externos.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->string('type', 30)->change(); // 'recordatorio_faltante' = 21 chars
            $table->string('template', 100)->nullable()->after('type');
            $table->json('template_vars')->nullable()->after('template');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropColumn(['template', 'template_vars']);
            $table->string('type', 20)->change();
        });
    }
};
