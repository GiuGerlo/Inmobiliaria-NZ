<?php

declare(strict_types=1);

namespace App\Http\Requests\PropertyType;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdatePropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:50',
                Rule::unique('property_types', 'name')->ignore($this->route('propertyType')),
            ],
        ];
    }
}
