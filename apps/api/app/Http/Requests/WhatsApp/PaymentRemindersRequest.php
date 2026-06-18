<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

final class PaymentRemindersRequest extends FormRequest
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
            'tenant_ids' => ['required', 'array', 'min:1'],
            'tenant_ids.*' => ['integer', 'exists:inquilino,ID_Inquilino'],
            'deadline' => ['required', 'string', 'max:120'],
        ];
    }
}
