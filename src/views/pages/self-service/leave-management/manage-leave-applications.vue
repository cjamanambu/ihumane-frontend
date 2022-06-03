<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("LEAVE_MANAGEMENT") &&
      permissions.includes("LEAVE")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Leave Authorizations",
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
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      //let currentDate = new Date();
      const url = `${this.ROUTES.leaveApplication}/approved-applications`;
      this.apiGet(url, "Get Leave Applications Error").then((res) => {
        const { data, officers } = res.data;
        let status = 0;
        data.forEach((leave, index) => {
          if (
            new Date().getTime() >= new Date(leave.leapp_start_date).getTime()
          ) {
            status = 1;
          } else if (
            new Date().getTime() <= new Date(leave.leapp_start_date).getTime()
          ) {
            status = 0;
          } else if (
            new Date().getTime() > new Date(leave.leapp_end_date).getTime()
          ) {
            status = 3;
          }
          this.applications[index] = {
            sn: ++index,
            leave_status: status,
            ...leave,
          };
        });
        this.applications.forEach((application) => {
          officers.forEach((officer) => {
            if (
              application.leapp_id === parseFloat(officer.auth_travelapp_id)
            ) {
              application["Officer"] = officer.officers;
            }
          });
        });
        this.totalRows = this.applications.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "manage-leave-application",
        params: { leaveAppID: this.leaveAppID },
      });
    },
  },
  data() {
    return {
      title: "Manage Leave Applications",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Leave Applications",
          active: true,
        },
      ],
      applications: [],
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
        { key: "employee", label: "Employee", sortable: true },
        {
          key: "LeaveType",
          label: "Leave Type",
          sortable: true,
        },
        { key: "leapp_start_date", label: "Start Date", sortable: true },
        { key: "leapp_end_date", label: "End Date", sortable: true },
        { key: "leapp_total_days", label: "Leave Length", sortable: true },
        { key: "Officer", label: "Authorization Officer", sortable: true },
        {
          key: "leave_status",
          label: "Application Status",
          sortable: true,
        },
      ],
      leaveAppID: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
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
                ref="donor-table"
                bordered
                selectable
                hover
                :items="applications"
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
                  <small class="text-muted">
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>

                <template #cell(LeaveType)="row">
                  <p class="mb-0">
                    {{ row.value.leave_name }}
                  </p>
                </template>

                <template #cell(leapp_start_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>

                <template #cell(leapp_end_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>

                <template #cell(leapp_total_days)="row">
                  <span> {{ row.value }} days</span>
                </template>

                <template #cell(Officer)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }} {{ row.value.emp_last_name }}
                  </p>
                  <small class="text-muted">
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>

                <template #cell(leave_status)="row">
                  <label v-if="row.value === 1" class="badge badge-primary"
                    >ACTIVE</label
                  >
                  <label v-else-if="row.value === 0" class="badge badge-warning"
                    >INACTIVE</label
                  >
                  <label v-else-if="row.value === 3" class="badge badge-success"
                    >FINISHED</label
                  >
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
