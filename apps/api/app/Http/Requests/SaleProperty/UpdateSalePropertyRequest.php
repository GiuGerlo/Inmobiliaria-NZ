<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateSalePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'property_type_id' => ['sometimes', 'nullable', 'integer', 'exists:property_types,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'locality' => ['sometimes', 'nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string'],
            'size' => ['sometimes', 'nullable', 'string', 'max:255'],
            'services' => ['sometimes', 'nullable', 'string'],
            'features' => ['sometimes', 'nullable', 'string'],
            'map_embed' => ['sometimes', 'nullable', 'string'],
            'sort_order' => ['sometimes', 'nullable', 'integer'],
            'is_sold' => ['sometimes', 'nullable', 'boolean'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
