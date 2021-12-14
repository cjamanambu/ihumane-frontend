<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import userService from "@/services/user.service";
import { required, email } from "vuelidate/lib/validators";

export default {
  mixins: [userService],
  page: {
    title: "Users",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  beforeMount() {
    this.getUsers().then((res) => {
      const { data } = res;
      this.users = data;
      this.totalRows = this.users.length;
    });
  },
  validations: {
    username: { required },
    fullname: { required },
    email: { email, required },
    password: { required },
    token: { required },
  },
  methods: {
    /**
     * Search the table data with search input
     */
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    editUser(user) {
      console.log({ user });
    },
    newUser() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.$bvToast.toast(`Please fill in all fields correctly`, {
          title: "Invalid User",
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });
      } else {
        const newUser = {
          username: this.username,
          fullname: this.fullname,
          email: this.email,
          password: this.password,
          userType: this.userType,
          token: this.token,
          userStatus: this.userStatus,
        };
        this.addUser(newUser).then((res) => {
          this.apiResponseHandler(
            `${res.data.user_username} has been added successfully`,
            "New User Added"
          );
          this.getUsers().then((res) => {
            const { data } = res;
            this.users = data;
            this.totalRows = this.users.length;
          });
          this.username = null;
          this.fullname = null;
          this.email = null;
          this.password = null;
          this.token = null;
          this.userStatus = 1;
          this.userType = 1;
          this.$refs["add-user"].hide();
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
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "user_id",
      sortDesc: false,
      fields: [
        { key: "user_id", sortable: true },
        { key: "user_username", sortable: true },
        { key: "user_name", sortable: true },
        { key: "user_email", sortable: true },
        { key: "user_type", sortable: true },
        { key: "user_status", sortable: true },
        { key: "createdAt", sortable: true },
      ],
      userType: 1,
      userTypes: [
        { text: "ADMIN", value: 1 },
        { text: "MODERATOR", value: 2 },
        { text: "EMPLOYEE", value: 3 },
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
    <div class="row">
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
                @row-selected="editUser"
              >
                <template #cell(user_type)="row">
                  <p v-if="row.value === 1">ADMIN</p>
                  <p v-else-if="row.value === 2">MODERATOR</p>
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
        <div class="d-flex justify-content-between flex-lg-row flex-column">
          <b-form-group>
            <label for="user_type">User Type</label><br />
            <b-form-radio-group
              id="user_type"
              v-model="userType"
              :options="userTypes"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
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
