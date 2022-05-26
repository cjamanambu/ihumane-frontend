<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";

export default {
  page: {
    title: "Leave Details",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
  },
  mounted() {
    this.fetchLeaveDocuments();
  },
  validations: {
    comment: { required },
    official: { required },
  },
  methods: {
    fetchLeaveDocuments() {
      const leaveApplicationID = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveDoc}/${leaveApplicationID}`;
      this.apiGet(url, "Get Supporting Documents Error").then((res) => {
        const { data } = res;
        data.forEach((doc, index) => {
          this.supportingDocs[index] = { sn: ++index, ...doc };
        });
        this.totalRows = this.supportingDocs.length;
        this.fetchRequest();
      });
    },
    fetchRequest() {
      let requestID = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveApplication}/${requestID}`;
      this.apiGet(url, "Get Leave Application").then((res) => {
        const { application, log, previousApplications } = res.data;
        this.application = application;
        previousApplications.forEach((prev, index) => {
          if (prev.leapp_id !== parseFloat(this.$route.params.leaveAppID)) {
            this.previous_applications[index] = {
              sn: ++index,
              leaveType: prev.leave_type.leave_name,
              ...prev,
            };
          }
        });
        this.log = log;
        this.fetchEmployees();
      });
    },
    fetchEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        this.officials = [
          {
            value: null,
            text: "Please choose the next reviewer",
            disabled: true,
          },
        ];
        const { data } = res;
        data.forEach((employee) => {
          // employee.emp_id !== this.application.Employee.emp_id &&
          if (employee.emp_id !== this.getEmployee.emp_id) {
            this.officials.push({
              value: employee.emp_id,
              text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
              disabled: false,
            });
          }
        });
      });
    },
    selectRow(row) {
      row = row[0];
      this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "leave-application-details",
        params: { leaveAppID: this.leaveAppID },
      });
    },
    submit(type) {
      this.submitted = true;
      if (this.type === "approve") {
        this.approving = true;
      } else if (this.type === "decline") {
        this.declining = true;
      }
      let markAsFinal;
      this.final ? (this.official = "null") : "";
      this.final ? (markAsFinal = 1) : (markAsFinal = 0);
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Authorization");
      } else {
        const data = {
          appId: this.application.leapp_id.toString(),
          type: 1,
          comment: this.comment,
          markAsFinal,
          officer: this.getEmployee.emp_id,
        };
        type === "approve" || type === "forward"
          ? (data.status = 1)
          : (data.status = 2);
        !this.final ? (data.nextOfficer = this.official) : "";
        this.apiPost(this.ROUTES.authorization, data)
          .then((res) => {
            this.$router.push({ name: "leave-authorization" }).then(() => {
              this.apiResponseHandler("Authorization Complete", res.data);
            });
          })
          .finally(() => {
            this.approving = false;
            this.declining = false;
          });
      }
    },
    updateLeaveStatus() {
      this.submitted = true;
      let leaveId = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveApplication}/update-leaveapp-status/${leaveId}`;
      const data = {
        leave: leaveId,
        status: this.selected,
      };
      this.apiPatch(url, data, "Update Leave Error").then();
      this.apiResponseHandler("Process Complete", "Leave Update");
      this.submitted = false;
      this.fetchRequest();
    },
    notBeforeToday(date) {
      const today = new Date();
      return date < today;
    },
    notBeforeStartDate(date) {
      let startDate = new Date();
      if (this.leapp_start_date) {
        startDate = new Date(this.leapp_start_date);
      }
      startDate.setHours(0, 0, 0, 0);
      return date < startDate;
    },
    updatePeriod() {
      this.submitted = true;
      this.updating = true;
      let leaveApplicationID = parseFloat(this.$route.params.leaveAppID);
      let url = `${this.ROUTES.leaveApplication}/update-leaveapp-period/${leaveApplicationID}`;
      const data = {
        start_date: this.leapp_start_date,
        end_date: this.leapp_end_date,
      };
      this.apiPatch(url, data, "Update Leave Period Error")
        .then(() => {
          this.apiResponseHandler("Process Complete", "Leave Update");
          this.submitted = false;
          this.leapp_start_date = false;
          this.leapp_end_date = false;
          this.fetchRequest();
        })
        .finally(() => {
          this.updating = false;
        });
    },
  },
  data() {
    return {
      title: "Leave Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Details",
          active: true,
        },
      ],
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
        { key: "employee", label: "Employee", sortable: true },
        {
          key: "leaveType",
          label: "Type",
          sortable: true,
        },
        { key: "leapp_start_date", label: "Starts", sortable: true },
        { key: "leapp_end_date", label: "Ends", sortable: true },
        { key: "leapp_total_days", label: "Length", sortable: true },
        {
          key: "leapp_status",
          label: "Status",
          sortable: true,
        },
      ],
      docFields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "5%" } },
        {
          key: "leavedoc_filename",
          label: "File Name",
          sortable: true,
          thStyle: { width: "65%" },
        },
        {
          key: "createdAt",
          label: "Uploaded At",
          sortable: true,
        },
      ],
      application: null,
      leaveAppID: null,
      log: [],
      comment: null,
      final: true,
      official: null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: true,
        },
      ],
      submitted: false,
      status: null,
      approving: false,
      declining: false,
      applications: [],
      previous_applications: [],
      selected: null,
      options: [
        { value: null, text: "Please select status" },
        // { value: 0, text: "Pending" },
        // { value: 1, text: "Approve" },
        // { value: 2, text: "Decline" },
        { value: 3, text: "Active" },
        { value: 4, text: "Finished" },
      ],
      supportingDocs: [],
      totalRowsAlt: 1,
      currentPageAlt: 1,
      perPageAlt: 10,
      pageOptionsAlt: [10, 25, 50, 100],
      filterAlt: null,
      filterOnAlt: [],
      sortByAlt: "sn",
      sortDescAlt: false,
      leapp_start_date: null,
      leapp_end_date: null,
      updating: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'manage-leave-applications' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Manage Leave Applications
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body" v-if="application">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Leave Details</h5>
              </div>
              <span class="d-inline mb-0">
                <small
                  v-if="application.leapp_status === 0"
                  class="text-warning"
                >
                  Application Pending
                </small>
                <small
                  v-else-if="application.leapp_status === 1"
                  class="text-success"
                >
                  Application Approved
                </small>
                <small
                  v-else-if="application.leapp_status === 2"
                  class="text-danger"
                >
                  Application Declined
                </small>
                <small
                  v-else-if="application.leapp_status === 3"
                  class="text-success"
                >
                  Leave Active
                </small>
                <small
                  v-else-if="application.leapp_status === 4"
                  class="text-danger"
                >
                  Leave Finished
                </small>
              </span>
            </div>
            <div class="row">
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Leave Type </label>
                  <p class="text-muted">
                    {{ application.LeaveType.leave_name }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Emergency Email Address </label>
                  <p class="text-muted" v-if="application.leapp_alt_email">
                    {{ application.leapp_alt_email }}
                  </p>
                  <p v-else>---</p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Emergency Phone Number </label>
                  <p class="text-muted" v-if="application.leapp_alt_phone">
                    {{ application.leapp_alt_phone }}
                  </p>
                  <p v-else>---</p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Start Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_start_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> End Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_end_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Leave Length </label>
                  <p class="text-muted">
                    {{ application.leapp_total_days }} days
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Status </label> :
                  <label v-if=" new Date().getTime() >= new Date(application.leapp_start_date).getTime() " class="badge badge-primary">ACTIVE</label>
                  <label v-else-if="new Date().getTime() <= new Date(application.leapp_start_date).getTime()  " class="badge badge-warning">INACTIVE</label>
                  <label v-else-if="new Date().getTime() > new Date(application.leapp_end_date).getTime()  " class="badge badge-success">FINISHED</label>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Log</h5>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>OFFICER</b-th>
                      <b-th>STATUS</b-th>
                      <b-th>COMMENT</b-th>
                      <b-th>DATE</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr v-for="(logEntry, index) in log" :key="index">
                      <b-td style="width: 25%">
                        <span>
                          {{ logEntry.officers.emp_first_name }}
                          {{ logEntry.officers.emp_last_name }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span
                          v-if="logEntry.auth_status === 0"
                          class="text-warning"
                        >
                          Pending
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 1"
                          class="text-success"
                        >
                          Approved
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 2"
                          class="text-danger"
                        >
                          Declined
                        </span>
                      </b-td>
                      <b-td style="width: 40%">
                        <span>
                          {{ logEntry.auth_comment }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span>
                          {{ new Date(logEntry.updatedAt).toDateString() }}
                          {{
                            new Date(logEntry.updatedAt).toLocaleTimeString()
                          }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Previous Applications</h5>
              </div>
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
                ref="donor-table"
                bordered
                selectable
                hover
                :items="previous_applications"
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
                <template #cell(employee)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }} {{ row.value.emp_last_name }}
                  </p>
                  <small class="text-muted">
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>

                <template #cell(leapp_start_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(leapp_end_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(leapp_total_days)="row">
                  <span> {{ row.value }} days</span>
                </template>

                <template #cell(leapp_status)="row">
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
        <div class="card mt-4">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Supporting Documents</h5>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_length" class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select
                      v-model="perPageAlt"
                      size="sm"
                      :options="pageOptionsAlt"
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
                      v-model="filterAlt"
                      type="search"
                      placeholder="Search..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <div class="table-responsive mb-0">
              <b-table
                ref="employee-doc-table"
                bordered
                selectable
                hover
                :items="supportingDocs"
                :fields="docFields"
                responsive="sm"
                :per-page="perPageAlt"
                :current-page="currentPageAlt"
                :sort-by.sync="sortByAlt"
                :sort-desc.sync="sortDescAlt"
                :filter="filterAlt"
                :filter-included-fields="filterOnAlt"
                @filtered="onFiltered"
                show-empty
                select-mode="single"
                @row-selected="selectRow"
              >
                <template #cell(createdAt)="row">
                  <span>
                    {{ new Date(row.value).toDateString() }}
                  </span>
                  <span>
                    {{ new Date(row.value).toLocaleTimeString("en") }}
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
                      v-model="currentPageAlt"
                      :total-rows="totalRowsAlt"
                      :per-page="perPageAlt"
                    ></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body" v-if="application">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Employee Details</h5>
              </div>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Employee Name</span>
              <span>
                {{ application.employee.emp_first_name }}
                {{ application.employee.emp_last_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Phone No.</span>
              <span> {{ application.employee.emp_phone_no }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Office Email</span>
              <span> {{ application.employee.emp_office_email }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span> {{ application.employee.emp_unique_id }} </span>
            </div>
          </div>
        </div>
        <div
          class="card mt-4"
          v-if="
            application &&
            (application.leapp_status === 1 || application.leapp_status === 3)
          "
        >
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Update Period</h5>
              </div>
            </div>
            <form @submit.prevent="updatePeriod">
              <div class="form-group">
                <label for="start-date">
                  Start Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_start_date"
                  valueType="format"
                  placeholder="Select start date"
                  :disabled-date="notBeforeToday"
                />
              </div>
              <div class="form-group">
                <label for="start-date">
                  End Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_end_date"
                  valueType="format"
                  placeholder="Select end date"
                  :disabled-date="notBeforeStartDate"
                />
              </div>
              <b-button
                v-if="!updating"
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
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
