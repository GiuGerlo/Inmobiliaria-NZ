<?php

declare(strict_types=1);

namespace App\Http\Requests\Contract;

use Illuminate\Foundation\Http\FormRequest;

final class StoreContractRequest extends FormRequest
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
            'owner_id' => ['required', 'integer', 'exists:dueno,ID_Dueno'],
            'tenant_id' => ['required', 'integer', 'exists:inquilino,ID_Inquilino'],
            'property_id' => ['required', 'integer', 'exists:propiedad,ID_Propiedad'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'balance' => ['nullable', 'integer', 'min:0'],
            'certification' => ['required', 'in:Si,No'],
        ];
    }
}
