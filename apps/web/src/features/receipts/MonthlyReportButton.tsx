import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MONTHS } from './schema';
import { openMonthlyReport } from './pdf';

/**
 * Genera el listado mensual de pagos (pagados / no pagados) en PDF.
 * Réplica del "Seleccionar mes + año + Generar PDF" del legacy.
 */
export function MonthlyReportButton() {
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  const canGenerate = month !== '' && /^\d{4}$/.test(year);

  return (
    <div className="flex items-center gap-2">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-[180px]" aria-label="Mes del reporte">
          <SelectValue placeholder="Seleccionar mes" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        min={2000}
        max={2100}
        className="w-[120px]"
        placeholder="Año"
        aria-label="Año del reporte"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <Button
        variant="outline"
        disabled={!canGenerate}
        onClick={() => openMonthlyReport(month, Number(year))}
      >
        <FileDown className="size-4" />
        Generar PDF
      </Button>
    </div>
  );
}
