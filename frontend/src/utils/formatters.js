// Format currency (e.g. $84,520.75)
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format dates (e.g. Oct 6, 2026, 12:30 PM)
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Short date without time (e.g. Oct 6, 2026)
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Mask card number for security (e.g. **** **** **** 4821)
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '**** **** **** ****';
  const cleaned = cardNumber.replace(/\s+/g, '');
  if (cleaned.length >= 4) {
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  }
  return cardNumber;
};
