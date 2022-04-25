<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import JsonExcel from "vue-json-excel";

export default {
  page: {
    title: "Deduction Report",
    meta: [{name: "description", content: appConfig.description}],
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
      this.deduction = this.$route.params.pdID;
      this.apiGet(
          this.ROUTES.paymentDefinition,
          "Get Payment Definitions Error"
      ).then(async (res) => {
        const {data} = res;
        this.paymentDefinitions = data;
        await this.processFields(data);
        this.newFields.push(...this.deductionFields);
        this.newFields.forEach((newField) => {
          if (newField === "sn") {
            this.jsonFields["S/N"] = newField;
          } else if (newField === "t7_number") {
            this.jsonFields["T7 NUMBER"] = "employeeUniqueId";
          } else if (newField === "t6_code") {
            this.jsonFields["T6 CODE"] = "location";
          } else if (newField === "t3_code") {
            this.jsonFields["T3 CODE"] = "sector";
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

    // dynamicSort(property) {
    //   let sortOrder = 1;
    //   if (property[0] === "-") {
    //     sortOrder = -1;
    //     property = property.substr(1);
    //   }
    //   return function (a, b) {
    //     const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    //     return result * sortOrder;
    //   }
    // },
    refreshTable() {
      this.period = this.$route.params.period;
      this.period = this.period.split("-");
      this.deduction = this.$route.params.pdID;
      let data = {
        pym_month: parseFloat(this.period[0]),
        pym_year: parseFloat(this.period[1]),
        pd_id: parseFloat(this.deduction),
      };
      const url = `${this.ROUTES.salary}/deduction-report-type`;

      this.apiPost(url, data, "Generate Deduction Report").then(async (res) => {
        const {data} = res;
        console.log(data)
        this.deductionSum = 0;
        const newData = await this.sortArrayOfObjects(data)

        newData.forEach((deduction, index) => {
          let deductionObj = {
            sn: ++index,
            employeeUniqueId: deduction.employeeUniqueId,
            employeeName: deduction.employeeName,
            location: deduction.locationCode,
            sector: deduction.sectorCode,
            month: deduction.month,
            year: deduction.year
          };
          deductionObj['ref_no'] = deduction.paymentNumber
          deduction.deductions.forEach((deduction) => {
            this.deductionSum += deduction.amount;
            deductionObj[deduction.paymentName] = this.apiValueHandler(
                deduction.amount.toFixed(2)
            );
          });


          this.deductions.push(deductionObj);
        });
        this.filtered = this.deductions;
        this.totalRows = this.deductions.length;
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
      this.deductionFields.push(`ref_no`)
      await data.forEach((paymentDefinition, index) => {
        if (paymentDefinition.pd_id === parseFloat(this.deduction)) {
          this.deductionName = data[index].pd_payment_name;
          this.deductionFields.push(data[index].pd_payment_name);

        }
      });

    },

    async sortArrayOfObjects(array) {
      return array.sort(function (a, b) {

        let matchesA = a.employeeUniqueId.match(/(\d+)/);
        matchesA = parseInt(matchesA[0])

        let matchesB = b.employeeUniqueId.match(/(\d+)/);
        matchesB = parseInt(matchesB[0])

        return matchesA - matchesB;
      })
    },


    // dynamicSort(property) {
    //   let sortOrder = 1;
    //   if (property[0] === "-") {
    //     sortOrder = -1;
    //     property = property.substr(1);
    //   }
    //   return function (a, b) {
    //     const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    //     return result * sortOrder;
    //   }
    // }
  },
  data() {
    return {
      title: "Deduction Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Deduction Report",
          active: true,
        },
      ],
      period: null,
      filtered: [],
      deductions: [],
      paymentDefinitions: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "t7_number",
      sortDesc: false,
      newFields: ["sn", "t7_number", "t6_code", "t3_code", "employeeName", "month", "year"],
      incomeFields: [],
      deductionFields: [],
      jsonFields: {},
      deduction: null,
      deductionName: null,
      deductionSum: 0,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items"/>
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$router.push('/reports')">
        <i class="mdi mdi-plus mr-2"></i>
        Reports
      </b-button>
    </div>
    <scale-loader v-if="apiBusy"/>
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0" v-if="period">
                Deduction Report For Payroll Period:
                {{ (parseInt(period[0]) - 1) | getMonth }}
                {{ period[1] }}
              </h5>
              <span class="font-size-12 text-success">
                <JsonExcel
                    style="cursor: pointer"
                    :data="filtered"
                    :fields="jsonFields"
                    :name="`Deduction_Report_${deductionName}(${period[0]}-${period[1]}).xls`"
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
                    label-cols-sm="7"
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
            <div class="table-responsive mb-0" v-if="deductions.length">
              <b-table
                  ref="deduction-table"
                  bordered
                  hover
                  small
                  :items="deductions"
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
                  <span class="text-nowrap">
                    {{ row.item.employeeUniqueId }}
                  </span>
                </template>

                <template #cell(t6_code)="row">
                  <span class="text-nowrap">
                    {{ row.item.location }}
                  </span>
                </template>

                <template #cell(t3_code)="row">
                  <span class="text-nowrap">
                    {{ row.item.sector }}
                  </span>
                </template>
                <template #cell(employeeName)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>

                <template #cell(month)="row">
                  <span class="text-nowrap">
                     {{ (parseInt(row.value) - 1) | getMonth }}

                  </span>
                </template>
                <template #cell(year)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>
                <template #cell()="data">
                  <span class="float-right">{{ data.value }}</span>
                </template>
              </b-table>
            </div>
            <div v-else>
              <p class="text-center my-5">
                Populating report table, please wait...
              </p>
            </div>
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0" v-if="period">
                Total {{ deductionName }}
              </h5>
              <h5 class="font-size-16 mb-0">
                {{ apiValueHandler(deductionSum.toFixed(2)) }}
              </h5>
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
