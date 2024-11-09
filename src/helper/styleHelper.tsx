export const formatPrice = (price: number) => {
  if (price >= 1000000) {
    const formattedPrice = (price / 1000000).toFixed(1);
    return formattedPrice.endsWith('.0')
      ? `${Math.round(price / 1000000)}M`
      : `${formattedPrice}M`;
  } else if (price >= 1000) {
    const formattedPrice = (price / 1000).toFixed(1);
    return formattedPrice.endsWith('.0')
      ? `${Math.round(price / 1000)}K`
      : `${formattedPrice}K`;
  }
  return price.toLocaleString(); // Formats numbers with commas
};

export const formatOwnerName = (name: string) => {
  if (name.length > 4) {
    return `${name.slice(0, 5)}..${name.slice(-4)}`;
  }
  return name;
};
