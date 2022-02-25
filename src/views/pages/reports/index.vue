<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Emolument from "./components/emolument";
import Deduction from "./components/deduction";
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
    Deduction,
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
    <div v-else class="row">
      <div class="col-md-4">
        <Emolument />
      </div>
      <div class="col-md-4">
        <Deduction />
      </div>
      <div class="col-md-4">
        <Variation />
      </div>
    </div>
  </Layout>
</template>
