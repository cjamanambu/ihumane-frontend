<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";

export default {
  page: {
    title: "Leave Authorization",
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
    this.fetchRequest();
    this.getAuthorizingRoles(1); //leave app
    this.fetchLeaveDocuments();
  },
  validations: {
    comment: { required },
    official: { required },
    roleId: { required },
  },
  methods: {
    fetchRequest() {
      let requestID = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveApplication}/${requestID}`;
      this.apiGet(url, "Get Leave Application").then((res) => {
        const { application, log } = res.data;
        //console.log(log)
        log.map(lg=>{
          if(lg.auth_officer_id == this.getEmployee.emp_id){
            this.reviewStatus = lg.auth_status;
          }
        });
        //console.log(this.reviewStatus);
        this.application = application;
        this.getLocation(application.employee.emp_location_id);
        this.getSector(application.employee.emp_job_role_id);
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
    getLocation(locationId) {
      const url = `${this.ROUTES.location}/${locationId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t6 = res.data.location_name;
      });
    },
    getSector(sectorId) {
      const url = `${this.ROUTES.jobRole}/${sectorId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t3 = res.data.job_role;
      });
    },
    authorizingAsLabel({ text }) {
      return `${text}`;
    },
    nextAuthorizingOfficer({ text }) {
      return `${text}`;
    },
    getAuthorizingRoles(type) {
      //1=leave,2=time sheet,3=travel
      const url = `${this.ROUTES.authorizationRole}/${type}`;
      this.apiGet(url, "Couldn't get authorizing roles").then((res) => {
        const { data } = res;
        data.map((role) => {
          this.roles.push({
            value: role.ar_id,
            text: role.ar_title,
          });
        });
      });
    },
    fetchLeaveDocuments() {
      const leaveApplicationID = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveDoc}/${leaveApplicationID}`;
      this.apiGet(url, "Get Supporting Documents Error").then((res) => {
        const { data } = res;
        data.forEach((doc, index) => {
          this.supportingDocs[index] = { sn: ++index, ...doc };
        });
        this.totalRows = this.supportingDocs.length;
        //this.fetchLeaveApplication();
      });
    },
    selectRow(row) {
      row = row[0];
      window.open(`${row.leavedoc_url}`);
      this.$refs["employee-doc-table"].clearSelected();
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
          role: this.roleId.value,
          markAsFinal,
          officer: this.getEmployee.emp_id,
        };
        type === "approve" || type === "forward"
          ? (data.status = 1)
          : (data.status = 2);
        !this.final ? (data.nextOfficer = this.official.value) : "";

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
  },
  data() {
    return {
      t3: null,
      t6: null,
      title: "Leave Authorization",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Authorization",
          active: true,
        },
      ],
      application: null,
      supportingDocs: [],
      log: [],
      roles: [
        {
          value: null,
          text: "Authorizing as...",
          disabled: true,
        },
      ],
      roleId: null,
      comment: null,
      final: false,
      official: null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: true,
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
      submitted: false,
      status: null,
      approving: false,
      declining: false,
      reviewStatus:null,
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
        @click="$router.push({ name: 'leave-authorization' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Leave Authorizations
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Leave Authorization</h5>
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
            <div v-if="supportingDocs.length > 0" class="table-responsive mb-0">
              <b-table
                ref="employee-doc-table"
                bordered
                selectable
                hover
                :items="supportingDocs"
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
                <h5 class="font-size-14 mb-0">Authorization Log</h5>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>OFFICER</b-th>
                      <b-th thStyle="width: 30px;">STATUS</b-th>
                      <b-th>COMMENT</b-th>
                      <b-th >Authorized As</b-th>
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
                      </b-td>
                      <b-td style="width: 40%">
                        <span>
                          {{ logEntry.auth_comment }}
                        </span>
                      </b-td>
                      <b-td style="width: 40%" v-if="logEntry.role">
                        <span>
                          {{ logEntry.role.ar_title }}
                        </span>
                      </b-td>
                      <b-td style="width: 40%" v-else>
                        <span> --- </span>
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
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Details</h5>
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
              <span>T7 Number</span>
              <span> {{ application.employee.emp_unique_id }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Phone No.</span>
              <span>
                {{ this.application.employee.emp_phone_no }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Office Email</span>
              <span>
                {{ this.application.employee.emp_office_email }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T3 Code</span>
              <span> {{ t3 }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T6 Code</span>
              <span> {{ t6 }} </span>
            </div>
            <div v-if="reviewStatus" class="d-flex justify-content-between mb-3">
              <span>Status</span>
              <span v-if="reviewStatus === 1" class="text-success">Approved</span>
              <span v-else-if="reviewStatus === 2" class="text-danger">Declined</span>
            </div>
            <div v-else>
              <b-form-group>
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="final"
                  name="checkbox-1"
                  :value="true"
                  :unchecked-value="false"
                >
                  Mark this authorization as final
                </b-form-checkbox>
              </b-form-group>
              <b-form-group>
                <b-form-textarea
                  rows="5"
                  no-resize
                  placeholder="Leave your comments here.."
                  v-model="comment"
                  :class="{
                    'is-invalid': submitted && $v.comment.$error,
                  }"
                />
              </b-form-group>
              <b-form-group>
                <multiselect
                  v-model="roleId"
                  :options="roles"
                  :custom-label="authorizingAsLabel"
                  :class="{
                    'is-invalid': submitted && $v.roleId.$error,
                  }"
                ></multiselect>
              </b-form-group>
              <div class="d-flex" v-if="final">
                <button
                  v-if="!approving"
                  @click="submit('approve')"
                  class="btn btn-success w-100 mr-3"
                >
                  Approve
                </button>
                <button v-else disabled class="btn btn-success w-100 mr-3">
                  Approving...
                </button>
                <button
                  v-if="!declining"
                  @click="submit('decline')"
                  class="btn btn-danger w-100"
                >
                  Decline
                </button>
                <button v-else disabled class="btn btn-danger w-100">
                  Declining...
                </button>
              </div>
              <div v-else>
                <b-form-group>
                  <multiselect
                    v-model="official"
                    :options="officials"
                    :custom-label="nextAuthorizingOfficer"
                    :class="{
                      'is-invalid': submitted && $v.official.$error,
                    }"
                  ></multiselect>
                </b-form-group>
                <div>
                  <button
                    v-if="!submitting"
                    @click="submit('forward')"
                    class="btn btn-success w-100 mr-3"
                  >
                    Forward Request
                  </button>
                  <button v-else disabled class="btn btn-success w-100 mr-3">
                    Forwarding...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
