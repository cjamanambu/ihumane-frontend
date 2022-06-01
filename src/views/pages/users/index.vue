<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";
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
    title: "Users",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    username: { required },
    fullname: { required },
    email: { email, required },
    password: { required },
    token: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.user, "Get Users Error").then((res) => {
        const { data } = res;
        console.log({ data });
        data.forEach((user, index) => {
          this.users[index] = { sn: ++index, ...user };
        });
        this.totalRows = this.users.length;
      });
    },
    /**
     * Search the table data with search input
     */
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectUser(user) {
      user = user[0];
      console.log({ user });
      this.email = user.user_email;
      this.userID = user.user_id;
      this.fullname = user.user_name;
      this.userStatus = user.user_status;
      this.token = user.user_token;
      this.userType = user.user_type;
      this.username = user.user_username;
      if (user.permissionData) {
        this.setPermissionOptions(user.permissionData);
      }
      this.$refs["edit-user"].show();
      this.$refs["user-table"].clearSelected();
    },
    setPermissionOptions(permissionData) {
      delete permissionData.perm_id;
      delete permissionData.perm_user_id;
      delete permissionData.createdAt;
      delete permissionData.updatedAt;
      for (const permission in permissionData) {
        if (permissionData[permission]) {
          this.sPerms.push(permission);
        }
      }
    },
    resetForm() {
      this.username = null;
      this.fullname = null;
      this.email = null;
      this.password = null;
      this.token = null;
      this.userStatus = 1;
      this.userType = 1;
      this.sPerms = [];
      this.$v.$reset();
    },
    newUser() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid User");
      } else {
        const data = {
          user_username: this.username,
          user_name: this.fullname,
          user_email: this.email,
          user_password: this.password,
          user_type: 1,
          user_token: this.token,
          user_status: this.userStatus,
          perm_manage_user: 0,
          perm_hr_config: 0,
          perm_payroll_config: 0,
          perm_payment_definition: 0,
          perm_onboard_employee: 0,
          perm_manage_employee: 0,
          perm_assign_supervisors: 0,
          perm_announcement: 0,
          perm_query: 0,
          perm_leave: 0,
          perm_travel: 0,
          perm_timesheet: 0,
          perm_self_assessment: 0,
          perm_leave_management: 0,
          perm_setup_variations: 0,
          perm_confirm_variations: 0,
          perm_approve_variations: 0,
          perm_decline_variations: 0,
          perm_run_payroll: 0,
          perm_undo_payroll: 0,
          perm_confirm_payroll: 0,
          perm_approve_payroll: 0,
        };
        const url = `${this.ROUTES.user}/add-user`;
        this.apiPost(url, data, "Add User Error").then((res) => {
          this.apiResponseHandler(
            `${res.data.user_username} has been added successfully`,
            "New User Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-user"].hide();
        });
      }
    },
    submitEdit() {
      this.submitted = true;
      this.password = "null";
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid User");
      } else {
        const data = {
          user_username: this.username,
          user_name: this.fullname,
          user_email: this.email,
          user_type: this.userType,
          user_token: this.token,
          user_status: this.userStatus,
          perm_manage_user: this.sPerms.includes("perm_manage_user") ? 1 : 0,
          perm_hr_config: this.sPerms.includes("perm_hr_config") ? 1 : 0,
          perm_payroll_config: this.sPerms.includes("perm_payroll_config")
            ? 1
            : 0,
          perm_payment_definition: this.sPerms.includes(
            "perm_payment_definition"
          )
            ? 1
            : 0,
          perm_onboard_employee: this.sPerms.includes("perm_onboard_employee")
            ? 1
            : 0,
          perm_manage_employee: this.sPerms.includes("perm_manage_employee")
            ? 1
            : 0,
          perm_assign_supervisors: this.sPerms.includes(
            "perm_assign_supervisors"
          )
            ? 1
            : 0,
          perm_announcement: this.sPerms.includes("perm_announcement") ? 1 : 0,
          perm_query: this.sPerms.includes("perm_query") ? 1 : 0,
          perm_leave: this.sPerms.includes("perm_leave") ? 1 : 0,
          perm_travel: this.sPerms.includes("perm_travel") ? 1 : 0,
          perm_timesheet: this.sPerms.includes("perm_timesheet") ? 1 : 0,
          perm_self_assessment: this.sPerms.includes("perm_self_assessment")
            ? 1
            : 0,
          perm_leave_management: this.sPerms.includes("perm_leave_management")
            ? 1
            : 0,
          perm_setup_variations: this.sPerms.includes("perm_setup_variations")
            ? 1
            : 0,
          perm_confirm_variations: this.sPerms.includes(
            "perm_confirm_variations"
          )
            ? 1
            : 0,
          perm_approve_variations: this.sPerms.includes(
            "perm_approve_variations"
          )
            ? 1
            : 0,
          perm_decline_variations: this.sPerms.includes(
            "perm_decline_variations"
          )
            ? 1
            : 0,
          perm_run_payroll: this.sPerms.includes("perm_run_payroll") ? 1 : 0,
          perm_undo_payroll: this.sPerms.includes("perm_undo_payroll") ? 1 : 0,
          perm_confirm_payroll: this.sPerms.includes("perm_confirm_payroll")
            ? 1
            : 0,
          perm_approve_payroll: this.sPerms.includes("perm_approve_payroll")
            ? 1
            : 0,
        };
        const url = `${this.ROUTES.user}/update-user/${this.userID}`;
        this.apiPatch(url, data, "Update User Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["edit-user"].hide();
        });
      }
    },
    setPermissions() {
      console.log(this.sPerms);
    },
  },
  data() {
    return {
      submitting: false,
      title: "Users",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Users",
          active: true,
        },
      ],
      users: [],
      sn: 1,
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        {
          key: "sn",
          label: "S/n",
          sortable: true,
          thStyle: { width: "5%" },
        },
        { key: "user_username", sortable: true },
        { key: "user_name", sortable: true },
        { key: "user_email", sortable: true },
        { key: "user_type", sortable: true },
        { key: "user_status", sortable: true },
        { key: "createdAt", sortable: true },
      ],
      userType: 2,
      userTypes: [
        { text: "MODERATOR", value: 3 },
        { text: "EMPLOYEE", value: 2 },
      ],
      userStatus: 1,
      userStatuses: [
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 },
      ],
      submitted: false,
      username: null,
      fullname: null,
      email: null,
      password: null,
      token: null,
      userID: null,
      permissions: null,
      sPerms: [],
      permissionOptionsA: [
        { text: "Manage Users", value: "perm_manage_user" },
        { text: "HR Config", value: "perm_hr_config" },
        { text: "Payroll Config", value: "perm_payroll_config" },
        { text: "Payment Definition", value: "perm_payment_definition" },
        { text: "Onboard Employee", value: "perm_onboard_employee" },
        { text: "Manage Employee", value: "perm_manage_employee" },
        { text: "Assign Supervisors", value: "perm_assign_supervisors" },
        { text: "Announcement", value: "perm_announcement" },
        { text: "Query", value: "perm_query" },
        { text: "Leave", value: "perm_leave" },
        { text: "Travel", value: "perm_travel" },
      ],
      permissionOptionsB: [
        { text: "Timesheet", value: "perm_timesheet" },
        { text: "Self Assessment", value: "perm_self_assessment" },
        { text: "Leave Management", value: "perm_leave_management" },
        { text: "Setup Variations", value: "perm_setup_variations" },
        { text: "Confirm Variations", value: "perm_confirm_variations" },
        { text: "Approve Variations", value: "perm_approve_variations" },
        { text: "Decline Variations", value: "perm_decline_variations" },
        { text: "Run Payroll", value: "perm_run_payroll" },
        { text: "Undo Payroll", value: "perm_undo_payroll" },
        { text: "Confirm Payroll", value: "perm_confirm_payroll" },
        { text: "Approve Payroll", value: "perm_approve_payroll" },
      ],
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-user'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add User
      </b-button>
    </div>
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
                ref="user-table"
                bordered
                selectable
                hover
                :items="users"
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
                @row-selected="selectUser"
              >
                <template #cell(user_type)="row">
                  <p v-if="row.value === 1">ADMIN</p>
                  <p v-else-if="row.value === 3">MODERATOR</p>
                  <p v-else>EMPLOYEE</p>
                </template>
                <template #cell(user_email)="row">
                  <span class="text-lowercase">{{ row.value }}</span>
                </template>
                <template #cell(user_status)="row">
                  <div
                    class="badge badge-success badge-pill"
                    v-if="row.value === 1"
                  >
                    Active
                  </div>
                  <div class="badge badge-danger badge-pill" v-else>
                    Inactive
                  </div>
                </template>
                <template #cell(createdAt)="row">
                  {{ new Date(row.value).toDateString() }}
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
    <b-modal
      ref="add-user"
      title="Add User"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="newUser">
        <div class="form-group">
          <label for="username">
            Username <span class="text-danger">*</span>
          </label>
          <input
            id="username"
            type="text"
            v-model="username"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.username.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="fullname">
            Full Name <span class="text-danger">*</span>
          </label>
          <input
            id="fullname"
            type="text"
            v-model="fullname"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.fullname.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="email">Email <span class="text-danger">*</span></label>
          <input
            id="email"
            type="email"
            v-model="email"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.email.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="password">
            Password <span class="text-danger">*</span>
          </label>
          <input
            id="password"
            type="password"
            v-model="password"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.password.$error,
            }"
          />
        </div>
        <b-form-group>
          <label for="user_status">User Status</label><br />
          <b-form-radio-group
            id="user_status"
            v-model="userStatus"
            :options="userStatuses"
            button-variant="outline-primary"
            buttons
          />
        </b-form-group>
        <div class="form-group">
          <label for="token">Token</label>
          <input
            id="token"
            type="text"
            v-model="token"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.token.$error,
            }"
          />
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
      ref="edit-user"
      title="Update User"
      hide-footer
      centered
      size="xl"
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitEdit">
        <div class="row">
          <div class="col-lg-5">
            <div class="mr-3">
              <div class="form-group">
                <label for="username">
                  Username <span class="text-danger">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  v-model="username"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.username.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="fullname">
                  Full Name <span class="text-danger">*</span>
                </label>
                <input
                  id="fullname"
                  type="text"
                  v-model="fullname"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.fullname.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="email"
                  >Email <span class="text-danger">*</span></label
                >
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.email.$error,
                  }"
                />
              </div>
              <div
                class="d-flex justify-content-between flex-lg-row flex-column"
              >
                <b-form-group v-if="this.userType !== 1">
                  <label for="user_type">User Type</label>
                  <b-form-select v-model="userType" :options="userTypes" />
                </b-form-group>
                <b-form-group>
                  <label for="user_status">User Status</label>
                  <b-form-select v-model="userStatus" :options="userStatuses" />
                </b-form-group>
              </div>
              <div class="form-group">
                <label for="token">Token</label>
                <input
                  id="token"
                  type="text"
                  v-model="token"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.token.$error,
                  }"
                />
              </div>
            </div>
          </div>
          <div class="col-lg-7 border-left">
            <div class="ml-3">
              <div class="p-3 bg-light mb-4">
                <div class="d-inline mb-0">
                  <h5 class="font-size-14 mb-0">Manage User Permissions</h5>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <b-form-checkbox-group
                    v-model="sPerms"
                    :options="permissionOptionsA"
                    stacked
                    switches
                    @change="setPermissions"
                    :disabled="userType === 2"
                  />
                </div>
                <div class="col-lg-6">
                  <b-form-checkbox-group
                    v-model="sPerms"
                    :options="permissionOptionsB"
                    stacked
                    switches
                    @change="setPermissions"
                    :disabled="userType === 2"
                  />
                </div>
              </div>
              <div v-if="userType === 2" class="alert alert-warning mt-3">
                Please note, you cannot modify permissions for Employees.
              </div>
            </div>
          </div>
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
