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
export default {
  page: {
    title: "Reports",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Emolument,
    DeductionSheet,
    DeductionReport,
    Variation,
    BankOrder,
    EmployeeReport

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
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
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
          <EmployeeReport />
        </div>
      </div>
    </div>
  </Layout>
</template>
