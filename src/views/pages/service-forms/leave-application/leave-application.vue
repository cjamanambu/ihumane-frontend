<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Leave Application",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.fetchLeaveDocuments();
  },
  data() {
    return {
      title: "Leave Application",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Application",
          active: true,
        },
      ],
      application: null,
      log: null,
      supportingDocs: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "5%" } },
        {
          key: "leavedoc_filename",
          label: "File Name",
          sortable: true,
          thStyle: { width: "65%" },
        },
        {
          key: "createdAt",
          label: "Uploaded At",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    fetchLeaveDocuments() {
      const leaveApplicationID = this.$route.params.leaveApplicationID;
      const url = `${this.ROUTES.leaveDoc}/${leaveApplicationID}`;
      this.apiGet(url, "Get Supporting Documents Error").then((res) => {
        const { data } = res;
        data.forEach((doc, index) => {
          this.supportingDocs[index] = { sn: ++index, ...doc };
        });
        this.totalRows = this.supportingDocs.length;
        this.fetchLeaveApplication();
      });
    },
    fetchLeaveApplication() {
      const leaveApplicationID = this.$route.params.leaveApplicationID;
      let url = `${this.ROUTES.leaveApplication}/${leaveApplicationID}`;
      this.apiGet(url, "Get Leave Application Error").then(async (res) => {
        const { application, log } = res.data;
        this.application = application;
        this.log = log;
        url = `${this.ROUTES.leaveDoc}/${this.application.leapp_id}`;
        await this.apiGet(url, "Get Supporting Documents Error").then((res) => {
          const { data } = res;
          data.forEach((doc, index) => {
            this.supportingDocs[index] = { sn: ++index, ...doc };
          });
          this.totalRows = this.supportingDocs.length;
        });
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      window.open(`${row.leavedoc_url}`);
      this.$refs["employee-doc-table"].clearSelected();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push('/leave-application')"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Leave Applications
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Leave Details</h5>
              </div>
              <span class="d-inline mb-0">
                <small
                  v-if="application.leapp_status === 0"
                  class="text-warning"
                >
                  Application Pending
                </small>
                <small
                  v-else-if="application.leapp_status === 1"
                  class="text-success"
                >
                  Application Approved
                </small>
                <small
                  v-else-if="application.leapp_status === 2"
                  class="text-danger"
                >
                  Application Declined
                </small>
                <small
                  v-else-if="application.leapp_status === 3"
                  class="text-success"
                >
                  Leave Active
                </small>
                <small
                  v-else-if="application.leapp_status === 3"
                  class="text-danger"
                >
                  Leave Finished
                </small>
              </span>
            </div>
            <div class="row">
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Leave Type </label>
                  <p class="text-muted">
                    {{ application.LeaveType.leave_name }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Emergency Email Address </label>
                  <p class="text-muted" v-if="application.leapp_alt_email">
                    {{ application.leapp_alt_email }}
                  </p>
                  <p v-else>---</p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Emergency Phone Number </label>
                  <p class="text-muted" v-if="application.leapp_alt_phone">
                    {{ application.leapp_alt_phone }}
                  </p>
                  <p v-else>---</p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Start Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_start_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> End Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_end_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Leave Length </label>
                  <p class="text-muted">
                    {{ application.leapp_total_days }} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-4">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Log</h5>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>OFFICER</b-th>
                      <b-th>STATUS</b-th>
                      <b-th>COMMENT</b-th>
                      <b-th>Authorized As</b-th>
                      <b-th>DATE</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr v-for="(logEntry, index) in log" :key="index">
                      <b-td style="width: 25%">
                        <span>
                          {{ logEntry.officers.emp_first_name }}
                          {{ logEntry.officers.emp_last_name }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span
                          v-if="logEntry.auth_status === 0"
                          class="text-warning"
                        >
                          Pending
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 1"
                          class="text-success"
                        >
                          Approved
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 2"
                          class="text-success"
                        >
                          Declined
                        </span>
                      </b-td>
                      <b-td style="width: 40%">
                        <span>
                          {{ logEntry.auth_comment }}
                        </span>
                      </b-td>
                      <b-td style="width: 40%" v-if="logEntry.role">
                        <span>
                          {{ logEntry.role.ar_title }}
                        </span>
                      </b-td>
                      <b-td style="width: 40%" v-else>
                        <span> --- </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span>
                          {{ new Date(logEntry.updatedAt).toDateString() }}
                          {{
                            new Date(logEntry.updatedAt).toLocaleTimeString()
                          }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-4">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Supporting Documents</h5>
              </div>
            </div>
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
            <div v-if="supportingDocs.length > 0" class="table-responsive mb-0">
              <b-table
                ref="employee-doc-table"
                bordered
                selectable
                hover
                :items="supportingDocs"
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
                <template #cell(createdAt)="row">
                  <span>
                    {{ new Date(row.value).toDateString() }}
                  </span>
                  <span>
                    {{ new Date(row.value).toLocaleTimeString("en") }}
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
  </Layout>
</template>
