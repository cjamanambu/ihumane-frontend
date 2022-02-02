<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";

export default {
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
        this.users = data;
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
      this.email = user.user_email;
      this.userID = user.user_id;
      this.fullname = user.user_name;
      this.userStatus = user.user_status;
      this.token = user.user_token;
      this.userType = user.user_type;
      this.username = user.user_username;
      this.$refs["edit-user"].show();
      this.$refs["user-table"].clearSelected();
    },
    resetForm() {
      this.username = null;
      this.fullname = null;
      this.email = null;
      this.password = null;
      this.token = null;
      this.userStatus = 1;
      this.userType = 1;
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
      sortBy: "user_id",
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
                <template #cell(sn)>
                  {{ sn++ }}
                </template>
                <template #cell(user_type)="row">
                  <p v-if="row.value === 1">ADMIN</p>
                  <p v-else-if="row.value === 3">MODERATOR</p>
                  <p v-else>EMPLOYEE</p>
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
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitEdit">
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
        <div class="d-flex justify-content-between flex-lg-row flex-column">
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
