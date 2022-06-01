<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 1 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "New Variational Payments",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshPMY();
    this.getVariationalPayments();
  },

  methods: {
    resetForm() {
      this.leapp_empid = null;
      this.leapp_leave_type = null;
      this.leapp_start_date = null;
      this.leapp_end_date = null;
      this.$v.$reset();
    },

    getVariationalPayments() {
      const url = `${this.ROUTES.paymentDefinition}/current-payment/${parseInt(
        this.year
      )}/${parseInt(this.month)}`;
      this.apiGet(url, "Get Variational Payment Error").then((res) => {
        const { data } = res;
        if (data) {
          this.employees = data;
          this.totalRows = this.employees.length;
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
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          this.pmySet = true;
          const { pym_year, pym_month } = res.data;
          this.month = pym_month;
          this.monthName = monthArray[parseInt(pym_month) - 1];
          this.year = pym_year;
        } else {
          this.pmySet = false;
        }
      });
    },

    getEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Leave Types Error").then((res) => {
        this.employees = [{ value: null, text: "Please select an employee" }];
        const { data } = res;
        data.forEach((employee) => {
          this.employees.push({
            value: employee.emp_id,
            text: `${employee.emp_first_name} ${employee.emp_last_name}`,
          });
        });
      });
    },
    submitNew() {
      this.submitted = true;

      const data = {
        employee: this.selectedEmployees,
        payment_definition: this.payment,
        amount: 50000,
        month: this.month,
        year: this.year,
      };
      const url = `${this.ROUTES.variationalPayment}`;
      this.apiPost(url, data, "Add Variational Payment").then((res) => {
        this.apiResponseHandler(`${res.data}`, "Add Variational Payment");
        this.submitted = false;
        this.selectedEmployees = [];
        this.amount = 0;
        this.payment = null;
      });
    },
  },
  data() {
    return {
      submitting: false,
      title: "New variation",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "New Variation",
          active: true,
        },
      ],
      payments: [],
      payment: null,
      employees: [],
      amount: 0,
      selectedEmployees: null,
      year: null,
      month: null,
      monthName: null,
      submitted: false,
      pmySet: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-leave'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        View Variational Payments
      </b-button>
    </div>
    <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body" v-if="pmySet">
            <form @submit.prevent="submitNew">
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label>Employee</label>
                    <b-form-select
                      v-model="selectedEmployees"
                      :options="employees"
                      multiple
                      :select-size="4"
                    />
                  </div>

                  <div class="form-group">
                    <label>Payment Type</label>
                    <b-form-select v-model="payment" :options="payments" />
                  </div>
                  <div class="form-group">
                    <label for=""> Amount </label>
                    <input type="text" class="form-control" v-model="amount" />
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

                  <b-button
                    v-if="!submitted"
                    type="submit"
                    class="btn btn-success btn-block mt-4"
                  >
                    Submit
                  </b-button>
                  <b-button
                    v-else
                    disabled
                    class="btn btn-success btn-block mt-4"
                  >
                    Updating...
                  </b-button>
                </div>
              </div>
            </form>
          </div>

          <div class="card-body" v-else>
            <div class="row">
              <div class="col-lg-12">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">
                    No Payroll Month and Year Set
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
