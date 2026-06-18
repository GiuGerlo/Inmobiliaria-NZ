<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

final class MissingItemsRequest extends FormRequest
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
            'tenant_id' => ['required', 'integer', 'exists:inquilino,ID_Inquilino'],
            'message' => ['required', 'string', 'max:500'],
        ];
    }
}
