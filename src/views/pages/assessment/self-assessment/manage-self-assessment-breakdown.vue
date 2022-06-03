<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("SELF_ASSESSMENT")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
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
  async mounted() {
    //this.getOpenGoalSetting();
    //this.getSelfAssessmentMaster();
    this.refreshTable();
    await this.fetchEmployee();
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
      employee: [],
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
    async fetchEmployee() {
      this.employeeId = this.$route.params.employee;
      const url = `${this.ROUTES.employee}/get-employee/${this.employeeId}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        const { data } = res;
        if (data) {
          this.employee.push(data);
        }
      });
    },
    refreshTable() {
      this.selectedYear = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      const url = `${this.ROUTES.selfAssessment}/get-all-emp-self-assessments/${this.employeeId}/${this.selectedYear}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data)
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
      <div class="col-md-4" v-for="(period, index) in periods" :key="index">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <span class="badge badge-info float-right">{{
                  selectedYear
                }}</span>
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
            <p>
              <strong>From: </strong
              ><span class="text-success">{{
                new Date(period.activity_start).toDateString()
              }}</span>
              &nbsp; &nbsp;&nbsp;&nbsp; <strong>To: </strong
              ><span class="text-danger">{{
                new Date(period.activity_end).toDateString()
              }}</span>
            </p>
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
      <div class="row w-100">
        <div class="col-6">
          <div class="card mb-4">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Supervisor Details</h5>
              </div>
              <div class="d-flex justify-content-between text-capitalize">
                <p>Supervisor Name</p>
                <p>
                  {{ employee[0].supervisor.emp_first_name }}
                  {{ employee[0].supervisor.emp_last_name }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>T7 Number</p>
                <p>
                  {{ employee[0].supervisor.emp_unique_id }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Phone Number</p>
                <p>
                  {{ employee[0].supervisor.emp_phone_no }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Office Email</p>
                <p>
                  {{ employee[0].supervisor.emp_office_email }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Sector Code</p>
                <p>
                  {{ employee[0].supervisor.sector.d_t3_code }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Location Code</p>
                <p>
                  {{ employee[0].supervisor.location.l_t6_code }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card mb-4">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Employee Details</h5>
              </div>
              <div class="d-flex justify-content-between text-capitalize">
                <p>Employee Name</p>
                <p>
                  {{ employee[0].emp_first_name }}
                  {{ employee[0].emp_last_name }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>T7 Number</p>
                <p>
                  {{ employee[0].emp_unique_id }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Phone Number</p>
                <p>
                  {{ employee[0].emp_phone_no }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Office Email</p>
                <p>
                  {{ employee[0].emp_office_email }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Sector Code</p>
                <p>
                  {{ employee[0].sector.d_t3_code }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Location Code</p>
                <p>
                  {{ employee[0].location.l_t6_code }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
