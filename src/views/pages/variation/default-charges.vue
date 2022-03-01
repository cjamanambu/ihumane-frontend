<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";


    export default {
        page: {
            title: "Default Charges",
            meta: [{ name: "description", content: appConfig.description }],
        },
        components: {
            Layout,
            PageHeader,
        },
        mounted() {
            this.refreshPMY()
            this.getPayments()

        },

        methods: {

            resetForm() {
                this.leapp_empid = null;
                this.leapp_leave_type = null;
                this.leapp_start_date = null;
                this.leapp_end_date = null;
                this.$v.$reset();
            },



            refreshPMY() {
                this.apiGet(
                    this.ROUTES.timeSheetPenalty,
                    "Default Charges Error"
                ).then((res) => {
                    console.log(res);
                    const { defaultCharges, employees } = res.data;
                    this.charges = defaultCharges;
                    this.employees = employees;
                    //console.log(`${this.charges} ${this.employees}`);
                    this.charges.forEach((charge) => {
                        this.employees.forEach((officer) => {
                            if (charge.tsp_emp_id === officer.emp_id) {
                                charge["emp"] = `${officer.emp_first_name} ${officer.emp_last_name}`;
                            }
                        });
                    });

                });
            },


            getPayments(){
                this.apiGet(
                    this.ROUTES.payrollMonthYear,
                    "Get Payroll Month & Year Error"
                ).then((res) => {
                    if (res.data) {
                        this.pmySet = true;
                        const {pym_year, pym_month} = res.data;
                        const url = `${this.ROUTES.variationalPayment}/current-pending-payment/${pym_year}/${pym_month}`
                        this.apiGet(url, "Get Payment Error").then(

                            (res) => {
                                const { data } = res;
                                this.payments = data;
                                this.totalRows = this.payments.length;
                            }

                        );
                    }
                })

            },


            selectPayment(items) {
                this.selectedPayments = items
            },
            onFiltered(filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                this.totalRows = filteredItems.length;
                this.currentPage = 1;
            },


        },
        data() {
            return {
                submitting: false,
                title: "Default Charges",
                items: [
                    {
                        text: "IHUMANE",
                    },
                    {
                        text: "Dashboard",
                        href: "/",
                    },
                    {
                        text: "Default Charges",
                        active: true,
                    },
                ],


                totalRows: 1,
                currentPage: 1,
                perPage: 10,
                pageOptions: [10, 25, 50, 100],
                filter: null,
                filterOn: [],
                sortBy: "tsp_id",
                sortDesc: false,
                fields: [
                    { key: "tsp_id", label:"SN", sortable: true },
                    { key: "emp", label: "Employee", sortable: true },
                    { key: "tsp_month", label: "Month", sortable: true },
                    { key: "tsp_year", label: "Year", sortable: true },
                    { key: "tsp_amount", label: "Amount", sortable: true },
                    { key: "tsp_days_absent", label: "Days Absent", sortable: true },
                    { key: "tsp_status", label: "Status", sortable: true },

                ],

                charges: [],
                payment: null,
                chargeId: [],
                selectedPayments: [ ],
                employees: [ ],
                amount: 0,
                selectedEmployees: null,
                year: null,
                month: null,
                monthName: null,
                submitted: false,
                pmySet: false
            };
        },
    };
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div class="d-flex justify-content-end mb-3">

        </div>
        <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
        <div v-else class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h3> {{ monthName }} - {{ year }}</h3>
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
                                    ref="paymentTable"
                                    bordered
                                    selectable
                                    hover
                                    :items="charges"
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
                                    select-mode="multi"
                                    @row-selected="selectPayment"

                            >

                                <template #cell(tsp_amount)="row" class="text-right">
                                    ₦{{ row.value.toLocaleString() }}
                                </template>
                                <template #cell(tsp_status)="row">
                                    <label v-if="row.value === 0" class="badge badge-pill badge-success">Not Deducted</label>
                                    <label v-else class="badge badge-pill badge-danger">Deducted</label>
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
