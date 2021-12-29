<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Employee Leaves",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
    this.getEmployees();
    this.getLeaveTypes();
  },
  validations: {
    employee: { required },
    leaveType: { required },
    leapp_start_date: { required },
    leapp_end_date: { required }
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.leaveApplication, "Get Employee Leaves Error").then(
          (res) => {
            const { data } = res;
            this.leaves = data;
            this.totalRows = this.leaves.length;
          }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.leapp_empid = null;
      this.leapp_leave_type = null;
      this.leapp_start_date = null;
      this.leapp_end_date = null;
      this.$v.$reset();
    },
    selectLeave(leave) {
      leave = leave[0];
      this.leapp_id = leave.leapp_id;
      this.leapp_emp_name = `${leave.employee.emp_first_name} ${leave.employee.emp_last_name}`;
      this.leapp_leave_name = leave.LeaveType.leave_name;
      if(parseInt(leave.leapp_status) === 0){
        this.leapp_status = 'pending';
      }

      if(parseInt(leave.leapp_status) === 1){
        this.verify = 1;
        this.leapp_status = 'verified';
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;

      }
      if(parseInt(leave.leapp_status) === 2){
        this.verify = 1;
        this.recommend = 1;
        this.leapp_status = 'recommended';
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;
        this.leapp_recommend_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_recommend_date = `${leave.leapp_recommend_date}`;
      }
      if(parseInt(leave.leapp_status) === 3){
        this.verify = 1;
        this.recommend = 1;
        this.approved = 1;
        this.leapp_status = 'approved';
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;
        this.leapp_recommend_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_recommend_date = `${leave.leapp_recommend_date}`;
        this.leapp_approve_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_approve_date = `${leave.leapp_approve_date}`;
      }

      if(parseInt(leave.leapp_status) === 4){
        this.discarded = 1;

        this.leapp_status = 'discarded';

      }

      this.leapp_start_date = leave.leapp_start_date;
      this.leapp_end_date = leave.leapp_end_date;

      this.$refs["show-leave"].show();
      this.$refs["leave-application-table"].clearSelected();
    },

    getLeaveTypes(){
      this.apiGet(this.ROUTES.leaveType, "Get Leave Types Error").then(
          (res) => {
            this.leaveTypes = [
              { value: null, text: "Please select a leave type" },
            ];
            const { data } = res;
            data.forEach((leaveType) => {
              this.leaveTypes.push({
                value: leaveType.leave_type_id,
                text:leaveType.leave_name,
              });
            });
          }
      );
    },


    getEmployees(){
      this.apiGet(this.ROUTES.employee, "Get Leave Types Error").then(
          (res) => {
            this.employees = [
              { value: null, text: "Please select an employee" },
            ];
            const { data } = res;
            data.forEach((employee) => {
              this.employees.push({
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
        this.apiFormHandler("Invalid Leave Application");
      } else {
        const data = {

          leapp_empid: this.employee,
          leapp_leave_type: this.leaveType,
          leapp_start_date: this.leapp_start_date,
          leapp_end_date: this.leapp_end_date,

        };
        const url = `${this.ROUTES.leaveApplication}/add-leave-application`;
        this.apiPost(url, data, "Add Leave Application").then(
            (res) => {
              this.apiResponseHandler(`${res.data}`, "New leave application Added");
              this.refreshTable();
              this.$v.$reset();
              this.$refs["add-leave"].hide();
            }
        );
      }
    },

  },
  data() {
    return {
      submitting: false,
      title: "Leave Applications",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Applications",
          active: true,
        },
      ],
      leaves: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "leapp_id",
      sortDesc: false,
      fields: [
        { key: "leapp_id", label:"SN", sortable: true },
        { key: "employee.emp_unique_id", label: "Employee ID", sortable: true },
        { key: "employee.emp_first_name", label: "Employee Name", sortable: true },
        { key: "LeaveType.leave_name", label: "Leave Type", sortable: true },
        { key: "leapp_start_date", label: "Start Date", sortable: true },
        { key: "leapp_end_date", label: "End Date", sortable: true },
        { key: "leapp_status", label: "Status", sortable: true },
      ],
      leapp_id: null,
      leapp_emp_name: null,
      leapp_leave_name: null,
      leapp_empid: null,
      leapp_leave_type: null,
      leapp_start_date :null,
      leapp_end_date :null,
      leapp_status: null,
      leapp_verify_by :null,
      leapp_verify_date: null,
      leapp_approve_by :null,
      leapp_approve_date: null,
      leapp_recommend_by :null,
      leapp_recommend_date: null,
      leaveTypes: [],
      leaveType: null,
      employees: [],
      employee: null,
      recommend: null,
      verify:null,
      approved: null,
      discarded: null,
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-leave'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Initiate Leave
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
                  ref="leave-application-table"
                  bordered
                  selectable
                  hover
                  :items="leaves"
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
                  @row-selected="selectLeave"
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
        ref="add-leave"
        title="New Leave Application"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="employee">
            Employee <span class="text-danger">*</span>
          </label>
          <b-form-select
              id="employee"
              v-model="employee"
              :options="employees"
              :class="{
              'is-invalid': submitted && $v.employee.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="leave-types">
            Leave Type <span class="text-danger">*</span>
          </label>
          <b-form-select
              id="leave-types"
              v-model="leaveType"
              :options="leaveTypes"
              :class="{
              'is-invalid': submitted && $v.leaveType.$error,
            }"
          />
        </div>

        <div class="form-group">
          <label for="start-date">
            Start Date <span class="text-danger">*</span>
          </label>
          <input
              id="start-date"
              type="date"
              v-model="leapp_start_date"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.leapp_start_date.$error,
            }"
          />
        </div>

        <div class="form-group">
          <label for="end-dates">
            End Date <span class="text-danger">*</span>
          </label>
          <input
              id="end-date"
              type="date"
              v-model="leapp_end_date"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.leapp_end_date.$error,
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
        ref="show-leave"
        title="Leave Application Details"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
    >
      <form>
        <div class="form-group">
          <label for="emp-names">
            Employee Name <span class="text-danger">*</span>
          </label>
          <input
              id="emp-names"
              type="text"
              v-model="leapp_emp_name"
              class="form-control"
              readonly
              :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="emp-leaves">
            Leave Type <span class="text-danger">*</span>
          </label>
          <input
              id="emp-leaves"
              type="text"
              disabled
              v-model="leapp_leave_name"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>

        <div class="form-group">
          <label for="start-dates">
            Start Date <span class="text-danger">*</span>
          </label>
          <input
              id="start-dates"
              type="text"
              v-model="leapp_start_date"
              disabled
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>

        <div class="form-group">
          <label for="end-dates">
            End Date <span class="text-danger">*</span>
          </label>
          <input
              id="end-dates"
              type="text"
              v-model="leapp_end_date"
              disabled
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>

        <div class="form-group">
          <label for="statuss">
            Status <span class="text-danger">*</span>
          </label>
          <input
              id="statuss"
              type="text"
              v-model="leapp_status"
              disabled
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>

        <template v-if="verify">
          <div class="form-group">
            <label for="verifys">
              Verified By: <span class="text-danger">*</span>
            </label>
            <input
                id="verifys"
                type="text"
                v-model="leapp_verify_by"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>

          <div class="form-group">
            <label for="verify-dates">
              Verified Date: <span class="text-danger">*</span>
            </label>
            <input
                id="verify-dates"
                type="text"
                v-model="leapp_verify_date"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>
        </template>

        <template v-if="recommend">
          <div class="form-group">
            <label for="recommends">
              Recommended By: <span class="text-danger">*</span>
            </label>
            <input
                id="recommends"
                type="text"
                v-model="leapp_recommend_by"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>

          <div class="form-group">
            <label for="recommend-dates">
              Recommended Date: <span class="text-danger">*</span>
            </label>
            <input
                id="recommend-dates"
                type="text"
                v-model="leapp_recommend_date"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>
        </template>

        <template v-if="approved">
          <div class="form-group">
            <label for="approves">
              Approved By: <span class="text-danger">*</span>
            </label>
            <input
                id="approves"
                type="text"
                v-model="leapp_approve_by"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>

          <div class="form-group">
            <label for="approve-dates">
              Approved Date: <span class="text-danger">*</span>
            </label>
            <input
                id="approve-dates"
                type="text"
                v-model="leapp_approve_date"
                disabled
                class="form-control"
                :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
            />
          </div>
        </template>


      </form>
    </b-modal>
  </Layout>
</template>
