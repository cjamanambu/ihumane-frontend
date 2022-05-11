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
      currentEmployee: null,
      periodDetails: null,
    };
  },
  methods: {
    async refreshTable() {
      this.selectedYear = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      const url = `${this.ROUTES.selfAssessment}/get-all-emp-self-assessments/${this.employeeId}/${this.selectedYear}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length) this.periodDetails = data[0];
        data.map((period, index) => {
          this.periods[index] = {
            activity: period.goal?.gs_activity,
            activityId: period.goal?.gs_id,
            activity_status: period.goal?.gs_status,
            activity_year: period.goal?.gs_year,
            activity_start: period.goal?.gs_from,
            activity_end: period.goal?.gs_to,
            employeeId: period.employee.emp_id,
            masterId: period.sam_id,
          };
        });
        //console.log(this.periods[1].masterId);
      });
      await this.fetchEmployee();
    },
    fetchEmployee() {
      const employeeID = this.$route.params.employee;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        this.currentEmployee = res.data;
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
      <div class="col-md-12 d-flex justify-content-end">
        <div class="mb-3">
          <b-button class="btn btn-secondary" @click="$router.go(-1)">
            <i class="mdi mdi-step-backward mr-2"></i>
            Go Back
          </b-button>
        </div>
      </div>
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">
            <div v-if="currentEmployee" class="card mb-4">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">Employee Details</h5>
                </div>
                <div class="d-flex justify-content-between text-capitalize">
                  <p>Employee Name</p>
                  <p>
                    {{ currentEmployee.emp_first_name }}
                    {{ currentEmployee.emp_last_name }}
                  </p>
                </div>
                <div class="d-flex justify-content-between">
                  <p>T7 Number</p>
                  <p>{{ currentEmployee.emp_unique_id }}</p>
                </div>
                <div class="d-flex justify-content-between">
                  <p>Phone Number</p>
                  <p>{{ currentEmployee.emp_phone_no }}</p>
                </div>
                <div class="d-flex justify-content-between">
                  <p>Office Email</p>
                  <p>{{ currentEmployee.emp_office_email }}</p>
                </div>
                <div class="d-flex justify-content-between">
                  <p>T3 Code</p>
                  <p>{{ currentEmployee.sector.d_t3_code }}</p>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="mb-0">T6 Code</p>
                  <p class="mb-0">{{ currentEmployee.location.l_t6_code }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">Goal Setting Period Details</h5>
                </div>
                <div class="d-flex justify-content-between text-capitalize">
                  <p>Goal Setting Year</p>
                  <p>
                    {{ periodDetails.goal.gs_year }}
                  </p>
                </div>
                <div class="d-flex justify-content-between text-capitalize">
                  <p>Goal Setting Period Start</p>
                  <p>
                    {{ periodDetails.goal.gs_from }}
                  </p>
                </div>
                <div class="d-flex justify-content-between text-capitalize">
                  <p>Goal Setting Period End</p>
                  <p>
                    {{ periodDetails.goal.gs_to }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4" v-for="(period, index) in periods" :key="index">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <h4 class="mb-0">
                  {{
                    parseInt(period.activity) === 1
                      ? "Beginning of Year"
                      : parseInt(period.activity) === 2
                      ? "Mid Year"
                      : "End of Year"
                  }}
                </h4>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="
                $router.push({
                  name: 'self-assessment-backoffice-by-activity',
                  params: {
                    activity: parseInt(period.activity),
                    year: period.activity_year,
                    employee: period.employeeId,
                    activityId: period.activityId,
                    masterId: period.masterId,
                  },
                })
              "
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
