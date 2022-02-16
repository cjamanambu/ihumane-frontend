<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";


export default {
  page: {
    title: "Manage Variation",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.getVariationalPayments()
    this.refreshPMY()
    this.getEmployees()
  },

  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    routeNewVariation() {
      this.$router.push({
        name: 'new-variation',

      })

    },
    selectPayment(payment) {
      payment = payment[0];
      this.empName = `${payment.employee.emp_first_name} ${payment.employee.emp_last_name}`
      this.paymentName = payment.payment.pd_payment_name
      this.paymentAmount = payment.vp_amount
      this.paymentId = payment.vp_id
      if(parseInt(payment.vp_confirm) === 0){
        this.paymentStatus = 'Pending'
      }

      if(parseInt(payment.vp_confirm) === 1){
        this.paymentStatus = 'Approved'
      }

      if(parseInt(payment.vp_confirm) === 2){
        this.paymentStatus = 'Discarded'
      }

      if(parseInt(payment.vp_confirm) === 3){
        this.paymentStatus = 'Returned'
      }

      this.$refs["update-payment"].show();
      this.$refs["supervisor-table"].clearSelected();
    },
    getVariationalPayments(){
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

          const url = `${this.ROUTES.variationalPayment}/current-payment/${parseInt(this.year)}/${parseInt(this.month)}`
          this.apiGet(url, "Get Variational Payment Error").then(
              (res) => {
                const {data} = res;
                if (data) {
                  this.payments = data
                  this.totalRows = this.payments.length;
                }
              }
          );
        } else {
          this.pmySet = false;
        }
      });

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


    getEmployees(){
      this.apiGet(this.ROUTES.employee, "Get Leave Types Error").then(
          (res) => {
            this.employees = [
              { value: null, text: "Please select an employee" },
            ];
            const { data } = res;
            data.forEach((employee) => {
              this.employees.push({
                value: employee.emp_id,
                text:`${employee.emp_first_name} ${employee.emp_last_name}`,
              });
            });
          }
      );
    },
    updatePayment() {
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
      title: `Manage Variation variation`,
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Variation",
          active: true,
        },
      ],
      payments: [],
      year: null,
      month: null,
      monthName: null,
      submitted: false,
      pmySet: false,

      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "vp_id",
      sortDesc: false,
      fields: [
        { key: "vp_id", label:"SN", sortable: true },
        { key: "employee.emp_unique_id", label: "Employee ID", sortable: true },
        { key: "employee.emp_first_name", label: "Employee Name", sortable: true },
        { key: "payment.pd_payment_name", label: "Payment", sortable: true },
        { key: "vp_amount", label: "Amount", sortable: true },
        { key: "vp_confirm", label: "Status", sortable: true },

      ],
      empName: null,
      paymentName: null,
      paymentAmount: null,
      paymentStatus: null,
      paymentId: null

    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="routeNewVariation">
        <i class="mdi mdi-plus mr-2"></i>
        New Variational Payment
      </b-button>
    </div>
    <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />

    <div v-else class="row">
      <div class="col-12">

        <div class="card">
          <div class="card-body" v-if="pmySet">
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
                  select-mode="single"
                  @row-selected="selectPayment"

              >

                <template #cell(employee.emp_first_name)="data">
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

          <div class="card-body" v-else>

            <div class="row">


              <div class="col-lg-12">
                <div class="p-3 bg-light mb-4">

                  <h5 class="font-size-14 mb-0" >
                    No Payroll Month and Year Set
                  </h5>
                </div>



              </div>

            </div>



          </div>
        </div>
      </div>
    </div>

    <b-modal
        ref="update-payment"
        title="View/Update Payment"
        hide-footer
        centered
        title-class="font-18"

    >
      <form @submit.prevent="updatePayment">
        <div class="form-group">
          <label for="emp-names">
            Employee Name <span class="text-danger">*</span>
          </label>
          <input
              id="emp-names"
              type="text"
              v-model="empName"
              class="form-control"
              readonly
          />
        </div>


        <div class="form-group">
          <label for=""> Payment </label>
          <input
              readonly
              type="text"

              class="form-control"
              v-model="paymentName"
          />
        </div>
        <div class="form-group">
          <label for=""> Month </label>
          <input
              readonly
              type="text"

              class="form-control"
              v-model="monthName"
          />
        </div>

        <div class="form-group">
          <label for=""> Year </label>
          <input
              readonly
              type="text"
              class="form-control"
              v-model="year"
          />
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

        <div v-if="paymentStatus === 'Returned'">
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

        <div v-if="paymentStatus === 'Confirmed'">
          <div class="form-group">
            <label for=""> Amount </label>
            <input
                readonly
                type="text"
                class="form-control"
                v-model="paymentAmount"
            />
          </div>
        </div>


      </form>
    </b-modal>
  </Layout>
</template>
