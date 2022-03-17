<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Emolument from "./components/emolument";
import DeductionSheet from "./components/deduction-sheet";
import DeductionReport from "./components/deduction-report";
import Variation from "./components/variation";
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
      <div class="p-3 bg-light mb-4">
        <h5 class="font-size-16 mb-0">Emoluments</h5>
      </div>
      <div class="row">
        <div class="col-md-4">
          <Emolument />
        </div>
      </div>
      <div class="p-3 bg-light mb-4">
        <h5 class="font-size-16 mb-0">Deductions</h5>
      </div>
      <div class="row">
        <div class="col-md-4">
          <DeductionReport />
        </div>
        <div class="col-md-4">
          <DeductionSheet />
        </div>
      </div>
      <div class="p-3 bg-light mb-4">
        <h5 class="font-size-16 mb-0">Variations</h5>
      </div>
      <div class="row">
        <div class="col-md-4">
          <Variation />
        </div>
      </div>
    </div>
  </Layout>
</template>
