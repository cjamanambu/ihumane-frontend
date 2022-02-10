<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config.json";
    import { authComputed } from "@/state/helpers";

    export default {
        page: {
            title: "Time sheet Authorizations",
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
                const url = `${this.ROUTES.timesheet}/authorization/supervisor/${this.getEmployee.emp_id}`;
                this.apiGet(url, "Get Authorizations Error").then((res) => {
                    const { data } = res;
                    data.forEach((application, index) => {
                        this.applications[index] = { sn: ++index, ...application };
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
                this.timesheetID = row.ts_id;
                this.month = row.ts_month;
                this.year = row.ts_year;
                this.empId = row.ts_emp_id;
                this.$router.push({
                    name: "view-time-sheet-authorization",
                    params: { month: this.month, year:this.year, empId:this.empId },
                });
            },
        },
        data() {
            return {
                title: "Time sheet Authorizations",
                items: [
                    {
                        text: "IHUMANE",
                    },
                    {
                        text: "Dashboard",
                        href: "/",
                    },
                    {
                        text: "Time sheet Authorizations",
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
                    { key: "Employee", label: "Employee", sortable: true },
                    { key: "ts_start", label: "Start Date", sortable: true },
                    { key: "ts_end", label: "End Date", sortable: true },
                    { key: "ts_duration", label: "Duration", sortable: true },
                    {
                        key: "ts_status",
                        label: "Status",
                        sortable: true,
                    },
                ],
                sn: 1,
                timesheetID: null,
                month:null,
                year:null,
                empId:null,
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
                                <template #cell(Employee)="row">
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
