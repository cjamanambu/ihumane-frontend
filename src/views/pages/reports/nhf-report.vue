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
    title: "NHF Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    JsonExcel,
  },
  mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      this.period = this.$route.params.period;
      this.period = this.period.split("-");
      this.location = this.$route.params.locationID;
      let data = {
        pym_month: parseFloat(this.period[0]),
        pym_year: parseFloat(this.period[1]),
        pym_location: parseFloat(this.location),
      };
      const url = `${this.ROUTES.salary}/nhf-report`;
      this.apiPost(url, data, "Generate nhf Report").then(async (res) => {
        const { data } = res;
        const newData = await this.sortArrayOfObjects(data);
        newData.forEach((nhf, index) => {
          this.locationName = nhf.location;
          // let pensionEmployeeContribution;
          // let pensionEmployeeContribution;
          // let voluntaryPension;
          //   if(typeof pensionArray[0])
          let nhfObj = {
            sn: ++index,
            employee_unique_id: nhf.employeeUniqueId,
            employeeName: nhf.employeeName,
            sector: nhf.sector,
            location: nhf.location,
            employee_gross:
              this.apiValueHandler(nhf.adjustedGross.toFixed(2)) ?? "0.00",
            nhf_contribution:
              this.apiValueHandler(nhf.nhfArray[0].Amount.toFixed(2)) ?? "0.00",
            month: nhf.month,
            year: nhf.year,
            nhf_number: nhf.pin,
          };
          this.nhfs.push(nhfObj);
        });
        this.filtered = this.nhfs;
        this.totalRows = this.nhfs.length;
        if (this.location === 0) {
          this.locationName = "All Locations";
        }
      });

      this.newFields.forEach((field) => {
        let key = field;
        if (key === "sn") {
          this.jsonFields["S/N"] = key;
        } else if (key === "employee_unique_id") {
          this.jsonFields["T7 NUMBER"] = key;
        } else if (key === "employeeName") {
          this.jsonFields["NAME"] = key;
        } else if (key === "sector") {
          this.jsonFields["SECTOR"] = key;
        } else if (key === "location") {
          this.jsonFields["LOCATION"] = key;
        } else if (key === "employee_gross") {
          this.jsonFields["EMPLOYEE GROSS"] = key;
        } else if (key === "nhf_contribution") {
          this.jsonFields["NHF CONTRIBUTION"] = key;
        } else if (key === "total") {
          this.jsonFields["TOTAL"] = key;
        } else if (key === "month") {
          this.jsonFields["MONTH"] = key;
        } else if (key === "year") {
          this.jsonFields["YEAR"] = key;
        } else if (key === "nhf_number") {
          this.jsonFields["nhf NUMBER"] = key;
        }
      });
    },
    async sortArrayOfObjects(array) {
      return array.sort(function (a, b) {
        let matchesA = a.employeeUniqueId.match(/(\d+)/);
        matchesA = parseInt(matchesA[0]);

        let matchesB = b.employeeUniqueId.match(/(\d+)/);
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
  },
  data() {
    return {
      title: "NHF Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "NHF Report",
          active: true,
        },
      ],
      period: null,
      filtered: [],
      nhfs: [],
      paymentDefinitions: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      newFields: [
        "sn",
        "employee_unique_id",
        "employeeName",
        "sector",
        "location",
        "nhf_number",
        "month",
        "year",
        "employee_gross",
        "nhf_contribution",
      ],
      incomeFields: [],
      deductionFields: [],
      jsonFields: {},
      location: null,
      locationName: null,
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
                NHF Report for
                {{ locationName }} in Payroll Period:
                {{ (parseInt(period[0]) - 1) | getMonth }}
                {{ period[1] }}
              </h5>
              <span class="font-size-12 text-success">
                <JsonExcel
                  style="cursor: pointer"
                  :data="nhfs"
                  :fields="jsonFields"
                  :name="`nhf_Report_${locationName}(${period[0]}-${period[1]}).xls`"
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
              <!--              <div class="col-sm-12 col-md-3 text-md-right">-->
              <!--                <b-form-group-->
              <!--                  label="Filter On"-->
              <!--                  label-cols-sm="7"-->
              <!--                  label-align-sm="right"-->
              <!--                  label-size="sm"-->
              <!--                  class="mb-0"-->
              <!--                  v-slot="{ ariaDescribedby }"-->
              <!--                >-->
              <!--                  <b-form-checkbox-group-->
              <!--                    v-model="filterOn"-->
              <!--                    :aria-describedby="ariaDescribedby"-->
              <!--                    class="mt-1"-->
              <!--                  >-->
              <!--                    <b-form-checkbox value="location">Location</b-form-checkbox>-->
              <!--                  </b-form-checkbox-group>-->
              <!--                </b-form-group>-->
              <!--              </div>-->
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
            <div class="table-responsive mb-0" v-if="nhfs.length">
              <b-table
                ref="deduction-table"
                bordered
                hover
                small
                :items="nhfs"
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
                <template #cell(employee_unique_id)="row">
                  <span>
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(employeeName)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(sector)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>

                <template #cell(location)="row">
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

                <template #cell(employee_gross)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>

                <template #cell(nhf_contribution)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>

                <template #cell(nhf_number)="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
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
