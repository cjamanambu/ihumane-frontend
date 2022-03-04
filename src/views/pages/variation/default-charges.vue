<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";
    import Multiselect from 'vue-multiselect';


    export default {
        page: {
            title: "Default Charges",
            meta: [{ name: "description", content: appConfig.description }],
        },
        components: {
            Layout,
            PageHeader,
            Multiselect,
        },
        mounted() {
            this.refreshPMY()
            this.getPayments()
            this.getVariationalPayments()

        },

        methods: {
            selectLabel ({ text }) {
                return `${text}`
            },

            resetForm() {
                this.leapp_empid = null;
                this.leapp_leave_type = null;
                this.leapp_start_date = null;
                this.leapp_end_date = null;
                this.$v.$reset();
            },

            getVariationalPayments() {
                const url = `${this.ROUTES.paymentDefinition}/variational-payments`;
                this.apiGet(url, "Get Variational Payment Error").then((res) => {
                    this.paymentsFields = [];
                    const { data } = res;
                    console.log(data);
                    data.forEach((payment) => {
                        this.paymentsFields.push({
                            value: payment.pd_id,
                            text: payment.pd_payment_name,
                        });
                    });

                });
            },

            refreshPMY() {
                this.apiGet(
                    this.ROUTES.timeSheetPenalty,
                    "Default Charges Error"
                ).then((res) => {
                    const { defaultCharges, employees } = res.data;
                    this.charges = defaultCharges;
                    this.employees = employees;
                    //console.log(`${this.charges} ${this.employees}`);
                    this.charges.forEach((charge) => {
                        this.employees.forEach((officer) => {
                            if (charge.tsp_emp_id === officer.emp_id) {
                                charge["emp"] = `${officer.emp_first_name} ${officer.emp_last_name} (${officer.emp_unique_id})`;
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


            selectCharge(charge) {
                charge = charge[0];
                this.chargeEmployee = charge.emp;
                this.chargeEmployeeId = charge.tsp_emp_id;
                this.chargeYear = charge.tsp_year;
                this.chargeMonth = charge.tsp_month;
                this.chargeAmount = charge.tsp_amount.toLocaleString();
                this.chargePeriod = `${this.chargeMonth}/${this.chargeYear}`;

                this.$refs["update-charge"].show();

            },
            onFiltered(filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                this.totalRows = filteredItems.length;
                this.currentPage = 1;
            },
            submitNew() {
                this.submitted = true;
                const data = {
                    employee: this.chargeEmployeeId,
                    default_id: this.payment_type.value,
                    month: this.chargeMonth,
                    year: this.chargeYear,
                    amount:this.chargeAmount,
                };
                const url = `${this.ROUTES.variationalPayment}/single-payment`;
                this.apiPost(url, data, "Add Variational Payment").then((res) => {
                    this.apiResponseHandler(`${res.data}`, "Add Variational Payment");
                    this.submitted = false;
                    this.chargeEmployee = null;
                    this.count = 0;
                    this.getVariationalPayments();
                });
            },
            updateCharge() {
                this.submitted = true;

                const data = {
                    vp_amount: this.paymentAmount

                };
                const url = `${this.ROUTES.variationalPayment}/update-payment-amount/${this.paymentId}`;
                this.apiPatch(url, data, "Update Variational Payment").then(
                    (res) => {
                        this.apiResponseHandler(`${res.data}`, "Update Variational Payment");
                        this.submitted = false;
                        this.$refs["update-payment"].hide();
                        this.getVariationalPayments();
                    }
                );

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
                pmySet: false,

                chargeMonth:null,
                chargeYear:null,
                chargePeriod:null,
                chargeEmployee:null,
                chargeEmployeeId:null,
                chargeAmount:null,
                paymentsFields:[],
                payment_type:null,

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
                                    @row-selected="selectCharge"

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
        <b-modal
                ref="update-charge"
                title="Penalty Details"
                hide-footer
                centered
                title-class="font-18"

        >
            <form @submit.prevent="submitNew">
                <div class="form-group">
                    <label for="emp-names">
                        Employee Name <span class="text-danger">*</span>
                    </label>
                    <input
                            id="emp-names"
                            type="text"
                            v-model="chargeEmployee"
                            class="form-control"
                            readonly
                    />
                </div>
                <div class="form-group">
                    <label for=""> Period </label>
                    <b-input
                            readonly
                            type="text"

                            class="form-control"
                            v-model="chargePeriod"
                    />
                </div>
                <div class="form-group">
                    <label for=""> Amount </label>
                    <input
                            readonly
                            type="text"

                            class="form-control"
                            v-model="chargeAmount"
                    />
                </div>

                <div class="form-group">
                    <label for=""> Pay Type </label>
                    <multiselect
                            v-model="payment_type"
                            :options="paymentsFields"
                            :custom-label="selectLabel"
                            :class="{
                      'is-invalid': submitted && $v.payment_type.$error,
                    }"
                    ></multiselect>
                </div>

                <div v-if="paymentStatus === 'Pending'">
                    <div class="form-group">
                        <label for=""> Amount </label>
                        <input

                                type="text"
                                class="form-control"
                                v-model="paymentAmount"
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
                    <b-button
                            v-if="!submitting"
                            class="btn btn-success btn-block mt-4"
                            type="submit"
                    >
                        Submit to Variation
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
