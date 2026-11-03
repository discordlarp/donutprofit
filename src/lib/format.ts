/**
 * Formats monetary amounts and casino balances using compact human-readable suffixes:
 * K for thousands (1K - 999.99K)
 * M for millions (1M - 999.99M)
 * B for billions (1B+), with B as the maximum suffix.
 */
export function formatCash(
  amount: number | null | undefined,
  options: {
    showPlus?: boolean;
    prefix?: string;
  } = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return (options.prefix !== undefined ? options.prefix : '$') + '0';
  }

  const prefix = options.prefix !== undefined ? options.prefix : '$';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formattedNumber = '';

  if (abs >= 1_000_000_000) {
    // Billions (Maximum letter suffix is B)
    const val = abs / 1_000_000_000;
    formattedNumber = parseFloat(val.toFixed(2)).toString() + 'B';
  } else if (abs >= 1_000_000) {
    // Millions
    const val = abs / 1_000_000;
    formattedNumber = parseFloat(val.toFixed(2)).toString() + 'M';
  } else if (abs >= 1_000) {
    // Thousands
    const val = abs / 1_000;
    formattedNumber = parseFloat(val.toFixed(2)).toString() + 'K';
  } else {
    // Less than 1,000
    formattedNumber = parseFloat(abs.toFixed(2)).toString();
  }

  if (isNegative) {
    return `-${prefix}${formattedNumber}`;
  }

  if (options.showPlus && abs > 0) {
    return `+${prefix}${formattedNumber}`;
  }

  return `${prefix}${formattedNumber}`;
}

export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);
  const isNegative = num < 0;

  let str = '';
  if (abs >= 1_000_000_000) {
    str = parseFloat((abs / 1_000_000_000).toFixed(2)).toString() + 'B';
  } else if (abs >= 1_000_000) {
    str = parseFloat((abs / 1_000_000).toFixed(2)).toString() + 'M';
  } else if (abs >= 1_000) {
    str = parseFloat((abs / 1_000).toFixed(2)).toString() + 'K';
  } else {
    str = parseFloat(abs.toFixed(2)).toString();
  }

  return isNegative ? `-${str}` : str;
}
