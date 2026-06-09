<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('formadepago')) {
            return;
        }

        Schema::create('formadepago', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->smallIncrements('ID_FP');
            $table->string('Desc_FP', 40);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formadepago');
    }
};
