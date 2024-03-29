import { Position } from "../models";


export const formASeedData: Position[] = [
  {
    "department_code": "02",
    "department_descr": "FINANCE",
    "program_branch": "Taxation",
    "position": "Director of Awesome",
    //"issue_date": new Date(),
    //"reviewed_by_department": false,

    //"created_by": "SeedData",
    "authority_lines": [
      {
        "operational_restriction": "None",
        "contracts_for_goods_services": 250,
        "authorization_for_travel": 500,
        coding: "02",
        "loans_and_guarantees": 0,
        "transfer_payments": 0,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 0,
        "s30_payment_limit": 0
      },
      {
        "operational_restriction": "None",
        coding: "022",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      },
      {
        "operational_restriction": "None",
        coding: "0221",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      }
    ]
  },
  {
    "department_code": "55",
    "department_descr": "HIGHWAYS & PUBLIC WORKS",
    "program_branch": "ICT",
    "position": "ADM (All)",
    //"issue_date": new Date(),
    //"reviewed_by_department": true,
    //"reviewed_by_person": "ghoffman",
    //"reviewed_by_date": new Date(),
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "contracts_for_goods_services": 250,
        "authorization_for_travel": 500,
        coding: "55",
        "loans_and_guarantees": 0,
        "transfer_payments": 0,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 0,
        "s30_payment_limit": 0
      },
      {
        coding: "552",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      },
      {
        coding: "55212",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      }
    ]
  },
  {
    "department_code": "55",
    "department_descr": "HIGHWAYS & PUBLIC WORKS",
    "program_branch": "Corporate Services",
    "position": "ADM (All)",
    //"issue_date": new Date(),
    //"reviewed_by_department": false,
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "operational_restriction": "None",
        "contracts_for_goods_services": 250,
        "authorization_for_travel": 500,
        coding: "552",
        "loans_and_guarantees": 0,
        "transfer_payments": 0,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 0,
        "s30_payment_limit": 0
      },
      {
        "operational_restriction": "None",
        coding: "552",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      },
      {
        "operational_restriction": "None",
        coding: "552",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      }
    ]
  },
  {
    "department_code": "55",
    "department_descr": "HIGHWAYS & PUBLIC WORKS",
    "program_branch": "Transportation",
    "position": "ADM (All)",
    //"issue_date": new Date(),
    //"reviewed_by_department": false,
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "contracts_for_goods_services": 250,
        "operational_restriction": "None",
        "authorization_for_travel": 500,
        coding: "552",
        "loans_and_guarantees": 0,
        "transfer_payments": 0,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 0,
        "s30_payment_limit": 0
      },
      {
        "operational_restriction": "Journal only",
        coding: "552",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      },
      {
        "operational_restriction": "None",
        coding: "552",
        "contracts_for_goods_services": 15,
        "authorization_for_travel": 15,
        "loans_and_guarantees": 10,
        "transfer_payments": 10,
        "request_for_goods_services": 0,
        "assignment_authority": 0,
        "s29_performance_limit": 100,
        "s30_payment_limit": 100
      }

    ]
  }
];

export const formAFAM5533: Position[] = [
  // Highways Limitations per FAM 5.5.3.3
  {
    "department_code": "55",
    "department_descr": "HIGHWAYS & PUBLIC WORKS",
    "program_branch": "",
    "position": "Minister",
    // "issue_date": new Date(),
    //"reviewed_by_department": false,
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "contracts_for_goods_services": -1,
        "operational_restriction": "",
        "authorization_for_travel": -1,
        coding: "552",
        "loans_and_guarantees": 0,
        "transfer_payments": -1,
        "request_for_goods_services": -1,
        "assignment_authority": -1,
        "s29_performance_limit": -1,
        "s30_payment_limit": -1
      },
    ]
  },
  {
    "department_code": "55",
    "department_descr": "HIGHWAYS & PUBLIC WORKS",
    "program_branch": "",
    "position": "Deputy Minister ",
    //"reviewed_by_department": false,
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "contracts_for_goods_services": -1,
        "operational_restriction": "",
        "authorization_for_travel": -1,
        coding: "552",
        "loans_and_guarantees": 0,
        "transfer_payments": -1,
        "request_for_goods_services": -1,
        "assignment_authority": -1,
        "s29_performance_limit": -1,
        "s30_payment_limit": -1
      },
    ]
  },
  // Finance Limitations per FAM 5.5.3.3
  {
    "department_code": "12",
    "department_descr": "FINANCE",
    "program_branch": "",
    "position": "Minister ",
    //"issue_date": new Date(),
    //"reviewed_by_department": false,
    //"created_by": "SeedData",
    "authority_lines": [
      {
        "operational_restriction": "",
        coding: "552",
        "contracts_for_goods_services": -1,
        "loans_and_guarantees": -1,
        "transfer_payments": -1,
        "authorization_for_travel": -1,
        "request_for_goods_services": -1,
        "assignment_authority": -1,
        "s29_performance_limit": -1,
        "s30_payment_limit": -1
      },
      {
        "operational_restriction": "",
        coding: "12",
        "contracts_for_goods_services": 50000,
        "loans_and_guarantees": 100000,
        "transfer_payments": 500000,
        "authorization_for_travel": 5000,
        "request_for_goods_services": 500000,
        "assignment_authority": 50000,
        "s29_performance_limit": -1,
        "s30_payment_limit": -1
      }
    ]
  },
];
