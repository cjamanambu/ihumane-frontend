<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Self Assessment",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.getOpenGoalSetting();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Self Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Self Assessment",
          href: "/self-assessment",
          active: true,
        },
      ],
      openGoalActivity: null,
      openGoalActivityYear: null,
    };
  },
  methods: {
    getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityYear = data[0].gs_year;
        }
      });
    },
  },
};
</script>
<style>
.back {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">Beginning of Year</h4>
              </div>
              <div>
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 1"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'beginning-of-year' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">Mid Year Checking</h4>
              </div>
              <div class="text-secondary">
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 2"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'mid-year-checking' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">End of Year</h4>
              </div>
              <div class="text-secondary">
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 3"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'end-of-year-assessment' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div  class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="text-uppercase">Previously Submitted Self-assessments</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-bordered">
                  <tr>
                    <thead>#</thead>
                    <thead>Supervisor</thead>
                    <thead>Status</thead>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
