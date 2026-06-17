<?php

declare(strict_types=1);

namespace App\Http\Requests\Receipt;

use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Http\FormRequest;

final class SendWhatsAppRequest extends FormRequest
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
            'type' => ['required', 'in:'.WhatsAppMessage::TYPE_RECIBO.','.WhatsAppMessage::TYPE_RENDICION],
            // Override opcional del teléfono; la normalización a E.164 y el 422 final
            // los resuelve el controller (necesita el tel guardado como fallback).
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
