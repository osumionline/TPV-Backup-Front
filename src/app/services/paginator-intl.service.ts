import { Service } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Service()
export default class PaginatorIntlService extends MatPaginatorIntl {
  override itemsPerPageLabel: string = 'Elementos por página';
  override nextPageLabel: string = 'Página siguiente';
  override previousPageLabel: string = 'Página anterior';
  override firstPageLabel: string = 'Primera página';
  override lastPageLabel: string = 'Última página';

  /**
   * Formats the current paginator range label.
   *
   * @param page Zero-based current page index.
   * @param pageSize Number of items displayed per page.
   * @param length Total number of available items.
   *
   * @returns Formatted paginator range label.
   */
  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex: number = page * pageSize;
    const endIndex: number = Math.min(startIndex + pageSize, length);

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}
