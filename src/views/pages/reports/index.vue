<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Emolument from "./components/emolument";
import DeductionSheet from "./components/deduction-sheet";
import DeductionReport from "./components/deduction-report";
import Variation from "./components/variation";
import BankOrder from "./components/bank-order";
import EmployeeReport from "./components/employee-report";
import PensionReport from "./components/pension-report";
import NhfReport from "./components/nhf-report";
import TaxReport from "./components/tax-report";
import NsitfReport from "./components/nsitf-report";
import ApprovedRoutine from "./components/approved-routine";
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
    title: "Reports",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    ApprovedRoutine,
    NsitfReport,
    TaxReport,
    Layout,
    PageHeader,
    Emolument,
    DeductionSheet,
    DeductionReport,
    Variation,
    BankOrder,
    EmployeeReport,
    PensionReport,
    NhfReport,
  },
  mounted() {
    this.fetchPMY();
  },
  data() {
    return {
      title: "Reports",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Reports",
          active: true,
        },
      ],
      pmyMonth: null,
      pmyYear: null,
    };
  },
  methods: {
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
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div class="p-3 bg-light mb-4 d-flex justify-content-between">
        <h5 class="font-size-14 mb-0 text-dark">
          Payroll Reports Current Payroll Period:
          {{ (parseInt(pmyMonth) - 1) | getMonth }}
          {{ pmyYear }}
        </h5>
      </div>
      <div class="row">
        <div class="col-md-4">
          <Emolument />
        </div>
        <div class="col-md-4">
          <DeductionReport />
        </div>
        <div class="col-md-4">
          <DeductionSheet />
        </div>
        <div class="col-md-4">
          <Variation />
        </div>
        <div class="col-md-4">
          <BankOrder />
        </div>
        <div class="col-md-4">
          <PensionReport />
        </div>
        <div class="col-md-4">
          <NhfReport />
        </div>
        <div class="col-md-4">
          <TaxReport />
        </div>
        <div class="col-md-4">
          <NsitfReport />
        </div>
        <div class="col-md-4">
          <ApprovedRoutine />
        </div>
      </div>
      <div class="p-3 bg-light mb-4 d-flex justify-content-between">
        <h5 class="font-size-14 mb-0 text-dark">System Reports</h5>
      </div>
      <div class="row">
        <div class="col-md-4">
          <EmployeeReport />
        </div>
      </div>
    </div>
  </Layout>
</template>
