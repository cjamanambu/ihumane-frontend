<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import departmentService from "@/services/department.service";
import { required } from "vuelidate/lib/validators";

export default {
  mixins: [departmentService],
  page: {
    title: "Departments",
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
    name: { required },
    t3_code: { required },
  },
  methods: {
    refreshTable() {
      this.getDepartments().then((res) => {
        const { data } = res;
        this.depts = data;
        this.totalRows = this.depts.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.name = null;
      this.t3_code = null;
      this.$v.$reset();
    },
    selectDept(dept) {
      dept = dept[0];
      this.deptID = dept.department_id;
      this.name = dept.department_name;
      this.t3_code = dept.d_t3_code;
      this.$refs["update-dept"].show();
      this.$refs["dept-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Department");
      } else {
        const { name, t3_code } = this;
        const dept = { name, t3_code };
        this.addDepartment(dept).then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Department Added");
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
        const { name, t3_code, deptID } = this;
        const dept = { name, t3_code, deptID };
        this.updateDepartment(dept).then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-dept"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Departments",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Departments",
          active: true,
        },
      ],
      depts: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "department_id",
      sortDesc: false,
      fields: [
        { key: "department_id", sortable: true },
        { key: "department_name", sortable: true },
        { key: "d_t3_code", label: "T3 Code", sortable: true },
      ],
      name: null,
      t3_code: null,
      deptID: null,
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
        Add Department
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
                :items="depts"
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
                @row-selected="selectDept"
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
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="add-dept"
      title="Add Department"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name">
            Department Name <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            T3 Code <span class="text-danger">*</span>
          </label>
          <input
            id="t3_code"
            type="text"
            v-model="t3_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.t3_code.$error,
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
      title="Update Department"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            Department Name <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            T3 Code <span class="text-danger">*</span>
          </label>
          <input
            id="t3_code"
            type="text"
            v-model="t3_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.t3_code.$error,
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
