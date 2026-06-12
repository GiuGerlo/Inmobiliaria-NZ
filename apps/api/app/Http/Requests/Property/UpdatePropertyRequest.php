<?php

declare(strict_types=1);

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

final class UpdatePropertyRequest extends FormRequest
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
            'address' => ['sometimes', 'required', 'string', 'max:100'],
            'city_code' => ['sometimes', 'required', 'string', 'exists:ciudad,CodP'],
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'services' => ['sometimes', 'required', 'string', 'max:200'],
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'features' => ['sometimes', 'required', 'string', 'max:200'],
        ];
    }
}
