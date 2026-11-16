<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/** Auditoría: solo lectura y solo superadmin (gate view-audit). */
final class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $logs = QueryBuilder::for(AuditLog::class)
            ->with('user:ID_User,Nombre_User')
            ->allowedFilters(
                AllowedFilter::exact('user_id'),
                AllowedFilter::exact('auditable_type'),
                AllowedFilter::exact('auditable_id'),
                // "whatsapp" agrupa todos los envíos (whatsapp.recibo, whatsapp.rendicion, ...); idem "pdf".
                AllowedFilter::callback('event', function (Builder $query, $value): void {
                    $query->where(fn (Builder $q) => $q->where('event', $value)->orWhere('event', 'like', $value.'.%'));
                }),
                AllowedFilter::callback('from', fn (Builder $query, $value) => $query->whereDate('created_at', '>=', $value)),
                AllowedFilter::callback('to', fn (Builder $query, $value) => $query->whereDate('created_at', '<=', $value)),
            )
            ->orderByDesc('id')
            ->paginate(max(1, min($request->integer('per_page', 25), 100)))
            ->appends($request->query());

        return AuditLogResource::collection($logs);
    }
}
