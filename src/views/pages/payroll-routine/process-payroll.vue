<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Process Payroll Routine",
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
      title: "Process Payroll Routine",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Process Payroll Routine",
          active: true,
        },
      ],
      routineRun: false,
      pay: [],
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
        { key: "grossSalary", label: "Gross Salary", sortable: true },
        { key: "totalDeduction", label: "Total Deduction", sortable: true },
        { key: "netSalary", label: "Net Salary", sortable: true },
      ],
      pmyMonth: null,
      pmyYear: null,
      payrollLocations: null,
      payrollLocation: null,
    };
  },
  methods: {
    getLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.payrollLocations = [
          { value: null, text: "Please select a location" },
        ];
        const { data } = res;
        console.log(data);
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
          this.fetchPayrollRoutine();
          this.apiResponseHandler("Undo Payroll Routine", res.data);
          this.$refs["undo-routine"].hide();
        }
      });
    },
    confirmRoutine() {
      let url = `${this.ROUTES.salary}/confirm-salary-routine`;
      this.apiGet(url, "Confirm Payroll Routine Error").then((res) => {
        if (res.data) {
          this.apiResponseHandler("Confirm Payroll Routine", res.data);
        }
      });
    },
    approveRoutine() {
      let url = `${this.ROUTES.salary}/approve-salary-routine`;
      this.apiGet(url, "Approve Payroll Routine Error").then((res) => {
        if (res.data) {
          this.apiResponseHandler("Approve Payroll Routine", res.data);
        }
      });
    },
    async fetchPayrollRoutine() {
      let url = `${this.ROUTES.salary}/pull-salary-routine`;
      await this.apiGet(url, "Fetch Payroll Routine Error").then((res) => {
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
          console.log(res.data);
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
      let empID = row.employeeId;
      this.$router.push({ name: "view-payslip", params: { empID } });
      this.$refs["payroll-summary-table"].clearSelected();
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
        <div class="alert alert-info">
          The payroll routine for this payroll period
          <b> ({{ (parseInt(pmyMonth) - 1) | getMonth }} {{ pmyYear }})</b> has
          been run for some(all) locations.
          <span
            @click="$refs['run-routine'].show()"
            style="
              cursor: pointer;
              text-decoration: underline;
              margin-left: 0.1em;
            "
          >
            Click here to run it.
          </span>
        </div>
        <div class="d-flex justify-content-end mb-3">
          <b-button
            class="btn btn-warning"
            @click="$refs['undo-routine'].show()"
          >
            <i class="mdi mdi-plus mr-2"></i>
            Undo Routine
          </b-button>
          <b-button class="btn btn-success mx-3" @click="confirmRoutine">
            <i class="mdi mdi-plus mr-2"></i>
            Confirm Routine
          </b-button>
          <b-button class="btn btn-success" @click="approveRoutine">
            <i class="mdi mdi-plus mr-2"></i>
            Approve Routine
          </b-button>
        </div>
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
                <div class="table-responsive mb-0">
                  <b-table
                    ref="payroll-summary-table"
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
                    <template #cell(grossSalary)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
                    </template>
                    <template #cell(netSalary)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
                    </template>
                    <template #cell(totalDeduction)="row">
                      <p class="float-right mb-0">
                        {{ parseFloat(row.value.toFixed(2)).toLocaleString() }}
                      </p>
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
      </div>

      <div v-else class="alert alert-info">
        The payroll routine for this payroll period
        <b> ({{ (parseInt(pmyMonth) - 1) | getMonth }} {{ pmyYear }})</b> hasn't
        been run for any location.
        <span
          @click="$refs['run-routine'].show()"
          style="
            cursor: pointer;
            text-decoration: underline;
            margin-left: 0.1em;
          "
        >
          Click here to run it.
        </span>
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
