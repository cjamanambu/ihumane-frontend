<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";


export default {
  page: {
    title: "Confirm Variational Payments",
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
          this.ROUTES.payrollMonthYear,
          "Get Payroll Month & Year Error"
      ).then((res) => {
        if (res.data) {
          const monthArray = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
          ]

          this.pmySet = true;
          const { pym_year, pym_month } = res.data;
          this.month = pym_month;
          this.monthName = monthArray[parseInt(pym_month) - 1]
          this.year = pym_year;
        } else {
          this.pmySet = false;
        }
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
      this.selectedPayments = [ ]
      this.selectedPayments = items
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectAllRows() {
      this.$refs.paymentTable.selectAllRows()
    },

    clearSelected() {
      this.$refs.paymentTable.clearSelected()
    },



    approveSelected(){
      this.submitted = true;

      this.selectedPayments.forEach((payment) => {
        this.paymentId.push(payment.vp_id);
      });

      const data = {

        variational_payment: this.paymentId,
        status: 1

      };
      const url = `${this.ROUTES.variationalPayment}/confirm-payment`;
      this.apiPost(url, data, "Variational Payment Approval").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Variational Payment Approved");
            this.selectedPayments= [ ]
            this.paymentId = [ ]
            this.getPayments()

          }
      );
    },

    returnSelected(){
      this.submitted = true;

      this.selectedPayments.forEach((payment) => {
        this.paymentId.push(payment.vp_id);
      });

      const data = {

        variational_payment: this.paymentId,
        status: 3

      };
      const url = `${this.ROUTES.variationalPayment}/confirm-payment`;
      this.apiPost(url, data, "Variational Payment Approval").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Variational Payment Returned");
            this.selectedPayments= [ ]
            this.paymentId = [ ]
            this.getPayments()

          }
      );
    },

    unApproveSelected(){
      this.submitted = true;

      this.selectedPayments.forEach((payment) => {
        this.paymentId.push(payment.vp_id);
      });

      const data = {

        variational_payment: this.paymentId,
        status: 2

      };
      const url = `${this.ROUTES.variationalPayment}/confirm-payment`;
      this.apiPost(url, data, "Variational Payment Approval").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Variational Payment Approved");
            this.selectedPayments= [ ]
            this.paymentId = [ ]
            this.getPayments()

          }
      );
    }
  },
  data() {
    return {
      submitting: false,
      title: "Confirm variation",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Confirm Variation",
          active: true,
        },
      ],


      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "vp_id",
      sortDesc: false,
      fields: [
        '#',
          { key: "vp_id", label:"SN", sortable: true },
        { key: "employee.emp_unique_id", label: "Employee ID", sortable: true },
        { key: "emp_first_name", label: "Employee Name", sortable: true },
        { key: "payment.pd_payment_name", label: "Payment Type", sortable: true },
        { key: "vp_amount", label: "Amount", sortable: true },
        { key: "vp_confirm", label: "Status", sortable: true },

      ],

      payments: [],
      payment: null,
      paymentId: [],
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
                  :items="payments"
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
                <template #cell(emp_first_name)="data">
                  <b> {{ data.item.employee.emp_first_name }} </b>,  {{ data.item.employee.emp_last_name.toUpperCase() }}
                </template>

                <template #cell(vp_confirm)="row">
                  <div
                      class="badge badge-info badge-pill"
                      v-if="row.value === 0"
                  >
                    Pending
                  </div>

                  <div
                      class="badge badge-warning badge-pill"
                      v-if="row.value === 1"
                  >
                    Confirmed
                  </div>

                  <div
                      class="badge badge-primary badge-pill"
                      v-if="row.value === 2"
                  >
                    Discarded
                  </div>

                  <div
                      class="badge badge-primary badge-pill"
                      v-if="row.value === 3"
                  >
                    Returned
                  </div>


                </template>

                <template #cell(#)="{ rowSelected }">
                  <template v-if="rowSelected">
                    <span aria-hidden="true">&check;</span>
                    <span class="sr-only">Selected</span>
                  </template>
                  <template v-else>
                    <span aria-hidden="true">&nbsp;</span>
                    <span class="sr-only">Not selected</span>
                  </template>
                </template>

              </b-table>

              <p>
                <b-button style="margin: 10px" variant="primary" size="sm" @click="selectAllRows">Select all</b-button>

                <b-button style="margin: 10px" variant="warning" size="sm" @click="clearSelected">Clear Selection</b-button>

                <b-button style="margin: 10px" variant="success" size="sm" @click="approveSelected">Approve Variation</b-button>

                <b-button style="margin: 10px" variant="danger" size="sm" @click="unApproveSelected">Decline Variation</b-button>

                <b-button style="margin: 10px" variant="warning" size="sm" @click="returnSelected">Return Variation</b-button>

              </p>


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
