<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// FKs + índices sobre el schema legacy. En DB con datos viejos, correr
// `php artisan legacy:check-orphans` ANTES: si hay huérfanos esta migration
// falla (correcto — los datos hay que arreglarlos, no taparlos).
// Todos los deletes RESTRICT: jamás borrado en cascada de datos contables.
return new class extends Migration
{
    private const FOREIGN_KEYS = [
        // [tabla, columna, tabla_ref, columna_ref]
        ['dueno', 'CodP', 'ciudad', 'CodP'],
        ['inquilino', 'CodP', 'ciudad', 'CodP'],
        ['propiedad', 'CodP', 'ciudad', 'CodP'],
        ['contrato', 'ID_Dueno', 'dueno', 'ID_Dueno'],
        ['contrato', 'ID_Inquilino', 'inquilino', 'ID_Inquilino'],
        ['contrato', 'ID_Propiedad', 'propiedad', 'ID_Propiedad'],
        ['recibo', 'ID_Contrato', 'contrato', 'ID_Contrato'],
        ['recibo', 'ID_FP', 'formadepago', 'ID_FP'],
    ];

    public function up(): void
    {
        foreach (self::FOREIGN_KEYS as [$tableName, $column, $refTable, $refColumn]) {
            $fkName = $this->fkName($tableName, $column);

            if ($this->constraintExists($tableName, $fkName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($column, $refTable, $refColumn, $fkName) {
                $table->foreign($column, $fkName)
                    ->references($refColumn)
                    ->on($refTable)
                    ->onDelete('restrict')
                    ->onUpdate('restrict');
            });
        }

        // Índice compuesto para la query principal de rendición mensual.
        if (! $this->indexExists('recibo', 'recibo_mes_ano_index')) {
            Schema::table('recibo', function (Blueprint $table) {
                $table->index(['Mes_Rend', 'Ano_Rend'], 'recibo_mes_ano_index');
            });
        }
    }

    public function down(): void
    {
        foreach (self::FOREIGN_KEYS as [$tableName, $column]) {
            $fkName = $this->fkName($tableName, $column);

            if ($this->constraintExists($tableName, $fkName)) {
                Schema::table($tableName, function (Blueprint $table) use ($fkName) {
                    $table->dropForeign($fkName);
                });
            }
        }

        if ($this->indexExists('recibo', 'recibo_mes_ano_index')) {
            Schema::table('recibo', function (Blueprint $table) {
                $table->dropIndex('recibo_mes_ano_index');
            });
        }
    }

    private function fkName(string $tableName, string $column): string
    {
        return sprintf('fk_%s_%s', $tableName, strtolower($column));
    }

    private function constraintExists(string $tableName, string $fkName): bool
    {
        return DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('CONSTRAINT_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $tableName)
            ->where('CONSTRAINT_NAME', $fkName)
            ->exists();
    }

    private function indexExists(string $tableName, string $indexName): bool
    {
        return DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $tableName)
            ->where('INDEX_NAME', $indexName)
            ->exists();
    }
};
