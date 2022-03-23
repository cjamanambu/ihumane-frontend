<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
//import Multiselect from 'vue-multiselect';

export default {
  page: {
    title: "Job Roles",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    //Multiselect,
  },
  mounted() {
    this.refreshTable();
    //this.fetchDepartments();
  },
  validations: {
    role: { required },
    description: { required },
  },
  methods: {
    departmentLabel ({ text }) {
      return `${text}`
    },
    resetForm() {
      this.role = null;
      this.department = null;
      this.description = null;
      this.jobRoleID = null;
      this.$v.$reset();
    },
    refreshTable() {
      this.apiGet(this.ROUTES.jobRole, "Get Job Roles Error").then((res) => {
        const { data } = res;
        this.jrs = data;
        this.totalRows = this.jrs.length;
      });
    },
    fetchDepartments() {
      this.apiGet(this.ROUTES.department, "Get Sector Error").then(
        (res) => {
          this.departments = [
            { value: null, text: "Please select a sector" },
          ];
          const { data } = res;
           data.departments.forEach((department) => {
            this.departments.push({
              value: department.department_id,
              text: department.department_name,
            });
          });

        }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectJR(jr) {
      jr = jr[0];
      this.jobRoleID = jr.job_role_id;
      this.role = jr.job_role;
      this.description = jr.description;
      this.department = jr.jb_department_id;
      this.$refs["update-jr"].show();
      this.$refs["jr-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Job Role");
      } else {
        const data = {
          job_role: this.role,
          description: this.description,
        };
        this.apiPost(this.ROUTES.jobRole, data, "Add Job Role Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "New Job Role Added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-jr"].hide();
          }
        );
      }
    },
    submitUpdate() {
      this.submitted = false;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Job Role");
      } else {
        const url = `${this.ROUTES.jobRole}/${this.jobRoleID}`;
        const data = {
          job_role: this.role,
          description: this.description,
        };
        this.apiPatch(url, data, "Update Job Role Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-jr"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Job Roles",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Job Roles",
          active: true,
        },
      ],
      submitted: false,
      jrs: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "job_role_id",
      sortDesc: false,
      fields: [
        { key: "job_role_id", label: "ID", sortable: true },
        { key: "job_role", label: "Role", sortable: true },
        { key: "description", label: "Description", sortable: true },

      ],
      role: null,
      // department: null,
      // departments: [{ value: null, text: "Please select a department" }],
      description: null,
      jobRoleID: null,
    };
  },
};
</script>
<style>
.manage:hover {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-jr'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Job Role
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
                ref="jr-table"
                bordered
                selectable
                hover
                :items="jrs"
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
                @row-selected="selectJR"
              >
                <template #cell(Department)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.department_name }}
                  </p>
                  <small>{{ row.value.d_t3_code }}</small>
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
      ref="add-jr"
      title="Add Job Role"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="role">
            Job Role <span class="text-danger">*</span>
          </label>
          <input
            id="role"
            type="text"
            v-model="role"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.role.$error,
            }"
          />
        </div>
<!--        <div class="form-group">-->
<!--          <label for="department">-->
<!--            Sector <span class="text-danger">*</span>-->
<!--          </label>-->
<!--          <multiselect-->
<!--                  v-model="department"-->
<!--                  :options="departments"-->
<!--                  :custom-label="departmentLabel"-->
<!--                  :class="{-->
<!--                      'is-invalid': submitted && $v.department.$error,-->
<!--                    }"-->
<!--          ></multiselect>-->
<!--          <small-->
<!--            class="form-text text-muted manage"-->
<!--            @click="$router.push('/departments')"-->
<!--          >-->
<!--            Manage Sectors-->
<!--          </small>-->
<!--        </div>-->
        <div class="form-group">
          <label for="description">
            Description <span class="text-danger">*</span>
          </label>
          <b-textarea
            v-model="description"
            id="description"
            no-resize
            :class="{
              'is-invalid': submitted && $v.description.$error,
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
      ref="update-jr"
      title="Update Job Role"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="role">
            Job Role <span class="text-danger">*</span>
          </label>
          <input
            id="role"
            type="text"
            v-model="role"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.role.$error,
            }"
          />
        </div>
<!--        <div class="form-group">-->
<!--          <label for="department">-->
<!--            Sector <span class="text-danger">*</span>-->
<!--          </label>-->
<!--          <multiselect-->
<!--                  v-model="department"-->
<!--                  :options="departments"-->
<!--                  :custom-label="departmentLabel"-->
<!--                  :class="{-->
<!--                      'is-invalid': submitted && $v.department.$error,-->
<!--                    }"-->
<!--          ></multiselect>-->

<!--          <small-->
<!--            class="form-text text-muted manage"-->
<!--            @click="$router.push('/departments')"-->
<!--          >-->
<!--            Manage Sectors-->
<!--          </small>-->
<!--        </div>-->
        <div class="form-group">
          <label for="description">
            Description <span class="text-danger">*</span>
          </label>
          <b-textarea
            v-model="description"
            id="description"
            no-resize
            :class="{
              'is-invalid': submitted && $v.description.$error,
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
