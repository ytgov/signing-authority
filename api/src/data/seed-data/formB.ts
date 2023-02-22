import { Authority } from "../models"


export const formBSeedData: Authority[] = [
  /*
    {
      employee_id: "",
      form_a_id: "",
      "department_code": "02",
      "department_descr": "FINANCE",
      "program": "Taxation",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "title": "Director of Taxation",
      employee_name: "Michael",
      employee_signed: false,
      supervisor_name: "",
      supervisor_signed: false,
      supervisor_title: "",
      "authority_lines": [
        {
          "dept": "02",
          "vote": "*",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "operational_restriction": "None",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "dept": "02",
          "vote": "21",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "operational_restriction": "None",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "None",
          "dept": "02",
          "vote": "21",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
  
      ]
    },
   /*  {
      "department_code": "55",
      "department_descr": "HIGHWAYS & PUBLIC WORKS",
      "program_branch": "ICT",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "position": "ADM",
      "authority_lines": [
        {
          "contracts_for_goods_services": 250,
          "authorization_for_travel": 500,
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "dept": "55",
          "vote": "21",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
  
      ]
    },
    {
      "department_code": "55",
      "department_descr": "HIGHWAYS & PUBLIC WORKS",
      "program_branch": "Corporate Services",
      "position": "Director of Operations",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "authority_lines": [
        {
          "operational_restriction": "None",
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "None",
          "dept": "55",
          "vote": "21",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "None",
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
  
      ]
    },
    {
      "department_code": "55",
      "department_descr": "HIGHWAYS & PUBLIC WORKS",
      "program_branch": "Transportation",
      "position": "Manager of Programs",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "authority_lines": [
        {
          "operational_restriction": "None",
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "Journal only",
          "dept": "55",
          "vote": "21",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "None",
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
  
      ]
    }
  ]
  
  export const formAFAM5533: FormA[] = [
    // Highways Limitations per FAM 5.5.3.3
    {
      "department_code": "55",
      "department_descr": "HIGHWAYS & PUBLIC WORKS",
      "program_branch": "",
      "position": "Deputy Minister",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "authority_lines": [
        {
          "operational_restriction": "",
          "dept": "55",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "",
          "dept": "55",
          "vote": "",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
      ]
    },
    // Finance Limitations per FAM 5.5.3.3
    {
      "department_code": "12",
      "department_descr": "FINANCE",
      "program_branch": "",
      "position": "Deputy Minister",
      "issue_date": new Date(),
      "reviewed_by_department": false,
      "created_by": "SeedData",
      "authority_lines": [
        {
          "operational_restriction": "",
          "dept": "12",
          "vote": "**",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          s24_procure_goods_limit: 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        },
        {
          "operational_restriction": "",
          "dept": "12",
          "vote": "",
          "prog": "**",
          "activity": "**",
          "element": "**",
          "allotment": "**",
          "object": "****",
          "ledger1": "****",
          "ledger2": "*****",
          "s24_procure_goods_limit": 250,
          "s24_procure_services_limit": 500,
          "s24_procure_request_limit": 0,
          "s24_procure_assignment_limit": 0,
          "s23_procure_goods_limit": 0,
          "s23_procure_services_limit": 0,
          "s24_transfer_limit": 0,
          "s30_payment_limit": 0,
          loans_limit: 0,
          other_limit: 0,
          s23_transfer_limit: 0,
          s24_travel_limit: 10,
          s29_performance_limit: 12,
        }
      ]
    }, */
]

