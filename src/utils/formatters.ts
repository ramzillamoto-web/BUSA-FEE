export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getDaysRemaining(dueDateISO: string): {
  days: number;
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateISO);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      days: diffDays,
      text: `${overdue} day${overdue === 1 ? '' : 's'} overdue`,
      isOverdue: true,
      isDueSoon: false,
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      text: 'Due today',
      isOverdue: false,
      isDueSoon: true,
    };
  } else if (diffDays <= 7) {
    return {
      days: diffDays,
      text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      isOverdue: false,
      isDueSoon: true,
    };
  } else {
    return {
      days: diffDays,
      text: `${diffDays} days left`,
      isOverdue: false,
      isDueSoon: false,
    };
  }
}

export function getCurrentFormattedDateTime(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
