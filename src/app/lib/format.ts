export const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const nf4 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export function fmtPrice(x: number) {
  if (x >= 1000) return nf2.format(x);
  if (x >= 1) return nf4.format(x);
  return x.toFixed(8);
}
export function fmtVol(x: number) {
  if (x >= 1e9) return nf2.format(x / 1e9) + "B";
  if (x >= 1e6) return nf2.format(x / 1e6) + "M";
  if (x >= 1e3) return nf2.format(x / 1e3) + "K";
  return nf2.format(x);
}
