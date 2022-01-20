<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Payroll Setup",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshPMY();
  },
  data() {
    return {
      title: "Payroll Setup",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Payroll Setup",
          active: true,
        },
      ],
    };
  },
  methods: {
    refreshPMY() {
      this.apiGet(
        this.ROUTES.payrollMonthYear,
        "Get Payroll Month & Year error"
      ).then((res) => {
        console.log({ res });
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div
      class="d-flex justify-content-between align-items-start mb-3 flex-lg-row flex-column"
    >
      <b-card
        header-class="bg-transparent border-success"
        class="border border-success d-inline-block"
      >
        <template v-slot:header>
          <h5 class="my-0 text-success">
            <i class="mdi mdi-calendar-sync mr-3"></i>
            Payroll Month & Year
          </h5>
        </template>
        <h5 class="card-title mt-0">{{ mtr }}%</h5>
        <p class="card-text update-mtr" @click="selectMTR">Update MTR</p>
      </b-card>
    </div>
  </Layout>
</template>
