<?php

declare(strict_types=1);

namespace App\Http\Requests\Receipt;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreReceiptRequest extends FormRequest
{
    public const MONTHS = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            // Un contrato archivado no admite recibos nuevos.
            'contract_id' => ['required', 'integer', Rule::exists('contrato', 'ID_Contrato')->whereNull('archived_at')],
            'payment_method_id' => ['required', 'integer', 'exists:formadepago,ID_FP'],
            'paid_at' => ['required', 'date'],
            'property_amount' => ['required', 'integer', 'min:0'],
            'municipal_amount' => ['nullable', 'integer', 'min:0'],
            'water_amount' => ['nullable', 'integer', 'min:0'],
            'electricity_amount' => ['nullable', 'integer', 'min:0'],
            'gas_amount' => ['nullable', 'integer', 'min:0'],
            'repairs_amount' => ['nullable', 'integer', 'min:0'],
            'funeral_amount' => ['nullable', 'integer', 'min:0'],
            'fees_amount' => ['nullable', 'integer', 'min:0'],
            'month' => ['required', 'in:'.implode(',', self::MONTHS)],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'comments' => ['nullable', 'string', 'max:200'],
        ];
    }
}
