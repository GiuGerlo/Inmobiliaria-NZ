<?php

declare(strict_types=1);

namespace App\Http\Requests\City;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCityRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:8', 'unique:ciudad,CodP'],
            'name' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
        ];
    }
}
