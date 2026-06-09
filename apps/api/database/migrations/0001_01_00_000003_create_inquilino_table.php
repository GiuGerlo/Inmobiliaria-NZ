<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('inquilino')) {
            return;
        }

        Schema::create('inquilino', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->smallIncrements('ID_Inquilino');
            $table->string('CodP', 8);
            $table->string('NYA_Inquilino', 100);
            $table->char('Tel_Inquilino', 20);
            $table->string('Email_Inquilino', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquilino');
    }
};
