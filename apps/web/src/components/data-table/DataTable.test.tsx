import { describe, it, expect, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

type Row = { name: string };
const columns: ColumnDef<Row>[] = [{ id: 'name', accessorKey: 'name', header: 'Nombre' }];
const data: Row[] = [{ name: 'Rosario' }, { name: 'Córdoba' }];

function setup() {
  const onPaginationChange = vi.fn();
  render(
    <DataTable<Row, unknown>
      columns={columns}
      data={data}
      pageCount={3}
      total={40}
      pagination={{ pageIndex: 0, pageSize: 15 }}
      onPaginationChange={onPaginationChange}
      sorting={[]}
      onSortingChange={vi.fn()}
    />,
  );
  return { onPaginationChange };
}

describe('DataTable', () => {
  it('renderiza las filas y el total', () => {
    setup();
    expect(screen.getByText('Rosario')).toBeInTheDocument();
    expect(screen.getByText('Córdoba')).toBeInTheDocument();
    expect(screen.getByText('40 resultados')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
  });

  it('pasar de página dispara onPaginationChange', async () => {
    const user = userEvent.setup();
    const { onPaginationChange } = setup();
    await user.click(screen.getByLabelText('Página siguiente'));
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it('deshabilita "anterior" en la primera página', () => {
    setup();
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  });
});
