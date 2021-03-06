<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("APPROVE_PAYROLL")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Approve Payroll Routine",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  async mounted() {
    await this.getLocations();
    this.fetchPMY();
    await this.fetchPayrollRoutine();
  },
  data() {
    return {
      title: "Approve Payroll Routine",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Approve Payroll Routine",
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
    };
  },
  methods: {
    selectLocations(items) {
      this.selectedLocations = items;
    },
    selectAllRows() {
      this.$refs.payrollSummaryTable.selectAllRows();
    },

    clearSelected() {
      this.$refs.payrollSummaryTable.clearSelected();
    },
    getLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.payrollLocations = [
          { value: null, text: "Please select a location" },
        ];
        const { data } = res;
        data.forEach((location) => {
          this.payrollLocations.push({
            value: location.location_id,
            text: `${location.location_name} - (${location.l_t6_code} ) `,
          });
        });
      });
    },

    checkRoutine() {
      let url = `${this.ROUTES.salary}/check-salary-routine`;
      this.apiGet(url, "Check Payroll Routine Error").then((res) => {
        if (res.data === "Payroll Routine has not been run") {
          this.routineRun = false;
        }
      });
    },
    runRoutine() {
      let url = `${this.ROUTES.salary}/salary-routine`;
      const data = {
        pmyl_location_id: this.payrollLocation,
      };
      //this.apiPost(url, data, "Payroll Routine").then();
      this.apiPost(url, data, "Payroll Routine").then((res) => {
        if (res.data) {
          this.apiResponseHandler("Run Payroll Routine", res.data);
          this.fetchPayrollRoutine();
          this.$refs["run-routine"].hide();
        }
      });
    },
    undoRoutine() {
      let url = `${this.ROUTES.salary}/undo-salary-routine`;
      const data = {
        pmyl_location_id: this.payrollLocation,
      };
      this.apiPost(url, data, "Undo Payroll Routine Error").then((res) => {
        if (res.data) {
          this.routineRun = false;
          this.apiResponseHandler("Undo Payroll Routine", res.data);
          this.fetchPayrollRoutine();
          this.$refs["undo-routine"].hide();
        }
      });
    },

    confirmSelected() {
      this.submitted = true;
      this.locationIds = [];
      this.selectedLocations.forEach((location) => {
        this.locationIds.push(location.locationId);
      });
      //console.log(this.locationIds)

      const data = {
        pmyl_location_id: this.locationIds,
      };
      //console.log(data)
      const url = `${this.ROUTES.salary}/confirm-salary-routine`;
      this.apiPost(url, data, "Salary Confirmation").then((res) => {
        this.apiResponseHandler(`${res.data}`, "Salary Confirmed");
        this.selectedLocations = [];
        this.locationIds = [];
        this.fetchPayrollRoutine();
      });
    },

    async fetchPayrollRoutine() {
      let url = `${this.ROUTES.salary}/pull-confirmed-salary-routine-locations`;
      await this.apiGet(url, "Fetch Payroll Routine Error").then((res) => {
        console.log({ res });
        this.routineRun = true;
        const { data } = res;
        data.forEach((pay, index) => {
          this.pay[index] = { sn: ++index, ...pay };
        });
        this.totalRows = this.pay.length;
      });
    },

    resetForm() {
      this.payrollLocation = null;
    },

    fetchPMY() {
      this.apiGet(
        this.ROUTES.payrollMonthYear,
        "Get Payroll Month & Year Error"
      ).then((res) => {
        if (res.data) {
          const { pym_year, pym_month } = res.data;
          this.pmyMonth = pym_month;
          this.pmyYear = pym_year;
        }
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      let locationId = row.locationId;
      this.$router.push({
        name: "approve-emolument-location",
        params: { locationId },
      });
      this.$refs["payrollSummaryTable"].clearSelected();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div v-if="routineRun">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                  <h5 class="font-size-14 mb-0">
                    Payroll Summary For Payroll Period:
                    {{ (parseInt(pmyMonth) - 1) | getMonth }} {{ pmyYear }}
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
                  <scale-loader />
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

      <div v-else class="alert alert-info">
        The payroll routine for this payroll period
        <b> ({{ (parseInt(pmyMonth) - 1) | getMonth }} {{ pmyYear }})</b> hasn't
        been run for any location.
      </div>
    </div>

    <b-modal
      ref="run-routine"
      title="Run Payroll Routine"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="runRoutine">
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
          <b-select
            v-model="payrollLocation"
            :options="payrollLocations"
          ></b-select>
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>

    <b-modal
      ref="undo-routine"
      title="Undo Payroll Routine"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="undoRoutine">
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
          <b-select
            v-model="payrollLocation"
            :options="payrollLocations"
          ></b-select>
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>
  </Layout>
</template>
