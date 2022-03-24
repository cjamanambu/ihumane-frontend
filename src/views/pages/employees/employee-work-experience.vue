<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import {required} from "vuelidate/lib/validators";
export default {
  page: {
    title: "Work Experience ",
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
    organization: { required },
    role: { required },
    start_date: { required },
    end_date: { required },
    employeeID: { required },
  },
  methods: {
    refreshTable() {
      this.employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.workExperience}/${this.employeeID}`
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        const list = data.list;
        this.employee = data.employee;

        list.forEach((ls, index) => {
          this.edu_backgrounds[index] = {
            sn: ++index,
            organization:ls.we_organization,
            role:ls.we_job_role,
            start_date:ls.we_start_date,
            end_date:ls.we_end_date,
            emp_id:ls.we_emp_id,
            id:ls.we_id,
            ...ls };
        });
        this.totalRows = this.employees.length;
      });
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    submitData(){
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid LGA");
      } else {

        const data = {
          employee:this.employeeID,
          organization:this.organization,
          role:this.role,
          start_date:this.start_date,
          end_date:this.end_date,
        };

        this.apiPost(this.ROUTES.workExperience, data, "Add Work Experience Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Work Experience Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["handle-education"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Entry");
      } else {

        const data = {
          employee:this.employeeID,
          organization:this.organization,
          role:this.role,
          start_date:this.start_date,
          end_date:this.end_date,
        };
        const url = `${this.ROUTES.workExperience}/${this.workID}`;
        this.apiPatch(url, data, "Update Experience Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-handle-education"].hide();
        });
      }
    },
    selectRow(row) {
      row = row[0];
      this.employeeID = row.emp_id;
      this.organization = row.organization;
      this.role = row.role;
      this.start_date = new Date(row.start_date).toISOString().slice(0, 10);
      this.end_date = row.end_date;
      this.workID = row.id;
      this.$refs["update-handle-education"].show();
      this.$refs["education-table"].clearSelected();
    },
  },
  data() {
    return {
      title: " Work Experience ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: " Work Experience ",
          active: true,
        },
      ],
      employees: [],
      edu_backgrounds: [],
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
        {
          key: "organization",
          label: "Organization",
          sortable: true,
        },
        { key: "role", label: "Job Role", sortable: true },
        { key: "start_date", label: "Start Date", sortable: true },
        { key: "end_date", label: "End Date", sortable: true },
      ],
      employeeID: null,
      workID: null,
      organization: null,
      role: null,
      program: null,
      start_date: null,
      end_date: null,
      employee: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <div class="btn-group">
        <b-button
          class="btn btn-secondary mr-1"
          @click="$router.push({ name: 'manage-employees' })"
        >
          <i class="mdi mdi-plus mr-2"></i>
          Manage Employees
        </b-button>
        <b-button
          class="btn btn-success"
          @click="$refs['handle-education'].show()"
        >
          <i class="mdi mdi-plus mr-2"></i>
          Add New
        </b-button>
      </div>

    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-md-6">
        <h6 class="text-uppercase">Employee Details</h6>
        <div class="card">
          <div class="card-body">
            <table class="table table-bordered">
              <tr>
                <td><strong>Full Name</strong></td>
                <td>{{employee.emp_first_name}} {{employee.emp_last_name}} {{employee.emp_other_name}}
                </td>
              </tr>
              <tr>
                <td><strong>Phone</strong></td>
                <td>{{employee.emp_phone_no}}
                </td>
              </tr>
              <tr>
                <td><strong>ID</strong></td>
                <td>{{employee.emp_unique_id}}
                </td>
              </tr>
              <tr>
                <td><strong>Location</strong></td>
                <td>{{employee.location.location_name}} ({{ employee.location.l_t6_code }})
                </td>
              </tr>
              <tr>
                <td><strong>Office Email</strong></td>
                <td>{{employee.emp_office_email}}
                </td>
              </tr>
              <tr>
                <td><strong>Personal Email</strong></td>
                <td>{{employee.emp_personal_email}}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
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
                ref="education-table"
                bordered
                selectable
                hover
                :items="edu_backgrounds"
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
                <template #cell(start_date)="row">
                  <span>
                    {{ new Date(row.value).toDateString() }}
                  </span>
                </template>
                <template #cell(end_date)="row">
                  <span>
                    {{ new Date(row.value).toDateString() }}
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
      </div>
    </div>

    <b-modal
      ref="handle-education"
      title="Add New"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitData">

        <div class="form-group">
          <label for="name">
            Organization Name <span class="text-danger">*</span>
          </label>
          <input
            id="organization"
            type="text"
            v-model="organization"
            class="form-control"
            placeholder="Organization Name"
            :class="{
              'is-invalid': submitted && $v.organization.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="name">
            Job Role <span class="text-danger">*</span>
          </label>
          <input
            id="role"
            type="text"
            v-model="role"
            class="form-control"
            placeholder="Job Role"
            :class="{
              'is-invalid': submitted && $v.role.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="lga">
            Start Date <span class="text-danger">*</span>
          </label>
          <input
            id="start_date"
            type="date"
            v-model="start_date"
            class="form-control"
            placeholder="Start Date"
            :class="{
              'is-invalid': submitted && $v.start_date.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="end_date">
            End Date <span class="text-danger">*</span>
          </label>
          <input
            id="end_date"
            type="date"
            v-model="end_date"
            class="form-control"
            placeholder="Start Date"
            :class="{
              'is-invalid': submitted && $v.end_date.$error,
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
      ref="update-handle-education"
      title="Update Education "
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">

        <div class="form-group">
          <label for="name">
            Organization Name <span class="text-danger">*</span>
          </label>
          <input
            id="update-organization"
            type="text"
            v-model="organization"
            class="form-control"
            placeholder="Organization Name"
            :class="{
              'is-invalid': submitted && $v.organization.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="role">
            Job Role <span class="text-danger">*</span>
          </label>
          <input
            id="update-role"
            type="text"
            v-model="role"
            class="form-control"
            placeholder="Job Role"
            :class="{
              'is-invalid': submitted && $v.role.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="update-lga">
            Start Date <span class="text-danger">*</span>
          </label>
          <input
            id="update-start_date"
            type="date"
            v-model="start_date"
            class="form-control"
            placeholder="Start Date"
            :class="{
              'is-invalid': submitted && $v.start_date.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="end_date">
            End Date <span class="text-danger">*</span>
          </label>
          <input
            id="update-end_date"
            type="date"
            v-model="end_date"
            class="form-control"
            placeholder="Start Date"
            :class="{
              'is-invalid': submitted && $v.end_date.$error,
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
