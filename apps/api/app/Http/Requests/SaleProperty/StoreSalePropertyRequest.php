<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSalePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'property_type_id' => ['nullable', 'integer', 'exists:property_types,id'],
            'title' => ['required', 'string', 'max:255'],
            'locality' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string'],
            'size' => ['nullable', 'string', 'max:255'],
            'services' => ['nullable', 'string'],
            'features' => ['nullable', 'string'],
            'map_embed' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_sold' => ['nullable', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
