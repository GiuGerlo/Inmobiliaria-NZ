<?php

declare(strict_types=1);

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

final class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'address' => ['required', 'string', 'max:100'],
            'city_code' => ['required', 'string', 'exists:ciudad,CodP'],
            'type' => ['required', 'string', 'max:50'],
            'services' => ['required', 'string', 'max:200'],
            'price' => ['required', 'integer', 'min:0'],
            'features' => ['required', 'string', 'max:200'],
        ];
    }
}
