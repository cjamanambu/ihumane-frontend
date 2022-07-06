<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import store from "@/state/store";
//import JsonExcel from "vue-json-excel";
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
    title: "Approved Salary Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  async mounted() {
    await this.fetchPayrollRoutine();
  },
  methods: {
    selectRow(row) {
      row = row[0];
      let locationId = row.locationId;
      this.period = this.$route.params.period;
      this.period = this.period.split("-");
      let month = this.period[0];
      let year = this.period[1];

      this.$router.push({
        name: "view-approved-salary-routine",
        params: { locationId, month, year },
      });
      this.$refs["payrollSummaryTable"].clearSelected();
    },

    async fetchPayrollRoutine() {
      this.period = this.$route.params.period;
      this.period = this.period.split("-");

      let data = {
        pym_month: parseFloat(this.period[0]),
        pym_year: parseFloat(this.period[1]),
      };
      let url = `${this.ROUTES.salary}/pull-approved-salary-routine-locations`;
      await this.apiPost(url, data, "Fetch Payroll Routine Error").then(
        (res) => {
          this.routineRun = true;
          const { data } = res;
          data.forEach((pay, index) => {
            this.pay[index] = { sn: ++index, ...pay };
          });
          this.totalRows = this.pay.length;
        }
      );
    },
    fetchPaymentDefinitions() {
      this.paymentDefinitions = [];
      this.apiGet(
        this.ROUTES.paymentDefinition,
        "Get Payment Definitions Error"
      ).then(async (res) => {
        const { data } = res;
        this.paymentDefinitions = data;
        await this.processFields(data);
        this.newFields.push(...this.incomeFields);
        this.newFields.push(...this.deductionFields);
        this.newFields.forEach((newField) => {
          if (newField === "sn") {
            this.jsonFields["S/N"] = newField;
          } else if (newField === "t7_number") {
            this.jsonFields["T7 NUMBER"] = "employeeUniqueId";
          } else if (newField === "employeeName") {
            this.jsonFields["EMPLOYEE NAME"] = newField;
          } else if (newField === "netSalary") {
            this.jsonFields["NET SALARY"] = newField;
          } else if (newField === "grossSalary") {
            this.jsonFields["GROSS SALARY"] = newField;
          } else if (newField === "totalDeduction") {
            this.jsonFields["TOTAL DEDUCTION"] = newField;
          } else {
            this.jsonFields[newField.toUpperCase()] = newField;
          }
        });
        await this.refreshTable();
      });
    },
    refreshTable() {
      this.period = this.$route.params.period;
      this.period = this.period.split("-");
      let data = {
        pym_month: parseFloat(this.period[0]),
        pym_year: parseFloat(this.period[1]),
      };
      const url = `${this.ROUTES.salary}/variation-report`;
      this.apiPost(url, data, "Generate Variation Report").then((res) => {
        const { data } = res;
        data.forEach((variation, index) => {
          let variationObj = {
            sn: ++index,
            employeeUniqueId: variation.employeeUniqueId,
            employeeName: variation.employeeName,
            location: variation.location,
          };
          variation.incomes.forEach((income) => {
            variationObj[income.paymentName] = this.apiValueHandler(
              income.amount.toFixed(2)
            );
          });
          variation.deductions.forEach((deduction) => {
            variationObj[deduction.paymentName] = this.apiValueHandler(
              deduction.amount.toFixed(2)
            );
          });
          this.variations.push(variationObj);
        });
        this.filtered = this.variations;
        this.totalRows = this.variations.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.filtered = filteredItems;
      this.currentPage = 1;
    },
    decimalPlaces(float, length) {
      let ret = "";
      let str = float.toString();
      let array = str.split(".");
      if (array.length === 2) {
        ret += array[0] + ".";
        for (let i = 0; i < length; i++) {
          if (i >= array[1].length) ret += "0";
          else ret += array[1][i];
        }
      } else if (array.length === 1) {
        ret += array[0] + ".";
        for (let i = 0; i < length; i++) {
          ret += "0";
        }
      }
      return ret;
    },
    async processFields(data) {
      await data.forEach((paymentDefinition, index) => {
        if (paymentDefinition.pd_payment_variant === 2) {
          if (paymentDefinition.pd_payment_type === 1) {
            this.incomeFields.push(data[index].pd_payment_name);
          } else if (paymentDefinition.pd_payment_type === 2) {
            this.deductionFields.push(data[index].pd_payment_name);
          }
        }
      });
    },
  },
  data() {
    return {
      title: "Approved Salary Routine Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Approved Salary Routine Report",
          active: true,
        },
      ],
      routineRun: false,
      pay: [],
      selectedLocations: [],
      locationIds: [],
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
        { key: "locationName", label: "Location", sortable: true },
        { key: "locationTotalGross", label: "Total Gross", sortable: true },
        {
          key: "locationTotalDeduction",
          label: "Total Deduction",
          sortable: true,
        },
        { key: "locationTotalNet", label: "Total Net", sortable: true },
        {
          key: "locationEmployeesCount",
          label: "Total Employees",
          sortable: true,
        },
        { key: "month", label: "month", sortable: true },
        { key: "year", label: "year", sortable: true },
      ],
      pmyMonth: null,
      pmyYear: null,
      payrollLocations: null,
      payrollLocation: null,
      period: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div>
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                  <h5 class="font-size-14 mb-0">
                    Payroll Summary For Payroll Period:
                    {{ (parseFloat(period[0]) - 1) | getMonth }} {{ period[1] }}
                  </h5>
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
                <div class="table-responsive mb-0" v-if="pay.length">
                  <b-table
                    ref="payrollSummaryTable"
                    bordered
                    selectable
                    hover
                    :items="pay"
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
                    select-mode="single"
                    @row-selected="selectRow"
                  >
                    <template #cell(locationTotalGross)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
                    </template>
                    <template #cell(locationTotalDeduction)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
                    </template>
                    <template #cell(locationTotalNet)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
                    </template>

                    <template #cell(month)="row">
                      <p class="mb-0">
                        {{ (parseInt(row.value) - 1) | getMonth }}
                      </p>
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
      </div>
    </div>
  </Layout>
</template>
