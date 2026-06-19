<?php

declare(strict_types=1);

namespace App\Http\Requests\PropertyType;

use Illuminate\Foundation\Http\FormRequest;

final class StorePropertyTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:50', 'unique:property_types,name']];
    }
}
