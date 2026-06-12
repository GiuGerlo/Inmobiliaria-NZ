<?php

declare(strict_types=1);

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateOwnerRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:100'],
            'city_code' => ['sometimes', 'required', 'string', 'exists:ciudad,CodP'],
        ];
    }
}
