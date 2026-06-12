<?php

declare(strict_types=1);

namespace App\Http\Requests\Receipt;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateReceiptRequest extends FormRequest
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
            'contract_id' => ['sometimes', 'required', 'integer', 'exists:contrato,ID_Contrato'],
            'payment_method_id' => ['sometimes', 'required', 'integer', 'exists:formadepago,ID_FP'],
            'paid_at' => ['sometimes', 'required', 'date'],
            'property_amount' => ['sometimes', 'required', 'integer', 'min:0'],
            'municipal_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'water_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'electricity_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'gas_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'repairs_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'funeral_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'fees_amount' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'month' => ['sometimes', 'required', 'in:'.implode(',', StoreReceiptRequest::MONTHS)],
            'year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:2100'],
            'comments' => ['sometimes', 'nullable', 'string', 'max:200'],
        ];
    }
}
