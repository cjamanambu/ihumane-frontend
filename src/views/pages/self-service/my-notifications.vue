<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";

export default {
  page: {
    title: "My Notifications",
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
    this.getEmployeeNotifications();
  },
  methods: {
    getEmployeeNotifications() {
      let employeeID = this.getEmployee.emp_id;
      this.employeeId = this.getEmployee.emp_id;
      const url = `${this.ROUTES.notifications}/${employeeID}`;
      this.apiGet(url, "Get Notifications Error").then((res) => {
        const { data } = res;
        data.forEach((notification, index) => {
          const notify = {
            sn: index + 1,
            nDate: new Date(notification.createdAt).toDateString(),
            nSubject: notification.n_subject,
            nContent: notification.n_body,
          };
          this.notifications.push(notify);
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
      this.travelAppID = row.travelapp_id;
      this.$router.push({
        name: "travel-application-details",
        params: { travelAppID: this.travelAppID },
      });
    },
  },
  data() {
    return {
      title: "My Notifications",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "My Notifications",
          active: true,
        },
      ],
      notifications: [],
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
        { key: "nDate", label: "Date", sortable: true },
        { key: "nSubject", label: "Subject", sortable: true },
        {
          key: "nContent",
          label: "Content",
          sortable: true,
        },
      ],
      sn: 1,
      travelAppID: null,
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
                :items="notifications"
                :fields="fields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                show-empty
                select-mode="single"
              >
                <template #cell(applicant)="row">
                  <p class="mb-0">
                    {{ row.value.emp_first_name }} {{ row.value.emp_last_name }}
                  </p>
                  <small class="text-muted">
                    {{ row.value.emp_unique_id }}
                  </small>
                </template>
                <template #cell(travelapp_travel_cat)="row">
                  <span v-if="row.value === 1" class="text-uppercase">
                    Official Request
                  </span>
                  <span class="text-uppercase" v-else> Personal Request </span>
                </template>
                <template #cell(travelapp_start_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(travelapp_end_date)="row">
                  <span> {{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(travelapp_total_days)="row">
                  <span> {{ row.value }} days</span>
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
                <template #cell(travelapp_status)="row">
                  <span
                    v-if="row.value === 0"
                    class="badge badge-pill badge-warning"
                  >
                    pending
                  </span>
                  <span
                    v-else-if="row.value === 1"
                    class="badge badge-pill badge-success"
                  >
                    approved
                  </span>
                  <span
                    v-else-if="row.value === 2"
                    class="badge badge-pill badge-danger"
                  >
                    declined
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
