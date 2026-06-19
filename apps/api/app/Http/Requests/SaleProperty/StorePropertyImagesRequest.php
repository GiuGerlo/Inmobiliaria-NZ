<?php

declare(strict_types=1);

namespace App\Http\Requests\SaleProperty;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

final class StorePropertyImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'min:1'],
            'images.*' => [
                'required',
                File::image()->types(['jpg', 'jpeg', 'png', 'webp'])->max(5 * 1024),
            ],
        ];
    }
}
