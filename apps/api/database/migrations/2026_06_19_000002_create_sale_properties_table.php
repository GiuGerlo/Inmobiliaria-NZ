<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_type_id')->nullable()
                ->constrained('property_types')->restrictOnDelete();
            $table->string('title')->nullable();
            $table->string('locality')->nullable();
            $table->text('location')->nullable();
            $table->string('size')->nullable();
            $table->text('services')->nullable();
            $table->text('features')->nullable();
            $table->text('map_embed')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_sold')->default(false);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_properties');
    }
};
