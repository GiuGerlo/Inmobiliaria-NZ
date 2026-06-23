<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sale_properties', 'slug')) {
            return;
        }

        Schema::table('sale_properties', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('title');
        });

        // Backfill: slug estable y único = base del título + "-{id}".
        foreach (DB::table('sale_properties')->select('id', 'title')->get() as $row) {
            $base = Str::slug((string) $row->title) ?: 'propiedad';
            DB::table('sale_properties')->where('id', $row->id)
                ->update(['slug' => "{$base}-{$row->id}"]);
        }

        Schema::table('sale_properties', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('sale_properties', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
