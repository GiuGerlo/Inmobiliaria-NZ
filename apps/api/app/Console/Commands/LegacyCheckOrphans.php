<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Detecta registros huérfanos en la DB legacy antes de aplicar las FKs
 * (migration 0001_01_02_000001). Usa DB facade pura — sin modelos —
 * para funcionar contra cualquier estado del schema.
 */
final class LegacyCheckOrphans extends Command
{
    protected $signature = 'legacy:check-orphans';

    protected $description = 'Lista registros huérfanos que impedirían aplicar las foreign keys';

    private const RELATIONS = [
        // [tabla hija, columna FK, tabla padre, columna PK]
        ['dueno', 'CodP', 'ciudad', 'CodP'],
        ['inquilino', 'CodP', 'ciudad', 'CodP'],
        ['propiedad', 'CodP', 'ciudad', 'CodP'],
        ['contrato', 'ID_Dueno', 'dueno', 'ID_Dueno'],
        ['contrato', 'ID_Inquilino', 'inquilino', 'ID_Inquilino'],
        ['contrato', 'ID_Propiedad', 'propiedad', 'ID_Propiedad'],
        ['recibo', 'ID_Contrato', 'contrato', 'ID_Contrato'],
        ['recibo', 'ID_FP', 'formadepago', 'ID_FP'],
    ];

    private const MAX_LISTED = 20;

    public function handle(): int
    {
        $totalOrphans = 0;

        foreach (self::RELATIONS as [$child, $fkColumn, $parent, $pkColumn]) {
            $orphans = DB::table("$child as c")
                ->leftJoin("$parent as p", "c.$fkColumn", '=', "p.$pkColumn")
                ->whereNull("p.$pkColumn")
                ->whereNotNull("c.$fkColumn")
                ->pluck("c.$fkColumn");

            if ($orphans->isEmpty()) {
                $this->info("OK  $child.$fkColumn → $parent.$pkColumn");

                continue;
            }

            $totalOrphans += $orphans->count();

            $this->error(sprintf(
                'FAIL %s.%s → %s.%s — %d huérfano(s). Valores: %s%s',
                $child,
                $fkColumn,
                $parent,
                $pkColumn,
                $orphans->count(),
                $orphans->take(self::MAX_LISTED)->implode(', '),
                $orphans->count() > self::MAX_LISTED ? '…' : '',
            ));
        }

        if ($totalOrphans > 0) {
            $this->newLine();
            $this->error("Total: $totalOrphans huérfano(s). Corregir antes de correr la migration de FKs.");

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Integridad OK — se pueden aplicar las foreign keys.');

        return self::SUCCESS;
    }
}
