export function getMonthRange(monthString) {
  const now = new Date();

  let year;
  let month;

  if (monthString && /^\d{4}-\d{2}$/.test(monthString)) {
    const [y, m] = monthString.split("-");
    year = Number(y);
    month = Number(m) - 1;
  } else {
    year = now.getFullYear();
    month = now.getMonth();
  }

  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);

  return { start, end };
}

export function formatMonthKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
