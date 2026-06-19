<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleProperty\ReorderRequest;
use App\Http\Requests\SaleProperty\StoreSalePropertyRequest;
use App\Http\Requests\SaleProperty\UpdateSalePropertyRequest;
use App\Http\Resources\SalePropertyResource;
use App\Models\SaleProperty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

final class SalePropertyController extends Controller
{
    private const PER_PAGE_MAX = 100;

    public function index(Request $request): AnonymousResourceCollection
    {
        $properties = QueryBuilder::for(SaleProperty::class)
            ->allowedFilters(
                AllowedFilter::exact('type', 'property_type_id'),
                AllowedFilter::exact('sold', 'is_sold'),
            )
            ->allowedSorts(
                AllowedSort::field('sort_order'),
                AllowedSort::field('title'),
                AllowedSort::field('id'),
            )
            ->defaultSort(AllowedSort::field('sort_order'))
            ->with(['type', 'images'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = $request->string('q')->value();
                $query->where(function ($inner) use ($q) {
                    $inner->where('title', 'like', "%{$q}%")
                        ->orWhere('locality', 'like', "%{$q}%");
                });
            })
            ->paginate(min((int) $request->integer('per_page', 15), self::PER_PAGE_MAX))
            ->appends($request->query());

        return SalePropertyResource::collection($properties);
    }

    public function show(SaleProperty $saleProperty): SalePropertyResource
    {
        return new SalePropertyResource($saleProperty->load(['type', 'images']));
    }

    public function store(StoreSalePropertyRequest $request): JsonResponse
    {
        $property = SaleProperty::create($request->validated());

        return (new SalePropertyResource($property->load(['type', 'images'])))
            ->response()->setStatusCode(201);
    }

    public function update(UpdateSalePropertyRequest $request, SaleProperty $saleProperty): SalePropertyResource
    {
        $saleProperty->update($request->validated());

        return new SalePropertyResource($saleProperty->load(['type', 'images']));
    }

    public function destroy(SaleProperty $saleProperty): Response
    {
        Storage::disk('public')->deleteDirectory("sale-properties/{$saleProperty->id}");
        $saleProperty->delete();

        return response()->noContent();
    }

    public function reorder(ReorderRequest $request): Response
    {
        foreach ($request->validated()['ids'] as $position => $id) {
            SaleProperty::where('id', $id)->update(['sort_order' => $position]);
        }

        return response()->noContent();
    }
}
