<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("ASSIGN_SUPERVISORS")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Supervisors",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    supervisor: { required },
  },
  methods: {
    selectionLabel({ text }) {
      return `${text}`;
    },
    refreshTable() {
      const url = `${this.ROUTES.employee}`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        this.employees = data;
        this.totalRows = this.employees.length;
      });
    },

    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.nonSupervisor = null;
      this.$v.$reset();
    },
    selectEmployee(employee) {
      employee = employee[0];
      this.supervisor = employee.emp_supervisor_id;
      this.emp_id = employee.emp_id;
      this.emp_name = `${employee.emp_first_name} ${employee.emp_last_name}`;

      const url = `${this.ROUTES.employee}/get-supervisor`;
      this.supervisors = [{ value: null, text: "Please select an employee" }];
      this.apiGet(url, "Get Supervisors Error").then((res) => {
        const { data } = res;
        data.forEach((supervisor) => {
          this.supervisors.push({
            value: supervisor.emp_id,
            text: `${supervisor.emp_first_name} ${supervisor.emp_last_name} (${supervisor.emp_unique_id})`,
          });
        });
      });
      this.$refs["update-supervisor"].show();
      this.$refs["supervisor-table"].clearSelected();
    },

    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Supervisor Application");
      } else {
        const data = {
          sa_emp_id: this.emp_id,
          sa_supervisor_id: this.supervisor.value,
        };
        const url = `${this.ROUTES.supervisorAssignment}/add-assignment`;
        this.apiPost(url, data, "Assign Supervisor Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Supervisor Assignment");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-supervisor"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Assign Supervisor",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Assign Supervisor",
          active: true,
        },
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "emp_id",
      sortDesc: false,
      fields: [
        { key: "emp_id", label: "SN", sortable: true },
        { key: "emp_unique_id", label: "Employee ID", sortable: true },
        { key: "emp_first_name", label: "Employee Name", sortable: true },
        { key: "supervisor", label: "Supervisor", sortable: true },
      ],

      employees: [],
      supervisors: [],
      supervisor: null,
      employee: null,
      emp_name: null,
      emp_id: null,
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

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
                ref="employee-table"
                bordered
                selectable
                hover
                :items="employees"
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
                @row-selected="selectEmployee"
              >
                <template #cell(emp_first_name)="data">
                  <b> {{ data.item.emp_first_name }} </b>,
                  {{ data.item.emp_last_name.toUpperCase() }} ({{
                    data.item.emp_unique_id
                  }})
                </template>

                <template #cell(supervisor)="data">
                  <div v-if="data.item.supervisor !== null">
                    <b> {{ data.item.supervisor.emp_first_name }} </b>,
                    {{ data.item.supervisor.emp_last_name.toUpperCase() }} ({{
                      data.item.supervisor.emp_unique_id
                    }})
                  </div>
                  <div v-if="data.item.supervisor == null">N/A</div>
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
      ref="update-supervisor"
      title="Assign Supervisor"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="emp-names">
            Employee Name <span class="text-danger">*</span>
          </label>
          <input
            id="emp-names"
            type="text"
            v-model="emp_name"
            class="form-control"
            readonly
          />
        </div>

        <div class="form-group">
          <label for=""> Supervisors <span class="text-danger">*</span> </label>
          <multiselect
            v-model="supervisor"
            :options="supervisors"
            :custom-label="selectionLabel"
            :class="{
              'is-invalid': submitted && $v.supervisor.$error,
            }"
          ></multiselect>
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
