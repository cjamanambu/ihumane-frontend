<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from 'vue-multiselect';

export default {
  page: {
    title: "New Variational Payments",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect
  },
  mounted() {
    this.getVariationalPayments();
    this.refreshPMY();
    this.getEmployees();
  },
  watch: {
    band: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.band = result));
    },
  },
  methods: {
    resetForm() {
      this.leapp_empid = null;
      this.leapp_leave_type = null;
      this.leapp_start_date = null;
      this.leapp_end_date = null;
      this.$v.$reset();
    },
    selectionLabel ({ text }) {
      return `${text}`
    },

    getVariationalPaymentss() {
      const url = `${this.ROUTES.paymentDefinition}/variational-payments`;
      this.apiGet(url, "Get Variational Payment Error").then((res) => {
        this.payments = [{ value: null, text: "Select Payment" }];
        const { data } = res;
        data.forEach((payment) => {
          this.payments.push({
            value: payment.pd_id,
            text: payment.pd_payment_name,
          });
        });
      });
    },

    getVariationalPayments() {
      const url = `${this.ROUTES.paymentDefinition}/variational-payments`;
      this.apiGet(url, "Get Variational Payment Error").then((res) => {
        this.paymentsFields = [];
        const { data } = res;
        data.forEach((payment) => {
          this.paymentsFields.push({
            id: payment.pd_id,
            paymentDefinition: payment.pd_payment_name,
            amount: 0,
          });
        });
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

    launchFilePicker() {
      this.$refs.file.click();
    },
    async onFileChange(fieldName, files) {
      this.uploadFiles = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          this.uploadFiles.push(files[i]);
        }
      } else {
        this.$bvToast.toast("Please select at least one file to upload", {
          title: "No Files Selected",
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });
      }
    },
    deleteFile(index) {
      this.uploadFiles.splice(index, 1);
    },

    getEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Leave Types Error").then((res) => {
        this.employees = [{ value: null, text: "Please select an employee" }];
        const { data } = res;
        data.forEach((employee) => {
          this.employees.push({
            value: employee.emp_id,
            text: `${employee.emp_first_name} ${employee.emp_last_name}  (${employee.emp_unique_id})`,
          });
        });
      });
    },

    routeCurrentVariation() {
      this.$router.push({
        name: "current-variation",
      });
    },
    async submitNew() {
      if (this.uploadFiles.length > 0) {
        this.submitted = true;

        await this.paymentsFields.forEach((field) => {
          const data = {
            payment_definition: field.id,
            amount: field.amount,
          };
          //console.log(data)

          this.filledPayments.push(data);
        });
        let formData = new FormData();
        formData.append('employee', this.selectedEmployees.value)
        formData.append('payments', this.filledPayments)
        formData.append('month', this.month)
        formData.append('year', this.year)
        await this.uploadFiles.forEach((file) => {
          formData.append("documents", file);
        });
        const url = `${this.ROUTES.variationalPayment}`;
        this.apiPost(url, formData, "Add Variational Payment").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Add Variational Payment");
          this.submitted = false;
          this.selectedEmployees = null;
          this.count = 0;
          this.getVariationalPayments();
        });

        // const data = {
        //   employee: this.selectedEmployees.value,
        //   payments: this.filledPayments,
        //   month: this.month,
        //   year: this.year,
        // };
        // const url = `${this.ROUTES.variationalPayment}`;
        // this.apiPost(url, data, "Add Variational Payment").then((res) => {
        //   this.apiResponseHandler(`${res.data}`, "Add Variational Payment");
        //   this.submitted = false;
        //   this.selectedEmployees = null;
        //   this.count = 0;
        //   this.getVariationalPayments();
        // });
      }else{
        this.$bvToast.toast("Please select at least one file to upload", {
          title: "No Files Selected",
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });

      }


      // const data = {
      //   employee: this.selectedEmployees.value,
      //   payments: this.filledPayments,
      //   month: this.month,
      //   year: this.year,
      // };
      // const url = `${this.ROUTES.variationalPayment}`;
      // this.apiPost(url, data, "Add Variational Payment").then((res) => {
      //   this.apiResponseHandler(`${res.data}`, "Add Variational Payment");
      //   this.submitted = false;
      //   this.selectedEmployees = null;
      //   this.count = 0;
      //   this.getVariationalPayments();
      // });
    },

    addField() {
      this.paymentsFields.push({
        id: this.count++,
        paymentDefinition: null,
        amount: 0,
      });
    },

    delField(index) {
      if (index > 0) {
        this.paymentsFields.splice(index, 1);
        this.count--;
      }
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
      uploadFiles: [],
      payment: null,
      filledPayments: [],
      paymentsFields: [],
      employees: [],
      amount: 0,
      selectedEmployees: null,
      year: null,
      month: null,
      monthName: null,
      submitted: false,
      pmySet: false,
      count: 0,
      uploadFieldName: "file",
    };
  },
};
</script>
<style>
.file-uploads {
  padding: 3em;
  border: 1px dashed #1cbb8c;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
}
.file-detail {
  border: 1px solid #ced4da;
  padding: 0.5em 1em;
  border-radius: 5px;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="routeCurrentVariation">
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
                    <multiselect
                            v-model="selectedEmployees"
                            :options="employees"
                            :custom-label="selectionLabel"
                            :class="{
                      'is-invalid': submitted && $v.selectedEmployees.$error,
                    }"
                    ></multiselect>

                  </div>

                  <br />
                  <br />
                  <hr />

                  <div
                    class="row"
                    v-for="(fields, index) in paymentsFields"
                    :key="index"
                  >
                    <!--                    <div class="col-lg-5">-->
                    <!--                      <div class="form-group">-->
                    <!--                        <label>Payment Type</label>-->
                    <!--                        <b-form-select-->

                    <!--                            v-model="field.paymentDefinition"-->
                    <!--                            :options="payments"-->
                    <!--                        />-->
                    <!--                      </div>-->
                    <!--                    </div>-->

                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> Payment Definition </label>
                        <input
                          type="text"
                          readonly
                          class="form-control"
                          v-model="fields.paymentDefinition"
                        />
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> Amount </label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="fields.amount"
                        />
                      </div>
                    </div>
                    <!--                    <div class="col-lg-2">-->
                    <!--                      <div class="form-group">-->
                    <!--                        <div v-if="index > 0" class="form-group">-->

                    <!--                          <div class="row" v-if="parseInt(index) === parseInt(count)">-->
                    <!--                            <div class="col-lg-6">-->
                    <!--                              <label style="visibility: hidden">hidden</label>-->
                    <!--                              <button-->
                    <!--                                  type="button"-->
                    <!--                                  class="btn btn-danger"-->
                    <!--                                  @click="delField(index)"-->
                    <!--                              >-->
                    <!--                                DEL-->
                    <!--                              </button>-->
                    <!--                            </div>-->

                    <!--                            <div class="col-lg-6">-->
                    <!--                              <label style="visibility: hidden">hidden</label>-->
                    <!--                              <button-->
                    <!--                                  type="button"-->
                    <!--                                  class="btn btn-success"-->
                    <!--                                  @click="addField"-->
                    <!--                              >-->
                    <!--                                ADD-->
                    <!--                              </button>-->
                    <!--                            </div>-->
                    <!--                          </div>-->

                    <!--                          <div class="row" v-else>-->
                    <!--                            <div class="col-lg-12">-->
                    <!--                              <label style="visibility: hidden">hidden</label>-->
                    <!--                              <button-->
                    <!--                                  type="button"-->
                    <!--                                  class="btn btn-danger"-->
                    <!--                                  @click="delField(index)"-->
                    <!--                              >-->
                    <!--                                DEL-->
                    <!--                              </button>-->
                    <!--                            </div>-->

                    <!--                          </div>-->

                    <!--                        </div>-->
                    <!--                        <div v-else class="form-group">-->

                    <!--                          <label style="visibility: hidden">hidden</label>-->
                    <!--                          <button-->
                    <!--                              type="button"-->
                    <!--                              class="btn btn-success"-->
                    <!--                              @click="addField"-->
                    <!--                          >-->
                    <!--                            ADD-->
                    <!--                          </button>-->
                    <!--                        </div>-->
                    <!--                      </div>-->
                    <!--                    </div>-->
                  </div>
                  <hr />
                  <br />
                  <br />

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

                <div class="col-lg-6">
                  <div class="card">
                    <div class="card-body">
                      <div class="p-3 bg-light mb-4">
                        <h5 class="font-size-14 mb-0">
                          Supporting Documents

                        </h5>
                      </div>
                      <input
                          type="file"
                          ref="file"
                          multiple
                          :name="uploadFieldName"
                          @change="onFileChange($event.target.name, $event.target.files)"
                          style="display: none"
                      />
                      <div class="file-uploads mb-3" @click="launchFilePicker()">
                        <p class="mb-0 text-muted">Click here to upload files</p>
                      </div>
                      <div v-if="uploadFiles.length > 0">
                        <div class="alert alert-info mb-3">
                          You've chosen the following documents to upload. Confirm and
                          upload your selection below.
                        </div>
                        <div
                            class="file-detail d-flex justify-content-between align-items-center mt-3"
                            v-for="(file, index) in uploadFiles"
                            :key="index"
                        >
                          <small>
                            <span>{{ file.name }}</span>
                            <br />
                            <span>{{ file.size | getFileSize }}</span>
                          </small>
                          <button
                              class="btn btn-sm btn-danger"
                              @click="deleteFile(index)"
                          >
                            DEL
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
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
