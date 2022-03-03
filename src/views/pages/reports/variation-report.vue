<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import JsonExcel from "vue-json-excel";
export default {
  page: {
    title: "Variation Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    JsonExcel,
  },
  async mounted() {
    await this.fetchPaymentDefinitions();
  },
  methods: {
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
            variationObj[income.paymentName] = parseFloat(
              income.amount.toFixed(2)
            ).toLocaleString();
          });
          variation.deductions.forEach((deduction) => {
            variationObj[deduction.paymentName] = parseFloat(
              deduction.amount.toFixed(2)
            ).toLocaleString();
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
      title: "Variation Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Variation Report",
          active: true,
        },
      ],
      period: null,
      filtered: [],
      variations: [],
      paymentDefinitions: [],
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
        { key: "employeeName", label: "Employee", sortable: true },
        { key: "employeeUniqueId", label: "T7 Number", sortable: true },
        { key: "location", label: "Location (T6)", sortable: true },
        { key: "sector", label: "Sector (T3)", sortable: true },
        {
          key: "income",
          label: "Entitlements",
          sortable: true,
          thStyle: { width: "20%" },
        },
        {
          key: "deduction",
          label: "Deductions",
          sortable: true,
          thStyle: { width: "20%" },
        },
        { key: "netSalary", label: "Net Salary", sortable: true },
      ],
      newFields: ["sn", "t7_number", "employeeName", "location"],
      incomeFields: [],
      deductionFields: [],
      jsonFields: {},
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
              <h5 class="font-size-14 mb-0" v-if="period">
                Variation Report For Payroll Period:
                {{ (parseInt(period[0]) - 1) | getMonth }}
                {{ period[1] }}
              </h5>
              <span class="font-size-12 text-success">
                <JsonExcel
                  style="cursor: pointer"
                  :data="filtered"
                  :fields="jsonFields"
                  :name="`Variation_Report(${period[0]}-${period[1]}).xls`"
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
              <div class="col-sm-12 col-md-3 text-md-right">
                <b-form-group
                  label="Filter On"
                  label-cols-sm="8"
                  label-align-sm="right"
                  label-size="sm"
                  class="mb-0"
                  v-slot="{ ariaDescribedby }"
                >
                  <b-form-checkbox-group
                    v-model="filterOn"
                    :aria-describedby="ariaDescribedby"
                    class="mt-1"
                  >
                    <b-form-checkbox value="location">Location</b-form-checkbox>
                  </b-form-checkbox-group>
                </b-form-group>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-3">
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
            <div class="table-responsive mb-0" v-if="variations.length">
              <b-table
                ref="emolument-table"
                bordered
                hover
                small
                :items="variations"
                :fields="newFields"
                striped
                responsive="lg"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="onFiltered"
                show-empty
              >
                <template #cell(sn)="row">
                  <span>
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(t7_number)="row">
                  <span>
                    {{ row.item.employeeUniqueId }}
                  </span>
                </template>
                <template #cell(employeeName)="row">
                  <span>
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(employeeName)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(location)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>
                <template #cell()="data">
                  <span class="float-right">{{ data.value }}</span>
                </template>
              </b-table>
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
