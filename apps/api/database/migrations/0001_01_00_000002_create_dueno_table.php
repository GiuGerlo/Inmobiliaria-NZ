<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('dueno')) {
            return;
        }

        Schema::create('dueno', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->smallIncrements('ID_Dueno');
            $table->string('CodP', 8);
            $table->string('NYA_Dueno', 100);
            $table->char('Tel_Dueno', 20);
            $table->string('Email_Dueno', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dueno');
    }
};
