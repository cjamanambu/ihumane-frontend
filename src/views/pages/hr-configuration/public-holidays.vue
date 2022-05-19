<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";
    import { required } from "vuelidate/lib/validators";
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
        validations: {
            public_name: { required },
            public_date_to: { required },
            public_date: { required },
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
                public_date:"",
                public_date_to:"",
                public_date_update:"",
                public_group:null,
                ph_id:"",
                fields: [
                    { key: "sn", label:"S/No", sortable: true },
                    { key: "ph_name", label:"Holiday Name", sortable: true },
                    { key: "ph_date", label: "From", sortable: true },
                    { key: "ph_to_date", label: "To", sortable: true }
                ],

            };
        },
        methods:{
            refreshTable() {
                this.apiGet(this.ROUTES.publicHolidays, "Error getting public holidays").then((res) => {
                    const { data } = res;
                    //console.log(data);
                    data.map((pub,index)=>{
                      this.holidays.push({
                        sn: index+1,
                        ph_id:pub.ph_id,
                        ph_group:pub.ph_group,
                        ph_year:pub.ph_year,
                        ph_month:pub.ph_month,
                        ph_day:pub.ph_day,

                        ph_to_month:pub.ph_to_month,
                        ph_to_year:pub.ph_to_year,
                        ph_to_day: pub.ph_to_day,

                        ph_name: pub.ph_name,
                        ph_date: new Date(`${parseInt(pub.ph_month)}-${parseInt(pub.ph_day)}-${parseInt(pub.ph_year)}`).toDateString(),
                        ph_to_date: new Date(`${parseInt(pub.ph_to_month)}-${parseInt(pub.ph_to_day)}-${parseInt(pub.ph_to_year)}`).toDateString()
                      })
                    })
                  //console.log(this.holidays);
                    this.totalRows = this.holidays.length;
                });
            },
            resetForm() {
                this.name = null;
                this.public_date = null;
                this.public_date = null;
                this.public_date_to = null;
                this.$v.$reset();
            },
            selectPublicHoliday(ph) {
                //console.log(ph);
                ph = ph[0];
                this.ph_id = ph.ph_id;
                this.public_name = ph.ph_name;
                this.public_day = ph.ph_day;
                this.public_month = ph.ph_month;
                this.public_year = ph.ph_year;
                this.public_group = ph.ph_group;
                this.public_date = new Date(parseInt(ph.ph_year), parseInt(ph.ph_month)-1,parseInt(ph.ph_day)+1).toISOString().split("T")[0];
                this.public_date_to = new Date(parseInt(ph.ph_to_year), parseInt(ph.ph_to_month)-1,parseInt(ph.ph_to_day)+1).toISOString().split("T")[0];
                this.$refs["update-ph"].show();
                this.$refs["ph-table"].clearSelected();

            },
            updatePublicHoliday() {
                this.submitted = false;
                this.$v.$touch();
                if (this.$v.$invalid) {
                    this.apiFormHandler("Invalid Entry");
                } else {
                    const url = `${this.ROUTES.publicHolidays}/${this.ph_id}`;
                  const data = {
                    public_name: this.public_name,
                    public_date: this.public_date,
                    public_date_to: this.public_date_to,
                    group: this.public_group,
                  };
                    this.apiPatch(url, data, "Error updating public holiday").then((res) => {
                        this.apiResponseHandler(`${res.data}`, "Update Successful");
                        this.refreshTable();
                        this.$v.$reset();
                        this.$refs["update-ph"].hide();
                    });
                }
            },
            submitNewPublicHoliday(){
                this.submitted = true;
                this.$v.$touch();
                if (this.$v.$invalid) {
                    this.apiFormHandler("Something went wrong. Inspect form and try again.");
                } else {
                    const data = {
                        public_name: this.public_name,
                        public_date: this.public_date,
                        public_date_to: this.public_date_to,
                    };
                    this.apiPost(`${this.ROUTES.publicHolidays}/add-public-holiday`, data, "Add New Public Holiday error").then((res) => {
                        this.apiResponseHandler(`${res.data}`, "New Public Holiday added successfully.");
                        this.refreshTable();
                        this.$v.$reset();
                        this.$refs["add-ph"].hide();
                    });
                }
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
                    @click="$refs['add-ph'].show()"
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
                                    ref="ph-table"
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
                                    @row-selected="selectPublicHoliday"
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
                ref="add-ph"
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
                    <label for="public_date">
                        From Date <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_date"
                            type="date"
                            max="31"
                            v-model="public_date"
                            class="form-control"
                            placeholder="Day"
                            :class="{
                          'is-invalid': submitted && $v.public_date.$error,
                        }"
                    />
                </div>
              <div class="form-group">
                <label for="public_date">
                  To Date <span class="text-danger">*</span>
                </label>
                <input
                  id="public_date_to"
                  type="date"
                  max="31"
                  v-model="public_date_to"
                  class="form-control"
                  placeholder="Day"
                  :class="{
                          'is-invalid': submitted && $v.public_date_to.$error,
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
                ref="update-ph"
                title="Update Public Holiday"
                hide-footer
                centered
                title-class="font-18"
                @hidden="resetForm"
        >
            <form @submit.prevent="updatePublicHoliday">
                <div class="form-group">
                    <label for="public_name">
                        Holiday Name <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_name_"
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
                    <label for="">
                        From Date <span class="text-danger">*</span>
                    </label>
                    <input
                            id="public_date_u"
                            type="date"
                            v-model="public_date"
                            class="form-control"
                            placeholder="Year"
                            :class="{
                          'is-invalid': submitted && $v.public_date.$error,
                        }"
                    />
                </div>
              <div class="form-group">
                <label for="public_date">
                  To Date <span class="text-danger">*</span>
                </label>
                <input
                  id=""
                  type="date"
                  max="31"
                  v-model="public_date_to"
                  class="form-control"
                  placeholder="Day"
                  :class="{
                          'is-invalid': submitted && $v.public_date_to.$error,
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
              <b-button
                        v-if="!submitting"
                        class="btn btn-danger btn-block mt-4"
                        type="submit"
                >
                    Delete
                </b-button>
                <b-button
                        v-else
                        disabled
                        class="btn btn-danger btn-block mt-4"
                        type="submit"
                >
                    Deleting...
                </b-button>
            </form>
        </b-modal>
    </Layout>
</template>
