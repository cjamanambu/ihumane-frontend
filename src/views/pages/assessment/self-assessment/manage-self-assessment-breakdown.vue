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
    //this.getOpenGoalSetting();
    //this.getSelfAssessmentMaster();
    this.refreshTable();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Manage Assessment Period",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Assessment Period",
          href: "#",
          active: true,
        },
      ],
      openGoalActivity: null,
      openGoalActivityYear: null,

      assessments: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      periods: [],
      sortBy: "sn",
      sortDesc: false,
      posted_on: null,
      audience: null,
      selectedYear: null,
      employeeId: null,
    };
  },
  methods: {
    refreshTable() {
      this.selectedYear  = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      const url = `${this.ROUTES.selfAssessment}/get-all-emp-self-assessments/${this.employeeId}/${this.selectedYear}`;
      this.apiGet(url).then((res) => {
        const { data } = res;

        data.map((period, index)=>{
          this.periods[index] = {
            activity: period.goal?.gs_activity,
            activityId: period.goal?.gs_id,
            activity_status: period.goal?.gs_status,
            activity_year: period.goal?.gs_year,
            activity_start: period.goal?.gs_from,
            activity_end: period.goal?.gs_to,
            employeeId: period.employee.emp_id,
            masterId: period.sam_id,
          }
        });
        //console.log(this.periods[1].masterId);
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
      <div class="col-md-4" v-for="(period, index) in periods" :key="index">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <h4 class="mb-0">
                  {{ parseInt(period.activity) === 1 ? 'Beginning of Year' :  parseInt(period.activity) === 2 ? 'Mid Year' : 'End of Year'}}</h4>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({
              name: 'self-assessment-backoffice-by-activity',
              params: {
                activity: parseInt(period.activity),
                year: period.activity_year,
                employee: period.employeeId,
                activityId: period.activityId,
                masterId: period.masterId,

                 },
              })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>

    </div>

  </Layout>
</template>
