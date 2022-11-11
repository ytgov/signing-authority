import moment from "moment";
import _ from "lodash";

export function FormatDate(input: Date): string {
  return moment(input).format("YYYY-MM-DD");
}

export function FormatMoney(amount: number): string {
  return Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CleanDouble(input: any): number {
  let output = _.replace(input, new RegExp(",", "g"), "");
  output = _.replace(output, new RegExp("\\$", "g"), "");
  output = _.replace(output, new RegExp("-", "g"), "");

  return Number(output);
}

export function CleanInteger(input: any): number {
  return Math.round(CleanDouble(input));
}

export function FormatCoding(input: string = ""): string {
  let account = `${input.replace(/[^0-9|x]/g, "")}ZZZZZZZZZZZZZZZZZZZZZZZZZ`;
  let dept = account.substring(0, 2);
  let vote = account.substring(2, 3);
  let prog = account.substring(3, 5);
  let activity = account.substring(5, 7);
  let element = account.substring(7, 9);
  let object = account.substring(9, 13);
  let ledger1 = account.substring(13, 17);
  let ledger2 = account.substring(17, 22);

  let output = `${dept}${vote}-${prog}${activity}${element}-${object}-${ledger1}-${ledger2}`;

  output = output.replace(/[Z]/g, "");
  output = output.replace(/[-]*$/g, "");

  return output;
}

export function CleanFilename(input: string): string {
  let filename = input.replace(/\s/g, ""); // replace whitespace
  filename = filename.replace(/[!%&'()*+./;<=>?\\,/:#@\t\r\n"\[\]_\u007B-\u00BF-]/g, ""); // replace special characters
  return filename;
}
