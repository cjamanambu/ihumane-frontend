<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("APPLICATION_TRACKING")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Application Tracking",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  async mounted() {
    //await this.getPendingLeaveApplications();
    //await this.getTimesheet();
    await this.getSelfAssessmentSubmissions();
    //this.getTravelApplications()
  },
  methods: {
    //this.getSelfAssessmentSubmissions();
    //this.getTimesheet();
    //this.getPendingLeaveApplications();
    //this.getTravelApplications();

    async getPendingLeaveApplications() {
      const url = `${this.ROUTES.leaveApplication}/get-leave-applications/0`;
      this.apiGet(url, "Get Leave Applications Error").then((res) => {
        res.data.forEach((leave, index) => {
          //console.log(leave.leave_authorizer[index].officers?.emp_first_name);
          this.leaves[index] = {
            sn: ++index,
            leave_employee: `${leave.employee.emp_first_name} ${leave.employee?.emp_last_name} `,
            current_desk: `${leave.leave_authorizer[index]?.officers.emp_first_name}  ${leave.leave_authorizer[index]?.officers.emp_last_name} (${leave.leave_authorizer[index]?.officers.emp_unique_id} ) `,
            lea_type: `${leave.leave_type?.leave_name}(${leave.leapp_total_days})`,
            leave_t6: leave.employee.location?.location_name,
            leave_t3: leave.employee.sector?.department_name,
            leave_t7: leave.employee?.emp_unique_id,
            leapp_id: leave.leapp_id,
            leave_date: new Date(leave.leapp_start_date).toDateString(),
            ...leave,
          };
        });
        this.totalRows = this.leaves.length;
      });
    },
    selectRow(row) {
      row = row[0];
      this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "leave-application-tracking",
        params: { leaveAppID: this.leaveAppID },
      });
    },
    async timesheetSelectRow(row) {
      row = row[0];
      //console.log({ row });
      const month = `${row.payroll_month}`;
      const year = `${row.payroll_year}`;
      const empId = row.employee.emp_id;
      this.$router.push({
        name: "manage-time-sheet-details",
        params: { month, year, empId },
      });
    },
    selectSelfAssessmentRow(row) {
      row = row[0];
      this.employeeId = row.empId;
      this.selectedYear = row.year;
      this.$router.push({
        name: "self-assessment-backoffice-breakdown",
        params: { year: this.selectedYear, employee: this.employeeId },
      });
    },
    selectTravelRow(row) {
      row = row[0];
      this.travelAppID = row.travelapp_id;
      this.$router.push({
        name: "travel-application-details",
        params: { travelAppID: this.travelAppID },
      });
    },
    timesheetOnFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.timesheet_totalRows = filteredItems.length;
      this.timesheet_currentPage = 1;
    },
    selfOnFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.selftotalRows = filteredItems.length;
      this.selfcurrentPage = 1;
    },
    getTimesheet() {
      const url = `${this.ROUTES.timeAllocation}/get-timesheet-submission/0`;
      this.apiGet(url, "Get Time Allocation Error").then((res) => {
        const { data } = res;
        data.forEach((timesheet, serial) => {
          this.timesheets[serial] = {
            serial_no: ++serial,
            timesheet_employee: `${timesheet.employee.emp_first_name} ${timesheet.employee?.emp_last_name} `,
            timesheet_current_desk: "Current", //`${leave.leave_authorizer[index].officers.emp_first_name}  `,
            timesheet_period: `${timesheet.ta_month}-${timesheet.ta_year}`, //`${timesheet.leave_type?.leave_name}(${leave.leapp_total_days})`,
            timesheet_t6: timesheet.employee.location?.location_name,
            timesheet_t3: timesheet.employee.sector?.department_name,
            timesheet_t7: timesheet.employee?.emp_unique_id,
            ta_id: timesheet.ta_id,
            payroll_month: timesheet.ta_month,
            payroll_year: timesheet.ta_year,
            employee: timesheet.ta_emp_id,
            timesheet_date: new Date(timesheet.createdAt).toDateString(),
            ...timesheet,
          };
        });
        this.timesheet_totalRows = this.timesheets.length;
      });
    },
    async getSelfAssessmentSubmissions() {
      const url = `${this.ROUTES.selfAssessment}/get-self-assessments-status/0`;
      this.apiGet(url, "Get Self-assessment Error").then((res) => {
        const { data } = res;
        //console.log(data)
        data.forEach((self, serial) => {
          this.selfAssessements[serial] = {
            self_no: ++serial,
            self_employee: `${self.employee.emp_first_name} ${self.employee?.emp_last_name} `,
            self_current_desk: `${self.supervisor.emp_first_name} ${self.supervisor.emp_last_name} (${self.supervisor.emp_unique_id} ) `,
            self_goal: `${self.sam_year}`,
            self_t6: self.employee.location?.location_name,
            self_t3: self.employee.sector?.department_name,
            self_t7: self.employee?.emp_unique_id,
            ta_id: self.sam_id,
            year: self.sam_year,
            //payroll_month: self.ta_month,
            //payroll_year: self.ta_year,
            empId: self.sam_emp_id,
            self_date: new Date(self.createdAt).toDateString(),
            ...self,
          };
        });
        this.selftotalRows = this.selfAssessements.length;
      });
    },
    getTravelApplications() {
      const url = `${this.ROUTES.travelApplication}/get-travel-application-status/0`;
      this.apiGet(url, "Get Travel Application Error").then((res) => {
        const { data } = res;
        console.log(data);
        data.forEach((application, serial) => {
          this.travelApplications[serial] = {
            application_no: ++serial,
            application_employee: `${application.applicant.emp_first_name} ${application.applicant?.emp_last_name} `,
            application_current_desk: `${application.authorizers?.officers.emp_first_name} ${application.authorizers?.officers.emp_last_name} (${application.authorizers?.officers.emp_unique_id}) `,
            application_purpose: `${application.travelapp_purpose}`,
            application_t6: application.applicant.location?.location_name,
            application_t3: application.applicant.sector?.department_name,
            application_t7: application.applicant?.emp_unique_id,
            empId: self.sam_emp_id,
            travelapp_id: application.travelapp_id,
            application_date: new Date(
              application.travelapp_start_date
            ).toDateString(),
            ...self,
          };
        });
        this.application_totalRows = this.travelApplications.length;
      });
    },
  },
  data() {
    return {
      title: "Application Tracking",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Application Tracking",
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

      //timesheet
      timesheet_totalRows: 1,
      timesheet_currentPage: 1,
      timesheet_perPage: 10,
      timesheet_pageOptions: [10, 25, 50, 100],
      timesheet_filter: null,
      timesheet_filterOn: [],
      timesheet_sortBy: "sn",
      timesheet_sortDesc: false,

      //self-assessment
      self_totalRows: 1,
      self_currentPage: 1,
      self_perPage: 10,
      self_pageOptions: [10, 25, 50, 100],
      self_filter: null,
      self_filterOn: [],
      self_sortBy: "sn",
      self_sortDesc: false,

      //travel application
      application_totalRows: 1,
      application_currentPage: 1,
      application_perPage: 10,
      application_pageOptions: [10, 25, 50, 100],
      application_filter: null,
      application_filterOn: [],
      application_sortBy: "sn",
      application_sortDesc: false,

      leave_fields: [
        { key: "sn", label: "S/n", sortable: true },
        {
          key: "leave_t7",
          label: "T7",
          sortable: true,
        },
        { key: "leave_employee", label: "Employee", sortable: true },

        { key: "leave_t6", label: "T6", sortable: true },
        { key: "leave_t3", label: "T3", sortable: true },
        { key: "lea_type", label: "Leave Type(No. of Days)", sortable: true },
        { key: "current_desk", label: "Current Desk", sortable: true },
        { key: "leave_date", label: "Date Applied", sortable: true },
      ],

      //timesheet fields
      timesheet_fields: [
        { key: "serial_no", label: "S/n", sortable: true },
        {
          key: "timesheet_t7",
          label: "T7",
          sortable: true,
        },
        { key: "timesheet_employee", label: "Employee", sortable: true },

        { key: "timesheet_t6", label: "T6", sortable: true },
        { key: "timesheet_t3", label: "T3", sortable: true },
        { key: "timesheet_period", label: "Period", sortable: true },
        { key: "current_desk", label: "Current Desk", sortable: true },
        { key: "timesheet_date", label: "Date Submitted", sortable: true },
      ],

      //self-assessment fields
      self_fields: [
        { key: "self_no", label: "S/n", sortable: true },
        {
          key: "self_t7",
          label: "T7",
          sortable: true,
        },
        { key: "self_employee", label: "Employee", sortable: true },

        { key: "self_t6", label: "T6", sortable: true },
        { key: "self_t3", label: "T3", sortable: true },
        { key: "self_goal", label: "Goal Setting", sortable: true },
        { key: "self_current_desk", label: "Current Desk", sortable: true },
        { key: "self_date", label: "Date", sortable: true },
      ],

      //travel application fields
      travel_fields: [
        { key: "application_no", label: "S/n", sortable: true },
        {
          key: "application_t7",
          label: "T7",
          sortable: true,
        },
        { key: "application_employee", label: "Employee", sortable: true },

        { key: "application_t6", label: "T6", sortable: true },
        { key: "application_t3", label: "T3", sortable: true },
        { key: "application_purpose", label: "Purpose", sortable: true },
        {
          key: "application_current_desk",
          label: "Current Desk",
          sortable: true,
        },
        { key: "application_date", label: "Start Date", sortable: true },
      ],
      leaves: [],
      timesheets: [],
      selfAssessements: [],
      travelApplications: [],
      selfId: null,
      timesheetId: null,
      travelId: null,
      leaveAppID: null,
      text: "Text here",
      content: "Content goes here",
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">Application Tracking</h4>
            <p class="card-title-desc">Various pending applications</p>
            <b-tabs
              justified
              nav-class="nav-tabs-custom"
              content-class="p-3 text-muted"
            >
              <b-tab active>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="fas fa-home"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">Leave</span>
                </template>
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
                <div class="table-responsive mb-0 mt-4">
                  <b-table
                    ref="leave-table"
                    bordered
                    selectable
                    hover
                    :items="leaves"
                    :fields="leave_fields"
                    responsive="sm"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :filter="filter"
                    :filter-included-fields="filterOn"
                    show-empty
                    select-mode="single"
                    @row-selected="selectRow"
                  >
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
              </b-tab>
              <b-tab>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="far fa-user"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">Timesheet</span>
                </template>
                <div class="row mt-4">
                  <div class="col-12">
                    <div class="card">
                      <div class="card-body">
                        <div class="row mt-4">
                          <div class="col-sm-12 col-md-6">
                            <div
                              id="tickets-table_length1"
                              class="dataTables_length"
                            >
                              <label class="d-inline-flex align-items-center">
                                Show&nbsp;
                                <b-form-select
                                  v-model="timesheet_perPage"
                                  size="sm"
                                  :options="timesheet_pageOptions"
                                ></b-form-select
                                >&nbsp;entries
                              </label>
                            </div>
                          </div>
                          <!-- Search -->
                          <div class="col-sm-12 col-md-6">
                            <div
                              id="tickets-table_filter2"
                              class="dataTables_filter text-md-right"
                            >
                              <label class="d-inline-flex align-items-center">
                                Search:
                                <b-form-input
                                  v-model="timesheet_filter"
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
                            :items="timesheets"
                            :fields="timesheet_fields"
                            responsive="sm"
                            :per-page="timesheet_perPage"
                            :current-page="timesheet_currentPage"
                            :sort-by.sync="timesheet_sortBy"
                            :sort-desc.sync="timesheet_sortDesc"
                            :filter="timesheet_filter"
                            :filter-included-fields="timesheet_filterOn"
                            @filtered="timesheetOnFiltered"
                            show-empty
                            select-mode="single"
                            @row-selected="timesheetSelectRow"
                          >
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
                                  v-model="timesheet_currentPage"
                                  :total-rows="timesheet_totalRows"
                                  :per-page="timesheet_perPage"
                                ></b-pagination>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tab>
              <b-tab>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="far fa-envelope"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">Self Assessment</span>
                </template>
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                      <div class="row mt-4">
                        <div class="col-sm-12 col-md-6">
                          <div
                            id="tickets-table_length11"
                            class="dataTables_length"
                          >
                            <label class="d-inline-flex align-items-center">
                              Show&nbsp;
                              <b-form-select
                                v-model="self_perPage"
                                size="sm"
                                :options="self_pageOptions"
                              ></b-form-select
                              >&nbsp;entries
                            </label>
                          </div>
                        </div>
                        <!-- Search -->
                        <div class="col-sm-12 col-md-6">
                          <div
                            id="tickets-table_filter21"
                            class="dataTables_filter text-md-right"
                          >
                            <label class="d-inline-flex align-items-center">
                              Search:
                              <b-form-input
                                v-model="self_filter"
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
                          :items="selfAssessements"
                          :fields="self_fields"
                          responsive="sm"
                          :per-page="self_perPage"
                          :current-page="self_currentPage"
                          :sort-by.sync="self_sortBy"
                          :sort-desc.sync="self_sortDesc"
                          :filter="self_filter"
                          :filter-included-fields="self_filterOn"
                          show-empty
                          select-mode="single"
                          @row-selected="selectSelfAssessmentRow"
                        >
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
                                v-model="self_currentPage"
                                :total-rows="self_totalRows"
                                :per-page="self_perPage"
                              ></b-pagination>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tab>
              <b-tab>
                <template v-slot:title>
                  <span class="d-inline-block d-sm-none">
                    <i class="fas fa-cog"></i>
                  </span>
                  <span class="d-none d-sm-inline-block">Travels</span>
                </template>
                <div class="col-12">
                  <div class="card">
                    <div class="card-body">
                      <div class="row mt-4">
                        <div class="col-sm-12 col-md-6">
                          <div
                            id="tickets-table_length111"
                            class="dataTables_length"
                          >
                            <label class="d-inline-flex align-items-center">
                              Show&nbsp;
                              <b-form-select
                                v-model="application_perPage"
                                size="sm"
                                :options="application_pageOptions"
                              ></b-form-select
                              >&nbsp;entries
                            </label>
                          </div>
                        </div>
                        <!-- Search -->
                        <div class="col-sm-12 col-md-6">
                          <div
                            id="tickets-table_filter211"
                            class="dataTables_filter text-md-right"
                          >
                            <label class="d-inline-flex align-items-center">
                              Search:
                              <b-form-input
                                v-model="application_filter"
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
                          :items="travelApplications"
                          :fields="travel_fields"
                          responsive="sm"
                          :per-page="application_perPage"
                          :current-page="application_currentPage"
                          :sort-by.sync="application_sortBy"
                          :sort-desc.sync="application_sortDesc"
                          :filter="application_filter"
                          :filter-included-fields="application_filterOn"
                          show-empty
                          select-mode="single"
                          @row-selected="selectTravelRow"
                        >
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
                                v-model="application_currentPage"
                                :total-rows="application_totalRows"
                                :per-page="application_perPage"
                              ></b-pagination>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
