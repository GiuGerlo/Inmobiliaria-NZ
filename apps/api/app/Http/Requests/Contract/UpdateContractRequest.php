<?php

declare(strict_types=1);

namespace App\Http\Requests\Contract;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Si se cambia una fecha hay que mandar las dos: "after" necesita ambas
     * para validar el rango completo.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'owner_id' => ['sometimes', 'required', 'integer', 'exists:dueno,ID_Dueno'],
            'tenant_id' => ['sometimes', 'required', 'integer', 'exists:inquilino,ID_Inquilino'],
            'property_id' => ['sometimes', 'required', 'integer', 'exists:propiedad,ID_Propiedad'],
            'start_date' => ['required_with:end_date', 'date'],
            'end_date' => ['required_with:start_date', 'date', 'after:start_date'],
            'balance' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'certification' => ['sometimes', 'required', 'in:Si,No'],
        ];
    }
}
