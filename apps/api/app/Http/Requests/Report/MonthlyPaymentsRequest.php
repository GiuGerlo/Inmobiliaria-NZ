<?php

declare(strict_types=1);

namespace App\Http\Requests\Report;

use App\Http\Requests\Receipt\StoreReceiptRequest;
use Illuminate\Foundation\Http\FormRequest;

final class MonthlyPaymentsRequest extends FormRequest
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
            'month' => ['required', 'in:'.implode(',', StoreReceiptRequest::MONTHS)],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
        ];
    }

    public function month(): string
    {
        return (string) $this->validated('month');
    }

    public function year(): int
    {
        return (int) $this->validated('year');
    }
}
