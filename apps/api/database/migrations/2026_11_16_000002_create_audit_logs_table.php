<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Auditoría: quién hizo qué y cuándo (panel solo superadmin).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            // null = sistema (consola, jobs) o intento de login anónimo.
            $table->unsignedInteger('user_id')->nullable()->index();
            $table->string('event', 50)->index();
            $table->string('auditable_type', 50)->nullable();
            // string: las PKs legacy no son todas enteras (settings.key).
            $table->string('auditable_id', 50)->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['auditable_type', 'auditable_id']);
            $table->foreign('user_id')->references('ID_User')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
