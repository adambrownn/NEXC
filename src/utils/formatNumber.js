import { replace } from "lodash";
import numeral from "numeral";

// ----------------------------------------------------------------------

export function fCurrency(number) {
  if (!number) return "£0";
  return `£${Number(number).toLocaleString()}`;
}

export function fPercent(number) {
  if (!number) return "0%";
  return `${Number(number).toFixed(1)}%`;
}

export function fNumber(number) {
  if (number === null || number === undefined) return "0";
  return numeral(number).format("0,0");
}

export function fShortenNumber(number) {
  if (number === null || number === undefined) return "0";
  return replace(numeral(number).format("0.00a"), ".00", "");
}

export function fData(number) {
  if (number === null || number === undefined) return "0 bytes";
  return numeral(number).format("0.0 b");
}
