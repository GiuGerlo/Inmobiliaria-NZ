<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Borrado sobre tablas con FKs RESTRICT: si hay registros dependientes,
 * la constraint corta (error MySQL 1451) y respondemos 409.
 */
trait HandlesRestrictedDelete
{
    private function destroyOrConflict(Model $model, string $conflictMessage): Response|JsonResponse
    {
        try {
            $model->delete();
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1451) {
                return response()->json(['message' => $conflictMessage], 409);
            }

            throw $e;
        }

        return response()->noContent();
    }
}
