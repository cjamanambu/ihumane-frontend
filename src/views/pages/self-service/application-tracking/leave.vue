<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";
import Multiselect from "vue-multiselect";

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
    title: "Leave Application Details",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  mounted() {
    this.fetchLeaveDocuments();
    this.fetchAuthorizingOfficers();
    this.fetchEmployees();
  },
  validations: {
    assignedTo: { required },
    reAssignedTo: { required },
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
      this.leaveID  = this.$route.params.leaveAppID;
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
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
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
            this.officials.push({
              value: employee.emp_id,
              text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
            });
        });
      });
    },
    fetchAuthorizingOfficers() {
      let leaveId = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.authorization}/1/${leaveId}`; //1 = for leave application
      this.apiGet(url, "Get Employees Error").then((res) => {
        this.assignedOfficials = [
          {
            value: null,
            text: "Please choose an officer",
            disabled: true,
          },
        ];
        const { data } = res;
        data.forEach((officer) => {
            this.assignedOfficials.push({
              value: officer.officers.emp_id,
              text: `${officer.officers.emp_first_name} ${officer.officers.emp_last_name} (${officer.officers.emp_unique_id})`,
            });
        });
      });
    },
    employeeLabel({ text }) {
      return `${text}`;
    },
    reAssignLabel({ text }) {
      return `${text}`;
    },
    selectRow(row) {
      row = row[0];
      this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "leave-application-details",
        params: { leaveAppID: this.leaveAppID },
      });
    },
    reAssignLeaveApplication(){
      this.submitted = true;
      let leaveId = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveApplication}/re-assign-leave/${leaveId}`;
      const data = {
        leaveId: leaveId,
        reassignTo: this.reAssignedTo.value,
        assignedTo:this.assignedTo.value,
      };
      this.apiPatch(url, data, "Re-assign leave Error").then();
      this.apiResponseHandler("Change effected", "Leave application updated");
      this.submitted = false;
      this.fetchRequest();
    },
    /*updateLeaveStatus() {
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
    },*/
  },
  data() {
    return {
      title: "Leave Application Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Application Details",
          active: true,
        },
      ],
      reAssignedTo: null,
      assignedTo: null,
      leaveID: null,
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
      assignedOfficials: [
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
        { value: 0, text: "Pending" },
        { value: 1, text: "Approve" },
        { value: 2, text: "Decline" },
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
        @click="$router.push({ name: 'leave-applications' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        All Leave Applications
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-12">
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
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
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4 d-flex justify-content-between" style="background: #58181F !important; color:#fff !important;">
                  <div class="d-inline mb-0">
                    <h5 class="font-size-14 mb-0 text-white">Application Re-assignment</h5>
                  </div>
                </div>
                <div class="mb-3">
                  <form @submit.prevent="reAssignLeaveApplication">
                    <div class="form-group">
                      <label for="">From</label>
                      <multiselect
                        id="assignedTo"
                        v-model="assignedTo"
                        :options="assignedOfficials"
                        :custom-label="employeeLabel"
                        :class="{
                          'is-invalid': submitted && $v.assignedTo.$error,
                        }"
                      ></multiselect>
                    </div>
                    <div class="form-group">
                      <label for="">Re-assign to</label>
                      <multiselect
                        id="reAssignedTo"
                        v-model="reAssignedTo"
                        :options="officials"
                        :custom-label="reAssignLabel"
                        :class="{
                          'is-invalid': submitted && $v.reAssignedTo.$error,
                        }"
                      ></multiselect>
                      <input type="hidden" v-model="leaveID" >
                    </div>
                    <div class="form-group d-flex justify-content-center">
                      <b-button
                        v-if="!submitted"
                        type="submit"
                        class="btn btn-success btn-lg mt-4 d-flex justify-content-center"
                      >
                        Save Changes
                      </b-button>
                      <b-button v-else disabled class="btn btn-success btn-block mt-4">
                        Saving changes...
                      </b-button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
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
                          class="text-success"
                        >
                          Declined
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 3"
                          class="text-info"
                        >
                          Re-assigned
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
                  <span v-if="row.value === 0" class="text-warning">
                    PENDING
                  </span>
                  <span v-else-if="row.value === 1" class="text-success">
                    APPROVED
                  </span>
                  <span v-else-if="row.value === 2" class="text-danger">
                    DECLINED
                  </span>
                  <span v-else-if="row.value === 3" class="text-primary">
                    ACTIVE
                  </span>
                  <span v-else-if="row.value === 4" class="text-info">
                    FINISHED
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
    </div>
  </Layout>
</template>
