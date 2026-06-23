export interface SampleBillTemplate {
  key: string;
  label: string;
  icon: string;
  text: string;
}

export const SAMPLE_BILLS: SampleBillTemplate[] = [
  {
    key: "electricity",
    label: "Electricity Bill",
    icon: "bolt",
    text: `METRO ENERGY CORP
Statement Date: 12/04/2023
Account: 4882-9102-1
Usage: 842 kWh @ $0.14/kWh
Transmission Surcharge: $12.45
Infrastructure Recovery: $8.90
Environmental Fee: $4.50
Total Amount Due: $143.73`
  },
  {
    key: "hospital",
    label: "Hospital Bill",
    icon: "medical_services",
    text: `CITY GENERAL HEALTHCARE
Patient: John Doe
Visit Date: 11/20/2023
Service ID: 99214 - Outpatient Office Visit: $185.00
Lab Panel (Blood): $412.00
Pharmacy (Antibiotics): $45.50
Adjustment (Insurance): -$312.00
Patient Responsibility: $330.50`
  },
  {
    key: "internet",
    label: "Internet Bill",
    icon: "language",
    text: `FASTNET SOLUTIONS
Billing Period: Dec 01 - Dec 31
Gigabit Plan: $89.99
Modem Rental: $15.00
Speed Boost Add-on: $10.00
Regional Franchise Fee: $2.44
Service Tax: $7.12
Total Charge: $124.55`
  },
  {
    key: "bank",
    label: "Bank Charges",
    icon: "account_balance",
    text: `GLOBAL PREMIER BANKING
Statement: November 2023
Account ending in: 4492
Monthly Maintenance Fee: $15.00
Out-of-network ATM Fee: $3.50
Foreign Transaction Fee (3.0%): $12.44
Overdraft Protection Fee: $35.00
Total Fees Incurred: $65.94`
  }
];
