<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";
    export default {
        page: {
            title: "Public Holiday",
            meta: [{ name: "description", content: appConfig.description }],
        },
        components: {
            Layout,
            PageHeader,
        },
        mounted() {
            this.refreshTable();
        },
        data() {
            return {
                submitting:false,
                holidays:[],
                totalRows: 1,
                currentPage: 1,
                perPage: 10,
                pageOptions: [10, 25, 50, 100],
                filter: null,
                filterOn: [],
                sortBy: "holiday_id",
                sortDesc: false,
                submitted: false,
                title: "Public Holiday",
                items: [
                    {
                        text: "IHUMANE",
                    },
                    {
                        text: "Dashboard",
                        href: "/",
                    },
                    {
                        text: "Public Holiday",
                        active: true,
                    },
                ],
                public_name:"",
                public_day:"",
                public_month:"",
                public_year:"",
                fields: [
                    { key: "Holiday Name", sortable: true },
                    { key: "Day", sortable: true },
                    { key: "Month", sortable: true },
                    { key: "Year", sortable: true },
                ],

            };
        },
        methods:{
            refreshTable() {
                this.apiGet(this.ROUTES.publicHolidays, "Error getting public holidays").then((res) => {
                    const { data } = res;
                    this.holidays = data;
                    this.totalRows = this.holidays.length;
                });
            },
            resetForm() {
                this.name = null;
                this.$v.$reset();
            },
            submitNewPublicHoliday(){
                this.submitted = true;
                /*this.$v.$touch();
                if (this.$v.$invalid) {
                    this.apiFormHandler("Something went wrong. Inspect form and try again.");
                } else {*/
                    const data = {
                        public_name: this.public_name,
                        public_day: this.public_day,
                        public_month: this.public_month,
                        public_year: this.public_year,
                    };
                    this.apiPost(`${this.ROUTES.publicHolidays}/add-public-holiday`, data, "Add New Public Holiday error").then((res) => {
                        this.apiResponseHandler(`${res.data}`, "New Public Holiday added successfully.");
                        this.refreshTable();
                        this.$v.$reset();
                        this.$refs["add-new-public-holiday"].hide();
                    });
               // }
            },
            onFiltered(filteredItems) {

                this.totalRows = filteredItems.length;
                this.currentPage = 1;
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
                    @click="$refs['add-new-public-holiday'].show()"
            >
                <i class="mdi mdi-plus mr-2"></i>
                Add New Public Holiday
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
                                    ref="public-holiday-table"
                                    bordered
                                    selectable
                                    hover
                                    :items="holidays"
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
                                    @row-selected="selectGrade"
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
                ref="add-new-public-holiday"
                title="Add New Public Holiday"
                hide-footer
                centered
                title-class="font-18"
                @hidden="resetForm"
        >
            <form @submit.prevent="submitNewPublicHoliday">
                <div class="form-group">
                    <label for="public_name">
                        Holiday Name <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_name"
                            type="text"
                            v-model="public_name"
                            class="form-control"
                            placeholder="Holiday Name"
                            :class="{
                          'is-invalid': submitted && $v.public_name.$error,
                        }"
                    />
                </div>
                <div class="form-group">
                    <label for="public_name">
                        Day <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_day"
                            type="number"
                            max="31"
                            v-model="public_day"
                            class="form-control"
                            placeholder="Day"
                            :class="{
                          'is-invalid': submitted && $v.public_day.$error,
                        }"
                    />
                </div>
                <div class="form-group">
                    <label for="public_month">
                        Month <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_month"
                            type="number"
                            v-model="public_month"
                            class="form-control"
                            placeholder="Month"
                            :class="{
                          'is-invalid': submitted && $v.public_month.$error,
                        }"
                    />
                </div>
                <div class="form-group">
                    <label for="public_year">
                        Year <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_year"
                            type="number"
                            v-model="public_year"
                            class="form-control"
                            placeholder="Year"
                            :class="{
                          'is-invalid': submitted && $v.public_year.$error,
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
