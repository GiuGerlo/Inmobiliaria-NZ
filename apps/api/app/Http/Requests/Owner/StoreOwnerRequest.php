<?php

declare(strict_types=1);

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

final class StoreOwnerRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'string', 'email', 'max:100'],
            'city_code' => ['required', 'string', 'exists:ciudad,CodP'],
        ];
    }
}
