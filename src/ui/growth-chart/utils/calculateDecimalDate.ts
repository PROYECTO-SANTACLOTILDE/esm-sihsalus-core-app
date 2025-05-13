import { DataSetLabels } from '../config-schema';

export function calculateDecimalDate(
  date: Date | string,
  dataset: string,
  dateOfBirth: Date
): string | null {
  const observationDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = observationDate.getTime() - dateOfBirth.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  if (isNaN(diffInMs)) return null;

  const weeks = diffInMs / (msPerDay * 7);
  const months = diffInMs / (msPerDay * 30.44); // promedio exacto de mes

  switch (dataset) {
    case DataSetLabels.w_0_13:
      return weeks >= 0 && weeks <= 13 ? weeks.toFixed(2) : null;

    case DataSetLabels.y_0_2:
      return months >= 0 && months <= 24 ? months.toFixed(2) : null;

    case DataSetLabels.y_0_5:
    case DataSetLabels.y_2_5:
      return months >= 0 && months <= 60 ? months.toFixed(2) : null;

    default:
      return null;
  }
}
