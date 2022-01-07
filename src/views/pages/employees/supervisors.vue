<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Supervisors",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
     this.getNoneSupervisors();
  },
  validations: {
    nonSupervisor: { required },
  },
  methods: {
    refreshTable() {
      const url = `${this.ROUTES.employee}/get-supervisor`;
      this.apiGet(url, "Get Supervisors Error").then(
          (res) => {
            const { data } = res;
            this.supervisors = data;
            this.totalRows = this.supervisors.length;
          }
      );
    },



    onFiltered(filteredItems) {

      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.nonSupervisor = null;
      this.$v.$reset();
    },
    selectSupervisor(supervisor) {
      supervisor = supervisor[0];
      this.nonSupervisor = supervisor.emp_id;
      this.emp_name = `${supervisor.emp_first_name} ${supervisor.emp_last_name}`;


      this.$refs["show-supervisor"].show();
      this.$refs["supervisor-table"].clearSelected();
    },
    getNoneSupervisors(){
      const url = `${this.ROUTES.employee}/get-none-supervisor`;
    this.nonSupervisors =   [
        { value: null, text: "Please select an employee" },
      ];
      this.apiGet(url, "Get Supervisors Error").then(
          (res) => {

            const { data } = res;
            data.forEach((employee) => {
              this.nonSupervisors.push({
                value: employee.emp_id,
                text:`${employee.emp_first_name} ${employee.emp_last_name}`,
              });
            });
          }
      );
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Supervisor Application");
      } else {
        const data = {

          emp_id: this.nonSupervisor,
          emp_supervisor_status: 1,


        };
        const url = `${this.ROUTES.employee}/set-supervisor`;
        this.apiPost(url, data, "Set Supervisor Error").then(
            (res) => {
              this.apiResponseHandler(`${res.data}`, "New Supervisor Added");
              this.refreshTable();
              this.getNoneSupervisors();
              this.$v.$reset();
              this.$refs["add-supervisor"].hide();
            }
        );
      }
    },
    submitOld() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Supervisor Application");
      } else {
        const data = {

          emp_id: this.nonSupervisor,
          emp_supervisor_status: 0,


        };
        const url = `${this.ROUTES.employee}/set-supervisor`;
        this.apiPost(url, data, "Set Supervisor Error").then(
            (res) => {
              this.apiResponseHandler(`${res.data}`, "Supervisor Updated");
              this.refreshTable();
              this.getNoneSupervisors();
              this.$v.$reset();
              this.$refs["show-supervisor"].hide();
            }
        );
      }
    },

  },
  data() {
    return {
      submitting: false,
      title: "Supervisors",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Supervisors",
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
        { key: "emp_id", label:"SN", sortable: true },
        { key: "emp_unique_id", label: "Employee ID", sortable: true },
        { key: "emp_first_name", label: "Employee Name", sortable: true },
      ],


      nonSupervisors: [],
      nonSupervisor: null,
      supervisors: [],
      employee: null,
      emp_name: null,
      emp_id: null,
      supervisorStatus: null,
       submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-supervisor'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Supervisor
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
                  ref="supervisor-table"
                  bordered
                  selectable
                  hover
                  :items="supervisors"
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
                  @row-selected="selectSupervisor"
              >

                <template #cell(emp_first_name)="data">
                  <b> {{ data.item.emp_first_name }} </b>,  {{ data.item.emp_last_name.toUpperCase() }}
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
        ref="add-supervisor"
        title="New Supervisor"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="">
            Employee <span class="text-danger">*</span>
          </label>
          <b-form-select
              id="employee"
              v-model="nonSupervisor"
              :options="nonSupervisors"
              :class="{
              'is-invalid': submitted && $v.nonSupervisor.$error,
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
        ref="show-supervisor"
        title="Remove Supervisor"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
    >
      <form @submit.prevent="submitOld">
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

          <input
              id="start-dates"
              type="hidden"
              v-model="emp_id"
              disabled
              class="form-control"

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
