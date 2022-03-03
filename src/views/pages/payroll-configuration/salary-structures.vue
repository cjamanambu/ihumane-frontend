<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import Multiselect from 'vue-multiselect';

export default {
  page: {
    title: "Salary Structures",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  watch: {
    amount: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.amount = result));
    },
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    salaryGrade: { required },
    employee: { required },
    amount: { required },
  },
  methods: {
    selectRow(salaryStructure) {
      salaryStructure = salaryStructure[0];
      this.employee = salaryStructure.ss_empid;
      this.amount = salaryStructure.total_amount.toString();
      this.gross = salaryStructure.total_amount;
      const url = `${this.ROUTES.salaryStructure}/get-salary-structure/${this.employee}`;
      this.apiGet(url, "Get Salary Structure Error").then((res) => {
        const { data } = res;
        this.employeeSalaryStructure = data;
      });
      this.$refs["edit-salary-structure"].show();
      this.$refs["salary-structure-table"].clearSelected();
    },
    employeeLabel ({ text }) {
      return `${text}`
    },
    refreshTable() {
      this.apiGet(
        this.ROUTES.salaryStructure,
        "Get Salary Structures Error"
      ).then((res) => {
        const { data } = res;
        data.forEach((salaryStructure, index) => {
          this.salaryStructures[index] = { sn: ++index, grade: salaryStructure.salary_grade.sg_name,...salaryStructure };
        });
        this.totalRows = this.salaryStructures.length;
        this.fetchSalaryGrades();
        this.fetchEmployees();
      });
    },
    fetchSalaryGrades() {
      this.apiGet(this.ROUTES.salaryGrade, "Get Salary Grades Error").then(
        (res) => {
          this.salaryGrades = [
            {
              value: null,
              text: "Please select a salary grade",
              disabled: true,
            },
          ];
          const { data } = res;
          data.forEach((salaryGrade) => {
            this.salaryGrades.push({
              value: salaryGrade.sg_id,
              text: `${
                salaryGrade.sg_name
              } [max: ${salaryGrade.sg_maximum.toLocaleString()} - mid: ${salaryGrade.sg_midpoint.toLocaleString()} - min: ${salaryGrade.sg_minimum.toLocaleString()}]`,
            });
          });
        }
      );
    },
    fetchEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        this.employees = [
          {
            value: null,
            text: "Please select an employee",
            disabled: true,
          },
        ];
        const { data } = res;
        data.forEach((employee) => {
          this.employees.push({
            value: employee.emp_id,
            text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
            disabled: false,
          });
        });
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.employee = null;
      this.salaryGrade = null;
      this.amount = null;
      this.$v.$reset();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Salary Structure");
      } else {
        const data = {
          ss_empid: this.employee.value,
          ss_gross: parseFloat(this.amount.replace(/,/g, "")),
          ss_grade: this.salaryGrade,
        };
        const url = `${this.ROUTES.salaryStructure}/add-salary-structure`;
        this.apiPost(url, data, "Add Salary Structure Error").then((res) => {
          this.apiResponseHandler(res.data, "New Salary Structure Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-salary-structure"].hide();
        });
      }
    },

    update() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Salary Structure");
      } else {
        const data = {
          ss_gross: parseFloat(this.amount.replace(/,/g, "")),
          ss_grade: this.salaryGrade,
        };
        const url = `${this.ROUTES.salaryStructure}/update-salary-structure/${this.employee}`;
        this.apiPatch(url, data, "Update Salary Structure Error").then(
          (res) => {
            this.apiResponseHandler(res.data, "Salary Structure Updated");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["edit-salary-structure"].hide();
          }
        );
      }
    },
  },
  data() {
    return {
      title: "Salary Structures",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Structures",
          active: true,
        },
      ],
      salaryStructures: [],
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
          key: "employee",
          label: "Employee",
          sortable: true,
        },
        { key: "grade", label: "Grade", sortable: true },
        { key: "total_amount", label: "Gross", sortable: true },
      ],
      salaryGrade: null,
      salaryGrades: [
        { value: null, text: "Please select a salary grade", disabled: true },
      ],
      employee: null,
      employees: [
        { value: null, text: "Please select an employee", disabled: true },
      ],
      submitted: false,
      amount: null,
      gross: null,
      employeeSalaryStructure: [],
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
        @click="$refs['add-salary-structure'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Salary Structure
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
                ref="salary-structure-table"
                bordered
                selectable
                hover
                :items="salaryStructures"
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
                <template #cell(employee)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }} {{ row.value.emp_last_name }}
                  </p>
                  <small>{{ row.value.emp_unique_id }}</small>
                </template>
                <template #cell(total_amount)="row">
                  <p class="mb-0">
                    {{ row.value.toLocaleString() }}
                  </p>
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
      ref="add-salary-structure"
      title="Add Salary Structure"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="code">
            Employee <span class="text-danger">*</span>
          </label>
          <multiselect
                  v-model="employee"
                  :options="employees"
                  :custom-label="employeeLabel"
                  :class="{
                      'is-invalid': submitted && $v.employee.$error,
                    }"
          ></multiselect>
        </div>
        <div class="form-group">
          <label for="code">
            Salary Grade <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="code"
            v-model="salaryGrade"
            :options="salaryGrades"
            :class="{
              'is-invalid': submitted && $v.salaryGrade.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="amount">
            Gross Salary <span class="text-danger">*</span>
          </label>
          <input
            id="amount"
            type="text"
            v-model="amount"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.amount.$error,
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
      ref="edit-salary-structure"
      title="Update Salary Structure"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
      size="xl"
    >
      <form @submit.prevent="update">
        <div class="form-group">
          <label for="code">
            Employee <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="code"
            v-model="employee"
            :options="employees"
            disabled
            :class="{
              'is-invalid': submitted && $v.employee.$error,
            }"
          />
        </div>
        <div class="form-group">
          <div class="row">
            <div
              class="col-sm-3"
              v-for="(field, index) in employeeSalaryStructure"
              :key="index"
            >
              <b-card
                :title="field.payment.pd_payment_name"
                tag="field.payment.pd_payment_name"
                style="max-width: 20rem"
                class="mb-2"
              >
                <b-card-text>
                  {{ field.ss_amount.toLocaleString() }}
                </b-card-text>
              </b-card>
            </div>

            <div class="col-sm-3">
              <b-card
                title="Gross Salary"
                style="max-width: 20rem"
                class="mb-2"
              >
                <b-card-text v-if="gross">
                  {{ gross.toLocaleString() }}
                </b-card-text>
              </b-card>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="code">
            Salary Grade <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="code"
            v-model="salaryGrade"
            :options="salaryGrades"
            :class="{
              'is-invalid': submitted && $v.salaryGrade.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="amount">
            Gross Salary <span class="text-danger">*</span>
          </label>
          <input
            id="amount"
            type="text"
            v-model="amount"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.amount.$error,
            }"
          />
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Update
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Updating...
        </b-button>
      </form>
    </b-modal>
  </Layout>
</template>
