<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Concerns\HandlesRestrictedDelete;
use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyType\StorePropertyTypeRequest;
use App\Http\Requests\PropertyType\UpdatePropertyTypeRequest;
use App\Http\Resources\PropertyTypeResource;
use App\Models\PropertyType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class PropertyTypeController extends Controller
{
    use HandlesRestrictedDelete;

    public function index(): AnonymousResourceCollection
    {
        return PropertyTypeResource::collection(PropertyType::orderBy('name')->get());
    }

    public function store(StorePropertyTypeRequest $request): JsonResponse
    {
        $type = PropertyType::create($request->validated());

        return (new PropertyTypeResource($type))->response()->setStatusCode(201);
    }

    public function update(UpdatePropertyTypeRequest $request, PropertyType $propertyType): PropertyTypeResource
    {
        $propertyType->update($request->validated());

        return new PropertyTypeResource($propertyType);
    }

    public function destroy(PropertyType $propertyType): Response|JsonResponse
    {
        return $this->destroyOrConflict(
            $propertyType,
            'No se puede eliminar la categoría: tiene propiedades asociadas.',
        );
    }
}
