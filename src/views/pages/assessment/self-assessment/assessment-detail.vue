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
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Assessment Details",
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
    this.empId = this.$route.params.empid;
    this.goalSettingId = this.$route.params.gsId;
    this.fetchEmployee();
    this.getOpenGoalSetting();
    this.getSelfAssessment();
    this.getEndYearAssessment();
    this.getRatings();

    this.authuser = this.getEmployee.emp_id;
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Assessment Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Assess Employee",
          href: "/assess-employee",
          active: true,
        },
      ],
      authuser: null,
      goalSettingId: null,
      texts: [{ id: 0, goal: null }],
      assessStatus: 0,
      //supervisor:null,
      year: null,
      endYearQuestions: [],
      openGoalActivity: null,
      openGoalActivityId: null,
      rating: null,
      ratingStatus: null,
      ratings: [],
      ratingsArray: [],
      ratingsStatuses: [],
      employeeRating: null,
      goals: [],
      start: "",
      end: "",
      duration: 0,
      submitted: false,
      count: 0,
      selfAssessmentStatus: false,
      prefillStatus: false,
      selfAssessmentGoals: [],
      endYearAssessments: [],
      assessments: [],
      prefillAssessments: [],
      empId: this.$route.params.empid,
      selectedYear: null,
      statuses: [
        { text: "CLOSE", value: 1 },
        { text: "OPEN", value: 0 },
      ],
      currentEmployee: null,
      // statues: [{ value: 0, text: "Open" }, { value: 1, text: "Closed" }],
      gsID: null,
    };
  },
  methods: {
    async getRatings() {
      const url = `${this.ROUTES.rating}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.ratingsArray = [];
          this.ratings = [];
          data.forEach(async (datum) => {
            const dat = {
              text: datum.rating_name,
              value: datum.rating_id,
            };
            const dats = {
              text: datum.rating_name,
              desc: datum.rating_desc,
            };
            this.ratingsArray.push(dat);
            this.ratings.push(dats);
          });
        }
      });
    },
    async getSelfAssessment() {
      const url = `${this.ROUTES.selfAssessment}/get-self-assessment/${this.empId}/${this.goalSettingId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        console.log(data);
        //if (data) {

        this.assessments = [];
        this.assessStatus = data.questions[0].sa_status;
        this.gsID = data.openGoal[0].gs_id;
        this.selectedYear = data.openGoal[0].gs_year;
        data.questions.forEach(async (datum) => {
          const dat = {
            id: datum.sa_id,
            goal: datum.sa_comment,
            response: datum.sa_response,
            update: datum.sa_update,
            challenge: datum.sa_challenges,
            next_step: datum.sa_next_steps,
            support: datum.sa_support_needed,
            accomplishment: datum.sa_accomplishment,
            status: parseInt(datum.sa_status),
          };
          this.assessments.push(dat);
        });
        console.log(this.assessments);
        //}
      });
    },
    async getSelfAssessmentMaster() {
      //const urls = `${this.ROUTES.selfAssessment}/get-self-assessment-master/${this.$route.params.empid}/${this.gsID}`;
      /*await this.apiGet(urls).then(async (res) => {
       // const { data } = res;
        //console.log(data)

      });*/
    },
    async getEndYearAssessment() {
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(urls).then(async (res) => {
        const { data } = res;
        //console.log(data)
        if (data.length > 0) {
          const url = `${this.ROUTES.selfAssessment}/get-end-questions/${
            this.empId
          }/${parseInt(data[0].gs_id)}`;
          await this.apiGet(url).then((res) => {
            const { data } = res;
            if (data) {
              this.ratingStatus = data.ratingStatus;
              this.year = data.year;
              if (data.ratingDetails) {
                this.employeeRating = data.ratingDetails.eyr_rating;
              }
              this.endYearAssessments = [];
              let questionData = data.question;
              questionData.forEach(async (datum) => {
                const dat = {
                  id: datum.sa_id,
                  goal: datum.sa_comment,
                  response: datum.sa_response,
                  status: parseInt(datum.sa_status),
                };
                this.endYearAssessments.push(dat);
              });
            }
          });
        }
      });
    },
    getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityId = parseInt(data[0].gs_id);
        }
      });
    },
    update() {
      const url = `${this.ROUTES.endYearRating}/add-rating`;
      const data = {
        eyr_empid: this.empId,
        eyr_year: this.year,
        eyr_rating: this.employeeRating,
        eyr_by: this.getEmployee.emp_id,
      };

      this.apiPost(url, data, "Rate Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Rated");
      this.getRatings();
      this.getEndYearAssessment();
    },
    updateGoals() {
      const employeeID = this.$route.params.empid;
      const url = `${this.ROUTES.selfAssessment}/update-assessment/${employeeID}/${this.gsID}`;
      this.goals = [];
      let validForm = true;
      this.assessments.every(async (field) => {
        if (field.goal === "" || !field.goal) {
          this.apiFormHandler("Invalid Goal Fields");
          validForm = false;
          return false;
        }
        const data = {
          sa_comment: field.goal,
        };
        this.goals.push(data);
        return true;
      });
      if (validForm) {
        this.apiPatch(url, this.goals, "Update Goals Error").then(() => {
          this.apiResponseHandler("Process Complete", "Goals Updated");
          this.getSelfAssessment();
        });
      }
    },
    processAssessment() {
      const employeeID = this.$route.params.empid;
      const gsId = this.gsID;
      const url = `${this.ROUTES.selfAssessment}/approve-assessment/${employeeID}/${gsId}`;
      const data = {
        gs_id: gsId,
        emp_id: employeeID,
        //supervisor:this.getEmployee.emp_id
      };
      this.apiPost(url, data, "Could not process request").then(() => {
        this.apiResponseHandler(
          "Process Complete",
          "Employee self-assessment completed."
        );
      });
    },
    fetchEmployee() {
      const employeeID = this.$route.params.empid;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        this.currentEmployee = res.data;
        //console.log('Supervisor: '+this.supervisor);
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
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'self-assessment' })"
      >
        <i class="mdi mdi-skip-backward mr-2"></i>
        Self Assessment
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Beginning of the Year</h5>
              </div>
              <form v-if="assessments.length > 0" @submit.prevent="updateGoals">
                <div
                  class="row"
                  v-for="(field, index) in assessments"
                  :key="index"
                >
                  <div class="col-lg-12">
                    <div class="row">
                      <div class="col-12">
                        <div class="form-group">
                          <label for="goal" class="bg-light p-1">
                            Goal {{ index + 1 }}
                            <span class="text-danger">*</span>
                          </label>
                          <p
                            style="margin-left: 30px !important"
                            v-html="field.goal"
                          ></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div class="row" v-else>
                <div class="col-12">
                  <div class="alert alert-warning">
                    Employee yet to submit assessment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Employee Details </h5>
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

          <div
            class="card"
            v-if="authuser === currentEmployee.emp_supervisor_id"
          >
            <div class="card-body">
              <form @submit.prevent="processAssessment">
                <div class="btn-group d-flex">
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="assessStatus === 1 ? true : false"
                  >
                    <i class="mdi mdi-check mr-2"></i> Approve
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
