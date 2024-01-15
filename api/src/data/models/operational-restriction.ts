import { MongoEntity } from ".";

export interface OperationalRestriction extends MongoEntity {
  description: string;
  is_active: boolean;
  sort: number;
}

export const OperationalRestrictionSeeds = [
  "",
  "Journal only",
  "Acquisition cards",
  "Refund as per FAM 7.6",
  "Personnel pay action",
  "Travel advance",
  "Special delegation",
  "Special delegation S23",
  "Special delegation S23 and S24",
  "Special delegation construction contract change orders only",
  "Special delegation acquisition card purchases only",
  "Bank deposit",
  "Period 14 only",
  "Aircraft Charters S23 only",
  "Purchase Contracts S23 only",
  "Travel Warrant S23 only",
  "Print Contracts S23 only",
  "Q journals only",
  "V journals only",
  "CDPITNEYWORK only",
  "Except 121-03xx Prior Year Accounting",
  "Payment cancellations and reissues",
];
