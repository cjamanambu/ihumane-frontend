<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import NewSalaryMappingForm from "./components/new-salary-mapping-form";
export default {
  page: {
    title: "Salary Mappings",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    NewSalaryMappingForm,
  },
  data() {
    return {
      title: "Salary Mappings",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Mappings",
          active: true,
        },
      ],
    };
  },
  methods: {},
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <NewSalaryMappingForm />
  </Layout>
</template>
