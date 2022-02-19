<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import VueHtml2pdf from "vue-html2pdf";

export default {
  page: {
    title: "View Payslip",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    VueHtml2pdf,
  },
  mounted() {
    this.fetchPayslip();
  },
  data() {
    return {
      title: "View Payslip",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "View Payslip",
          active: true,
        },
      ],
      pmyYear: null,
      pmyMonth: null,
      payslipData: null,
    };
  },
  methods: {
    async fetchPayslip() {
      const url = `${this.ROUTES.salary}/pull-salary-routine/${this.$route.params.empID}`;
      await this.apiGet(url, "Get Payslip Error").then((res) => {
        console.log({ res });
        const { data } = res;
        if (data) {
          this.payslipData = data;
        }
      });
      await this.fetchPMY();
    },
    fetchPMY() {
      this.apiGet(
        this.ROUTES.payrollMonthYear,
        "Get Payroll Month & Year Error"
      ).then((res) => {
        if (res.data) {
          const { pym_year, pym_month } = res.data;
          this.pmyMonth = pym_month;
          this.pmyYear = pym_year;
        }
      });
    },
    generateReport() {
      this.$refs.html2Pdf.generatePdf();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success mr-3"
        @click="$router.push({ name: 'process-payroll' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Process Payroll
      </b-button>
      <b-button class="btn btn-success" @click="generateReport">
        <i class="mdi mdi-plus mr-2"></i>
        Generate PDF
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">
                  Employee Pay Slip ({{ (parseInt(pmyMonth) - 1) | getMonth }}
                  {{ pmyYear }})
                </h5>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="d-flex justify-content-between">
                    <h6>Name</h6>
                    <p class="text-capitalize" v-if="payslipData">
                      {{ payslipData.employeeName }}
                    </p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>Sector (T3)</h6>
                    <p class="text-capitalize" v-if="payslipData">
                      {{ payslipData.sector }}
                    </p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>Designation</h6>
                    <p class="text-capitalize" v-if="payslipData">
                      {{ payslipData.jobRole }}
                    </p>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="d-flex justify-content-between">
                    <h6>T7 Number</h6>
                    <p class="text-capitalize" v-if="payslipData">
                      {{ payslipData.employeeUniqueId }}
                    </p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>Location (T6)</h6>
                    <p class="text-capitalize" v-if="payslipData">
                      {{ payslipData.location }}
                    </p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>Reference</h6>
                    <p class="text-capitalize">---</p>
                  </div>
                </div>
              </div>
              <hr class="my-4" />
              <div class="row">
                <div class="col-lg-6">
                  <h4 class="text-uppercase">Entitlements</h4>
                  <div class="d-flex justify-content-between mt-4 mb-1">
                    <h6 class="text-uppercase">Salary Item</h6>
                    <h6 class="text-uppercase">Amount</h6>
                  </div>
                  <div v-if="payslipData">
                    <div
                      class="d-flex justify-content-between"
                      v-for="(income, index) in payslipData.incomes"
                      :key="index"
                    >
                      <p class="mb-1">{{ income.paymentName }}</p>
                      <p class="mb-1">
                        =N= {{ income.amount.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-lg-6">
                  <h4 class="text-uppercase">Deductions</h4>
                  <div class="d-flex justify-content-between mt-4">
                    <h6 class="text-uppercase">Salary Item</h6>
                    <h6 class="text-uppercase">Amount</h6>
                  </div>
                  <div v-if="payslipData">
                    <div
                      class="d-flex justify-content-between"
                      v-for="(deduction, index) in payslipData.deductions"
                      :key="index"
                    >
                      <p class="mb-1">{{ deduction.paymentName }}</p>
                      <p class="mb-1">
                        =N= {{ deduction.amount.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <hr class="my-4" />
              <div class="row">
                <div class="col-lg-6">
                  <div class="d-flex justify-content-between">
                    <h6>GROSS PAY</h6>
                    <p
                      class="text-capitalize border-top border-bottom d-inline"
                      v-if="payslipData"
                    >
                      =N= {{ payslipData.grossSalary.toLocaleString() }}
                    </p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>PENSION (EMPLOYER CONTRIBUTION)</h6>
                    <p class="text-capitalize">---</p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>NHF</h6>
                    <p class="text-capitalize">---</p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <h6>TOTAL DEDUCTIONS</h6>
                    <p
                      class="text-capitalize border-top border-bottom d-inline"
                      v-if="payslipData"
                    >
                      =N= {{ payslipData.totalDeduction.toLocaleString() }}
                    </p>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="d-flex justify-content-between">
                    <h6>NET PAY</h6>
                    <p
                      class="text-capitalize border-top border-bottom d-inline"
                      v-if="payslipData"
                    >
                      =N= {{ payslipData.netSalary.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <VueHtml2pdf
      :show-layout="false"
      :float-layout="true"
      :enable-download="false"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      filename="Employee Payslip"
      :pdf-quality="2"
      :manual-pagination="false"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="100%"
      ref="html2Pdf"
    >
      <section slot="pdf-content">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">
                    Employee Pay Slip ({{
                      (parseInt(pmyMonth) - 1) | getMonth
                    }}
                    {{ pmyYear }})
                  </h5>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="d-flex justify-content-between">
                      <h6>Name</h6>
                      <p class="text-capitalize" v-if="payslipData">
                        {{ payslipData.employeeName }}
                      </p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>Sector (T3)</h6>
                      <p class="text-capitalize" v-if="payslipData">
                        {{ payslipData.sector }}
                      </p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>Designation</h6>
                      <p class="text-capitalize" v-if="payslipData">
                        {{ payslipData.jobRole }}
                      </p>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="d-flex justify-content-between">
                      <h6>T7 Number</h6>
                      <p class="text-capitalize" v-if="payslipData">
                        {{ payslipData.employeeUniqueId }}
                      </p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>Location (T6)</h6>
                      <p class="text-capitalize" v-if="payslipData">
                        {{ payslipData.location }}
                      </p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>Reference</h6>
                      <p class="text-capitalize">---</p>
                    </div>
                  </div>
                </div>
                <hr class="my-4" />
                <div class="row">
                  <div class="col-lg-6">
                    <h4 class="text-uppercase">Entitlements</h4>
                    <div class="d-flex justify-content-between mt-4 mb-1">
                      <h6 class="text-uppercase">Salary Item</h6>
                      <h6 class="text-uppercase">Amount</h6>
                    </div>
                    <div v-if="payslipData">
                      <div
                        class="d-flex justify-content-between"
                        v-for="(income, index) in payslipData.incomes"
                        :key="index"
                      >
                        <p class="mb-1">{{ income.paymentName }}</p>
                        <p class="mb-1">
                          =N= {{ income.amount.toLocaleString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <h4 class="text-uppercase">Deductions</h4>
                    <div class="d-flex justify-content-between mt-4">
                      <h6 class="text-uppercase">Salary Item</h6>
                      <h6 class="text-uppercase">Amount</h6>
                    </div>
                    <div v-if="payslipData">
                      <div
                        class="d-flex justify-content-between"
                        v-for="(deduction, index) in payslipData.deductions"
                        :key="index"
                      >
                        <p class="mb-1">{{ deduction.paymentName }}</p>
                        <p class="mb-1">
                          =N= {{ deduction.amount.toLocaleString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="my-4" />
                <div class="row">
                  <div class="col-lg-6">
                    <div class="d-flex justify-content-between">
                      <h6>GROSS PAY</h6>
                      <p
                        class="text-capitalize border-top border-bottom d-inline"
                        v-if="payslipData"
                      >
                        =N= {{ payslipData.grossSalary.toLocaleString() }}
                      </p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>PENSION (EMPLOYER CONTRIBUTION)</h6>
                      <p class="text-capitalize">---</p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>NHF</h6>
                      <p class="text-capitalize">---</p>
                    </div>
                    <div class="d-flex justify-content-between">
                      <h6>TOTAL DEDUCTIONS</h6>
                      <p
                        class="text-capitalize border-top border-bottom d-inline"
                        v-if="payslipData"
                      >
                        =N= {{ payslipData.totalDeduction.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="d-flex justify-content-between">
                      <h6>NET PAY</h6>
                      <p
                        class="text-capitalize border-top border-bottom d-inline"
                        v-if="payslipData"
                      >
                        =N= {{ payslipData.netSalary.toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </VueHtml2pdf>
  </Layout>
</template>
