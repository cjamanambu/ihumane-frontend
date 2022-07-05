<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Select Timesheet Period",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Select Timesheet Period",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Select Timesheet Period",
          active: true,
        },
      ],
      timesheetDate: null,
    };
  },
  methods: {
    generateTimesheet() {
      if (!this.timesheetDate) {
        this.$bvToast.toast(`Please fill in all fields correctly`, {
          title: `Payroll Month & Year is Required`,
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });
      } else {
        this.$router.push({
          name: "timesheet",
          params: { payrollMY: this.timesheetDate },
        });
      }
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$router.push('/timesheets')">
        <i class="mdi mdi-plus mr-2"></i>
        View Timesheets
      </b-button>
    </div>
    <div class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0">Select Period</h5>
            </div>
            <form @submit.prevent="generateTimesheet">
              <div class="form-group">
                <label for="pmy">
                  Payroll Month & Year <span class="text-danger">*</span>
                </label>
                <input
                  id="pmy"
                  v-model="timesheetDate"
                  type="month"
                  class="form-control"
                />
              </div>
              <b-button
                v-if="!submitting"
                class="btn btn-success btn-block mt-4"
                type="submit"
              >
                Generate Timesheet
              </b-button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
