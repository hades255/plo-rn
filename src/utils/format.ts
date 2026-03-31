export function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return '$0';
  }
  return `$${amount.toLocaleString()}`;
}

export function formatDateTime(value: unknown) {
  if (!value) {
    return '';
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRemaining(value: unknown) {
  if (!value) {
    return '';
  }
  const target = new Date(String(value)).getTime();
  if (Number.isNaN(target)) {
    return '';
  }
  const diff = target - Date.now();
  if (diff <= 0) {
    return 'Awaiting result';
  }
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}
