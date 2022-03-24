<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Leave Application",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    leaveType: { required },
    leapp_start_date: { required },
    leapp_end_date: { required },
  },
  data() {
    return {
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
          href: "/leave-application",
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
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        { key: "LeaveType.leave_name", label: "Leave Type", sortable: true },
        { key: "leapp_total_days", label: "Duration", sortable: true },
        { key: "leapp_start_date", label: "Start Date", sortable: true },
        { key: "leapp_end_date", label: "End Date", sortable: true },
        { key: "Officer", label: "Current Desk", sortable: true },
        { key: "leapp_status", label: "Status", sortable: true },
      ],
      leapp_id: null,
      leapp_emp_name: null,
      leapp_leave_name: null,
      leapp_empid: null,
      leapp_leave_type: null,
      leapp_start_date: null,
      leapp_end_date: null,
      leapp_status: null,
      leapp_verify_by: null,
      leapp_verify_date: null,
      leapp_approve_by: null,
      leapp_approve_date: null,
      leapp_recommend_by: null,
      leapp_recommend_date: null,
      leapp_alt_email: null,
      leapp_alt_phone: null,
      leaveTypes: [],
      leaveType: null,
      employees: [],
      employee: null,
      recommend: null,
      verify: null,
      approved: null,
      discarded: null,
      submitted: false,
      pendingLeaves: 0,
    };
  },
  methods: {
    refreshTable() {
      const url = `${this.ROUTES.leaveApplication}/get-employee-leave/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Employee Leaves Error").then((res) => {
        const { data, officers } = res.data;
        data.forEach((leave, index) => {
          this.leaves[index] = { sn: ++index, ...leave };
          if (leave.leapp_status === 0) {
            this.pendingLeaves++;
          }
        });
        this.leaves.forEach((leave) => {
          officers.forEach((officer) => {
            if (leave.leapp_id === parseFloat(officer.auth_travelapp_id)) {
              leave["Officer"] = officer.officers;
            }
          });
        });
        this.totalRows = this.leaves.length;
        this.getLeaveAccruals();
      });
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
      if (parseInt(leave.leapp_status) === 0) {
        this.leapp_status = "PENDING";
      }

      if (parseInt(leave.leapp_status) === 1) {
        this.verify = 1;
        this.leapp_status = "VERIFIED";
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;
      }
      if (parseInt(leave.leapp_status) === 2) {
        this.verify = 1;
        this.recommend = 1;
        this.leapp_status = "RECOMMENDED";
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;
        this.leapp_recommend_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_recommend_date = `${leave.leapp_recommend_date}`;
      }
      if (parseInt(leave.leapp_status) === 3) {
        this.verify = 1;
        this.recommend = 1;
        this.approved = 1;
        this.leapp_status = "APPROVED";
        this.leapp_verify_by = `${leave.verify.emp_first_name} ${leave.verify.emp_last_name}`;
        this.leapp_verify_date = `${leave.leapp_verify_date}`;
        this.leapp_recommend_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_recommend_date = `${leave.leapp_recommend_date}`;
        this.leapp_approve_by = `${leave.recommend.emp_first_name} ${leave.recommend.emp_last_name}`;
        this.leapp_approve_date = `${leave.leapp_approve_date}`;
      }

      if (parseInt(leave.leapp_status) === 4) {
        this.discarded = 1;
        this.leapp_status = "DISCARDED";
      }
      this.leapp_start_date = new Date(leave.leapp_start_date).toDateString();
      this.leapp_end_date = new Date(leave.leapp_end_date).toDateString();
      this.$refs["show-leave"].show();
      this.$refs["leave-application-table"].clearSelected();
    },
    getLeaveAccruals() {
      let url = `${this.ROUTES.leaveAccrual}/get-leave-acrruals/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Leave Accruals Error").then((res) => {
        this.leaveTypes = [{ value: null, text: "Please select a leave type" }];
        const { data } = res;
        data.forEach((leave) => {
          this.leaveTypes.push({
            value: leave.leave.leave_type_id,
            text: `${leave.leave.leave_name} (${leave.accrual} days accrued)`,
          });
        });
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Application");
      } else {
        const data = {
          leapp_empid: this.getEmployee.emp_id,
          leapp_leave_type: this.leaveType,
          leapp_start_date: this.leapp_start_date,
          leapp_end_date: this.leapp_end_date,
          leapp_alt_email: this.leapp_alt_email,
          leapp_alt_phone: this.leapp_alt_phone,
        };
        const url = `${this.ROUTES.leaveApplication}/add-leave-application`;
        this.apiPost(url, data, "Add Leave Application").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New leave application Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-leave"].hide();
        });
      }
    },
  },
};
</script>
<style>
.back {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'new-leave-application' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        New Leave Application
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
                <template #cell(leapp_total_days)="row">
                  <span>{{ row.value }} days</span>
                </template>
                <template #cell(leapp_status)="row">
                  <div
                    class="badge badge-warning badge-pill"
                    v-if="row.value === 0"
                  >
                    Pending
                  </div>
                  <div
                    class="badge badge-success badge-pill"
                    v-if="row.value === 1"
                  >
                    Approved
                  </div>
                  <div
                    class="badge badge-danger badge-pill"
                    v-if="row.value === 2"
                  >
                    Declined
                  </div>
                </template>
                <template #cell(leapp_start_date)="row">
                  {{ new Date(row.value).toDateString() }}
                </template>
                <template #cell(leapp_end_date)="row">
                  {{ new Date(row.value).toDateString() }}
                </template>
                <template #cell(Officer)="row">
                  <p class="mb-0">
                    <span class="mr-1">{{ row.value.emp_first_name }}</span>
                    <span>{{ row.value.emp_last_name }}</span>
                  </p>
                  <small class="text-muted">
                    {{ row.value.emp_unique_id }}
                  </small>
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
      ref="add-leave"
      title="New Leave Application"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="alert alert-warning" v-if="pendingLeaves > 0">
          You currently have pending application. You're not due to apply for
          another leave while one or more is pending.
        </div>
        <div v-else>
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
          <div class="form-group">
            <label for="alt-email"> Emergency Email Address </label>
            <input
              id="alt-email"
              type="email"
              v-model="leapp_alt_email"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="alt-email"> Emergency Phone Number </label>
            <input
              id="alt-email"
              type="text"
              v-model="leapp_alt_phone"
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
        </div>
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
