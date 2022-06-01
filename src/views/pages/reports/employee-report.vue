<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import JsonExcel from "vue-json-excel";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 1 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Employee Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    JsonExcel,
  },
  async mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      this.type = this.$route.params.type;
      if (this.type === "all") {
        this.status = "All Employees";
      } else if (this.type === 1) {
        this.status = "Active Employees";
      } else if (this.type === 0) {
        this.status = "Inactive Employees";
      }
      let data = {
        type: this.$route.params.type,
      };
      const url = `${this.ROUTES.employee}/get-employee-report`;
      this.apiPost(url, data, "Generate Employee Report").then(async (res) => {
        const { data } = res;
        const newData = await this.sortArrayOfObjects(data);
        newData.forEach((employee, index) => {
          let employeeObj = {
            sn: ++index,
            emp_unique_id: employee.emp_unique_id,
            emp_first_name: employee.emp_first_name,
            emp_other_name: employee.emp_other_name,
            emp_last_name: employee.emp_last_name,
            emp_office_email: employee.emp_office_email,
            emp_personal_email: employee.emp_personal_email,
            emp_phone_no: employee.emp_phone_no,
            sector: employee.sector
              ? `${employee.sector.department_name} - ${employee.sector.d_t3_code}`
              : null,
            location: employee.location
              ? `${employee.location.location_name} - ${employee.location.l_t6_code}`
              : null,
            jobrole: employee.jobrole.job_role,
            unit: employee.emp_unit_name,
            supervisor: employee.supervisor
              ? `${employee.supervisor.emp_first_name} ${employee.supervisor.emp_last_name} - ${employee.supervisor.emp_unique_id}`
              : null,
            start_date: employee.emp_hire_date
              ? `${new Date(employee.emp_hire_date).toDateString()}`
              : null,
            end_date: employee.emp_contract_end_date
              ? `${new Date(employee.emp_contract_end_date).toDateString()}`
              : null,
            stop_date: employee.emp_stop_date
              ? `${new Date(employee.emp_stop_date)}`
              : null,
            employment_date: employee.emp_employment_date
              ? `${new Date(employee.emp_employment_date)}`
              : null,
            suspension_reason: employee.emp_suspension_reason,
            dob: employee.emp_dob ? `${new Date(employee.emp_dob)}` : null,
            sex: employee.emp_sex,
            religion: employee.emp_religion,
            marital_status: employee.emp_marital_status,
            spouse_name: employee.emp_spouse_name,
            spouse_phone: employee.emp_spouse_phone_no,
            next_of_kin: employee.emp_next_of_kin_name,
            next_of_kin_phone: employee.emp_next_of_kin_phone_no,
            next_of_kin_address: employee.emp_next_of_kin_address,
            ailments: employee.emp_ailments,
            blood_group: employee.emp_blood_group,
            emergency_contact: employee.emp_emergency_contact,
            emergency_name: employee.emp_emergency_name,
            nysc_details: employee.emp_nysc_details,
            qualification: employee.emp_qualification,
            pension_no: employee.emp_pension_no,
            paye_no: employee.emp_paye_no,
            nhf: employee.emp_nhf,
            hmo_no: employee.emp_hmo_no,
            cost_center: employee.emp_cost_center,
            tax_amount: employee.emp_tax_amount,
            gross: employee.emp_gross
              ? this.apiValueHandler(employee.emp_gross.toFixed(2))
              : this.apiValueHandler(0.0),
            bvn: employee.emp_bvn,
            account_no: employee.emp_account_no,
            bank: employee.bank ? employee.bank.bank_name : null,
            status: employee.emp_status === 1 ? "ACTIVE" : "INACTIVE",
          };
          this.employees.push(employeeObj);
        });
        this.filtered = this.employees;
        this.totalRows = this.employees.length;
        this.fields.forEach((field) => {
          let key = field.key;
          if (key === "sn") {
            this.jsonFields["S/N"] = key;
          } else if (key === "emp_unique_id") {
            this.jsonFields["T7 NUMBER"] = key;
          } else if (key === "emp_first_name") {
            this.jsonFields["FIRST NAME"] = key;
          } else if (key === "emp_other_name") {
            this.jsonFields["OTHER NAME"] = key;
          } else if (key === "emp_last_name") {
            this.jsonFields["LAST NAME"] = key;
          } else if (key === "emp_office_email") {
            this.jsonFields["OFFICIAL EMAIL"] = key;
          } else if (key === "emp_personal_email") {
            this.jsonFields["PERSONAL EMAIL"] = key;
          } else if (key === "emp_phone_no") {
            this.jsonFields["PHONE NUMBER"] = key;
          } else if (key === "sector") {
            this.jsonFields["SECTOR"] = key;
          } else if (key === "location") {
            this.jsonFields["LOCATION"] = key;
          } else if (key === "jobrole") {
            this.jsonFields["DESIGNATION"] = key;
          } else if (key === "unit") {
            this.jsonFields["UNIT"] = key;
          } else if (key === "supervisor") {
            this.jsonFields["SUPERVISOR"] = key;
          } else if (key === "start_date") {
            this.jsonFields["START DATE"] = key;
          } else if (key === "end_date") {
            this.jsonFields["END DATE"] = key;
          } else if (key === "stop_date") {
            this.jsonFields["STOP DATE"] = key;
          } else if (key === "employment_date") {
            this.jsonFields["EMPLOYMENT DATE"] = key;
          } else if (key === "suspension_reason") {
            this.jsonFields["SUSPENSION REASON"] = key;
          } else if (key === "dob") {
            this.jsonFields["DATE OF BIRTH"] = key;
          } else if (key === "sex") {
            this.jsonFields["SEX"] = key;
          } else if (key === "religion") {
            this.jsonFields["RELIGION"] = key;
          } else if (key === "marital_status") {
            this.jsonFields["MARITAL STATUS"] = key;
          } else if (key === "spouse_name") {
            this.jsonFields["SPOUSE NAME"] = key;
          } else if (key === "spouse_phone") {
            this.jsonFields["SPOUSE PHONE NUMBER"] = key;
          } else if (key === "next_of_kin") {
            this.jsonFields["NEXT OF KIN"] = key;
          } else if (key === "next_of_kin_phone") {
            this.jsonFields["NEXT OF KIN PHONE"] = key;
          } else if (key === "next_of_kin_address") {
            this.jsonFields["NEXT OF KIN ADDRESS"] = key;
          } else if (key === "ailments") {
            this.jsonFields["KNOWN AILMENTS"] = key;
          } else if (key === "blood_group") {
            this.jsonFields["BLOOD GROUP"] = key;
          } else if (key === "emergency_contact") {
            this.jsonFields["EMERGENCY CONTACT"] = key;
          } else if (key === "emergency_name") {
            this.jsonFields["EMERGENCY NAME"] = key;
          } else if (key === "nysc_details") {
            this.jsonFields["NYSC DETAILS"] = key;
          } else if (key === "qualification") {
            this.jsonFields["QUALIFICATION"] = key;
          } else if (key === "pension_no") {
            this.jsonFields["PENSION NUMBER"] = key;
          } else if (key === "paye_no") {
            this.jsonFields["PAYE NUMBER"] = key;
          } else if (key === "nhf") {
            this.jsonFields["NHF"] = key;
          } else if (key === "hmo_no") {
            this.jsonFields["HMO NUMBER"] = key;
          } else if (key === "cost_center") {
            this.jsonFields["COST CENTER"] = key;
          } else if (key === "tax_amount") {
            this.jsonFields["TAX AMOUNT"] = key;
          } else if (key === "gross") {
            this.jsonFields["GROSS"] = key;
          } else if (key === "bvn") {
            this.jsonFields["BVN"] = key;
          } else if (key === "account_no") {
            this.jsonFields["ACCOUNT NUMBER"] = key;
          } else if (key === "bank") {
            this.jsonFields["BANK NAME"] = key;
          } else if (key === "status") {
            this.jsonFields["STATUS"] = key;
          }
        });
      });
    },
    async sortArrayOfObjects(array) {
      return array.sort(function (a, b) {
        let matchesA = a.emp_unique_id.match(/(\d+)/);
        matchesA = parseInt(matchesA[0]);
        let matchesB = b.emp_unique_id.match(/(\d+)/);
        matchesB = parseInt(matchesB[0]);
        return matchesA - matchesB;
      });
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.filtered = filteredItems;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "Employee Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Employee Report",
          active: true,
        },
      ],
      employees: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        {
          key: "emp_unique_id",
          label: "T7 Number",
          sortable: true,
        },
        { key: "emp_first_name", label: "First Name", sortable: true },
        { key: "emp_office_name", label: "Other Name", sortable: true },
        { key: "emp_last_name", label: "Last Name", sortable: true },
        { key: "emp_office_email", label: "Official Email", sortable: true },
        { key: "emp_personal_email", label: "Personal Email", sortable: true },
        { key: "emp_phone_no", label: "Phone", sortable: true },
        { key: "sector", label: "T3 Code", sortable: true },
        { key: "location", label: "T6 Code", sortable: true },
        { key: "jobrole", label: "Designation", sortable: true },
        { key: "unit", label: "Unit", sortable: true },
        { key: "supervisor", label: "Supervisor", sortable: true },
        { key: "start_date", label: "Start Date", sortable: true },
        { key: "end_date", label: "End Date", sortable: true },
        { key: "stop_date", label: "Stop Date", sortable: true },
        { key: "employment_date", label: "Employment Date", sortable: true },
        {
          key: "suspension_reason",
          label: "Suspension Reason",
          sortable: true,
        },
        { key: "dob", label: "Date of Birth", sortable: true },
        { key: "sex", label: "Sex", sortable: true },
        { key: "religion", label: "Religion", sortable: true },
        { key: "marital_status", label: "Marital Status", sortable: true },
        { key: "spouse_name", label: "Spouse Name", sortable: true },
        { key: "spouse_phone", label: "Spouse Phone", sortable: true },
        { key: "next_of_kin", label: "Next Of Kin", sortable: true },
        {
          key: "next_of_kin_phone",
          label: "Next Of Kin Phone",
          sortable: true,
        },
        {
          key: "next_of_kin_address",
          label: "Next Of Kin Address",
          sortable: true,
        },
        { key: "ailments", label: "Known Ailments", sortable: true },
        { key: "blood_group", label: "Blood Group", sortable: true },
        {
          key: "emergency_contact",
          label: "Emergency Contact",
          sortable: true,
        },
        {
          key: "emergency_name",
          label: "Emergency Contact Name",
          sortable: true,
        },
        { key: "nysc_details", label: "NYSC Details", sortable: true },
        { key: "qualification", label: "Qualification", sortable: true },
        { key: "pension_no", label: "Pension Number", sortable: true },
        { key: "paye_no", label: "PAYE Number", sortable: true },
        { key: "nhf", label: "NHF", sortable: true },
        { key: "hmo_no", label: "HMO Number", sortable: true },
        { key: "cost_center", label: "Cost Center", sortable: true },
        { key: "tax_amount", label: "Tax Amount", sortable: true },
        { key: "gross", label: "Gross", sortable: true },
        { key: "bvn", label: "BVN", sortable: true },
        { key: "account_no", label: "Account Number", sortable: true },
        { key: "bank", label: "Bank Name", sortable: true },
        { key: "status", label: "Status", sortable: true },
      ],
      jsonFields: {},
      filtered: [],
      status: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$router.push('/reports')">
        <i class="mdi mdi-plus mr-2"></i>
        Reports
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0">
                Employee Report ({{ status }})
                {{ new Date().toDateString() }}
              </h5>
              <span class="font-size-12 text-success">
                <JsonExcel
                  style="cursor: pointer"
                  :data="filtered"
                  :fields="jsonFields"
                  :name="`Employee_Report(${status}_${new Date().toDateString()}).xls`"
                >
                  Export to Excel
                </JsonExcel>
              </span>
            </div>
            <div class="row mt-4">
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_length" class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select
                      v-model="perPage"
                      size="sm"
                      :options="pageOptions"
                    ></b-form-select
                    >&nbsp;entries
                  </label>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div
                  id="tickets-table_filter"
                  class="dataTables_filter text-md-right"
                >
                  <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                      v-model="filter"
                      type="search"
                      placeholder="Search..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0" v-if="employees.length">
              <b-table
                ref="donor-table"
                bordered
                hover
                small
                :items="employees"
                :fields="fields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="onFiltered"
                show-empty
              >
                <template #cell(gross)="row">
                  <span class="text-right text-nowrap">{{ row.value }}</span>
                </template>
                <template #cell()="data">
                  <span class="text-nowrap">{{ data.value }}</span>
                </template>
              </b-table>
            </div>
            <div v-else>
              <p class="text-center my-5">
                Populating report table, please wait...
              </p>
            </div>
            <div class="row">
              <div class="col">
                <div
                  class="dataTables_paginate paging_simple_numbers float-right"
                >
                  <ul class="pagination pagination-rounded mb-0">
                    <!-- pagination -->
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="totalRows"
                      :per-page="perPage"
                    ></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
