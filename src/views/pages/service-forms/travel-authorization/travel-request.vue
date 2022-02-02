<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Travel Request",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.fetchRequest();
  },
  methods: {
    fetchRequest() {
      let requestID = this.$route.params.travelAppID;
      const url = `${this.ROUTES.travelApplication}/${requestID}`;
      this.apiGet(url, "Get Travel Application").then((res) => {
        console.log({ res });
      });
    },
  },
  data() {
    return {
      title: "Travel Request",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Travel Request",
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
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'travel-requests' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Travel Requests
      </b-button>
    </div>
  </Layout>
</template>
