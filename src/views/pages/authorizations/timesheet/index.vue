<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Time sheet Authorizations",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      // const url = `${this.ROUTES.timesheet}/authorization/supervisor/${this.getEmployee.emp_id}`;
      const url = `${this.ROUTES.timeAllocation}/authorization/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Authorizations Error").then((res) => {
        let count = 0;
        const { data, officers } = res.data;
        data.forEach((time) => {
          let found = false;
          if (this.applications.length === 0) {
            this.applications.push({
              sn: ++count,
              ref_no: time.ta_ref_no,
              payroll_month: time.ta_month,
              payroll_year: time.ta_year,
              breakdown: [
                {
                  t1code: time.ta_tcode,
                  charge: time.ta_charge,
                  t0code: time.ta_t0_code,
                  charge2: parseInt(time.ta_t0_percent),
                },
              ],
              status: time.ta_status ? time.ta_status : 0,
              employee: time.Employee,
            });
          } else {
            this.applications.every((application) => {
              if (time.ta_ref_no === application.ref_no) {
                application.breakdown.push({
                  t1code: time.ta_tcode,
                  charge: time.ta_charge,
                  t0code: time.ta_t0_code,
                  charge2: parseInt(time.ta_t0_percent),
                });
                found = true;
                return false;
              }
              return true;
            });
            if (!found) {
              this.applications.push({
                sn: ++count,
                ref_no: time.ta_ref_no,
                payroll_month: time.ta_month,
                payroll_year: time.ta_year,
                breakdown: [
                  {
                    t1code: time.ta_tcode,
                    charge: time.ta_charge,
                    t0code: time.ta_t0_code,
                    charge2: parseInt(time.ta_t0_percent),
                  },
                ],
                status: time.ta_status ? time.ta_status : 0,
                employee: time.Employee,
              });
            }
          }
        });
        this.applications.forEach((application) => {
          officers.forEach((officer) => {
            if (application.ref_no === officer.auth_travelapp_id) {
              application["Officer"] = officer.officers;
            }
          });
        });
        this.totalRows = this.applications.length;
        // const { data } = res;
        // data.forEach((application, index) => {
        //   this.applications[index] = { sn: ++index, ...application };
        // });
        // this.totalRows = this.applications.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.month = row.payroll_month;
      this.year = row.payroll_year;
      this.empId = row.employee.emp_id;
      this.$router.push({
        name: "view-time-sheet-authorization",
        params: { month: this.month, year: this.year, empId: this.empId },
      });
    },
  },
  data() {
    return {
      title: "Time sheet Authorizations",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Time sheet Authorizations",
          active: true,
        },
      ],
      applications: [],
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
          key: "employee",
          label: "Employee",
          sortable: true,
        },
        {
          key: "ref_no",
          label: "Ref No",
          sortable: true,
        },
        { key: "payroll_month", label: "Payroll Month", sortable: true },
        { key: "payroll_year", label: "Payroll Year", sortable: true },
        {
          key: "breakdown",
          label: "Percentage to Charge (T1)",
          sortable: true,
        },
        {
          key: "breakdown-2",
          label: "Percentage to Charge (T0)",
          sortable: false,
        },
        {
          key: "Officer",
          label: "Current Desk",
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
        },
      ],
      sn: 1,
      timesheetID: null,
      month: null,
      year: null,
      empId: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
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
                ref="donor-table"
                bordered
                selectable
                hover
                :items="applications"
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
                <template #cell(ref_no)="row">
                  <span class="text-uppercase">{{ row.value }}</span>
                </template>
                <template #cell(payroll_month)="row">
                  <span>{{ (parseFloat(row.value) - 1) | getMonth }}</span>
                </template>
                <template #cell(breakdown)="row">
                  <p
                    class="mb-0"
                    v-for="(charge, index) in row.value"
                    :key="index"
                  >
                    <span class="mr-3">T1 Code: {{ charge.t1code }}</span>
                    <span>Charge: {{ charge.charge }}%</span>
                  </p>
                </template>
                <template #cell(breakdown-2)="row">
                  <p
                    class="mb-0"
                    v-for="(charge, index) in row.item.breakdown"
                    :key="index"
                  >
                    <span class="mr-3">T0 Code: {{ charge.t0code }}</span>
                    <span>Charge: {{ charge.charge2 }}%</span>
                  </p>
                </template>
                <template #cell(employee)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }}
                    {{ row.value.emp_last_name }}
                  </p>
                  <small>
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>
                <template #cell(Officer)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }}
                    {{ row.value.emp_last_name }}
                  </p>
                  <small>
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>
                <template #cell(status)="row">
                  <span
                    v-if="row.value === 0"
                    class="badge badge-pill badge-warning"
                  >
                    pending
                  </span>
                  <span
                    v-else-if="row.value === 1"
                    class="badge badge-pill badge-success"
                  >
                    approved
                  </span>
                  <span
                    v-else-if="row.value === 2"
                    class="badge badge-pill badge-danger"
                  >
                    declined
                  </span>
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
