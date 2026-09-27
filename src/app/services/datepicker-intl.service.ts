import { Service } from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

@Service()
export default class DatepickerIntlService extends MatDatepickerIntl {
  override calendarLabel: string = 'Calendario';
  override openCalendarLabel: string = 'Abrir calendario';
  override closeCalendarLabel: string = 'Cerrar calendario';

  override prevMonthLabel: string = 'Mes anterior';
  override nextMonthLabel: string = 'Mes siguiente';

  override prevYearLabel: string = 'Año anterior';
  override nextYearLabel: string = 'Año siguiente';

  override prevMultiYearLabel: string = '24 años anteriores';
  override nextMultiYearLabel: string = '24 años siguientes';

  override switchToMonthViewLabel: string = 'Elegir fecha';
  override switchToMultiYearViewLabel: string = 'Elegir mes y año';

  override startDateLabel: string = 'Fecha inicial';
  override endDateLabel: string = 'Fecha final';
  override comparisonDateLabel: string = 'Rango de comparación';

  /**
   * Formats the year range label displayed by the multi-year datepicker view.
   *
   * @param start Start year.
   * @param end End year.
   *
   * @returns Formatted year range label.
   */
  override formatYearRangeLabel(start: string, end: string): string {
    return `${start} a ${end}`;
  }
}
