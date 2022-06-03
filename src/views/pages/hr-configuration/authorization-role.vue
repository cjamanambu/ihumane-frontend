<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("HR_CONFIG")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Authorization Roles",
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
    title: { required },
    type: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(
        this.ROUTES.authorizationRole,
        "Get Authorization role Error"
      ).then((res) => {
        const { data } = res;
        this.roles = data;
        this.totalRows = this.roles.length;
      });
    },
    // onFiltered(filteredItems) {
    // Trigger pagination to update the number of buttons/pages due to filtering
    /*this.totalRows = filteredItems.length;
    this.currentPage = 1;*/
    //},
    resetForm() {
      /*this.name = null;
      this.t3_code = null;
      this.$v.$reset();*/
    },
    selectRole(role) {
      role = role[0];
      this.roleId = role.ar_id;
      this.auth_title = role.ar_title;
      this.type = role.ar_type;
      this.$refs["update-dept"].show();
      this.$refs["dept-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Authorization role");
      } else {
        const data = {
          title: this.auth_title,
          type: this.type,
        };
        this.apiPost(
          this.ROUTES.authorizationRole,
          data,
          "Add Authorization role Error"
        ).then((res) => {
          this.apiResponseHandler(
            `${res.data}`,
            "New Authorization role Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-dept"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Department");
      } else {
        const data = {
          title: this.auth_title,
          type: this.type,
        };
        const url = `${this.ROUTES.authorizationRole}/${this.roleId}`;
        this.apiPatch(url, data, "Update Authorization role Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Update Successful");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["update-dept"].hide();
          }
        );
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Authorization Roles",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Authorization Roles",
          active: true,
        },
      ],
      roles: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "department_id",
      sortDesc: false,
      fields: [
        { key: "ar_id", label: "S/No.", sortable: true },
        { key: "ar_title", label: "Title", sortable: true },
        { key: "ar_type", label: "Type", sortable: true },
      ],
      auth_title: null,
      type: null,
      roleId: null,
      type_list: [
        { value: 1, text: "Leave Application" },
        { value: 2, text: "Time Sheet" },
        { value: 3, text: "Travel Application" },
      ],
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-dept'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Role
      </b-button>
    </div>
    <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
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
                ref="dept-table"
                bordered
                selectable
                hover
                :items="roles"
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
                @row-selected="selectRole"
              >
                <template #cell(ar_type)="row">
                  <span v-if="row.value === 1">Leave Application</span>
                  <span v-else-if="row.value === 2">Time sheet</span>
                  <span v-else-if="row.value === 3">Travel Application</span>
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
      ref="add-dept"
      title="Add Authorization Role"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name"> Title <span class="text-danger">*</span> </label>
          <input
            id="name"
            type="text"
            v-model="auth_title"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.auth_title.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="type"> Type <span class="text-danger">*</span> </label>
          <b-form-select
            id="department"
            v-model="type"
            :options="type_list"
            :class="{
              'is-invalid': submitted && $v.type_list.$error,
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
      ref="update-dept"
      title="Update Role"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name"> Title <span class="text-danger">*</span> </label>
          <input
            id="name"
            type="text"
            v-model="auth_title"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.auth_title.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="type"> Type <span class="text-danger">*</span> </label>
          <b-form-select
            id="department"
            v-model="type"
            :options="type_list"
            :class="{
              'is-invalid': submitted && $v.type_list.$error,
            }"
          />
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Update Role
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
