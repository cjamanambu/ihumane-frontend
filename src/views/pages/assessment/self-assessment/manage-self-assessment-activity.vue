<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Self Assessment Details",
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
    this.activity = this.$route.params.activity;
    if (parseInt(this.activity) === 1) {
      await this.getSelfAssessment();
    } else if (parseInt(this.activity) === 2) {
      await this.midYearAssessments();
    } else {
      await this.prefillAssessment();
    }
    await this.fetchEmployee();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Self Assessment Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Self Assessment Details",
          href: "#",
          active: true,
        },
      ],
      //mid year

      //beginning of year
      authuser: null,
      goalSettingId: null,
      texts: [{ id: 0, goal: null }],
      assessStatus: 0,
      year: null,
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
      employee: [],
      prefillAssessments: [],
      currentEmployee: null,
      gsID: null,
      //end of year
      openGoalActivity: null,
      openGoalActivityYear: null,
      openGoalActivityFrom: null,
      openGoalActivityTo: null,
      openGoalActivityId: null,
      checkOpenGoal: 0,
      empId: null,
      endOfYearQuestions: null,
      midYearCheckingQuestions: null,
      endOfYearQuestionOptions: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" },
      ],
      eyr_strength: null,
      eyr_growth_area: null,
      supervisorResponse: null,
      selectedYear: null,
      selectedStart: null,
      selectedEnd: null,
      employeeId: null,
      activity: null,
      activityId: null,
      sam_discussion_held_on: null,
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
    async prefillAssessment() {
      this.selectedYear = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      this.activity = this.$route.params.activity;
      this.activityId = this.$route.params.activityId;
      let url = `${this.ROUTES.endYearResponse}/get-end-year/${this.employeeId}/${this.activityId}`;
      this.apiGet(url).then(async (res) => {
        const { data } = res;
        if (data.length) {
          //console.log(data)
          this.selectedStart = localStorage.getItem("startDate");
          this.selectedEnd = localStorage.getItem("endDate");
          this.gsId = data[0].eyr_gs_id;
          this.goalMasterId = data[0].eyr_master_id;
          await this.getSupervisorEndYearResponse();
          this.midYearCheckingQuestions = data.filter((entry) => {
            return entry.eyr_type === 1;
          });
          this.midYearCheckingQuestions.forEach((question, index) => {
            this.midYearCheckingQuestions[index] = {
              ...question,
              sa_comment: question.eyr_goal,
            };
          });
          this.eyr_strength = data[0].eyr_strength;
          this.eyr_growth_area = data[0].eyr_growth_area;
          this.endOfYearQuestions = data.filter((entry) => {
            return entry.eyr_type === 2;
          });
          this.endOfYearQuestions.forEach((question, index) => {
            this.endOfYearQuestions[index] = {
              ...question,
              eya_question: question.eyr_goal,
            };
          });
        }
      });
    },
    async getSupervisorEndYearResponse() {
      const url = `${this.ROUTES.endYearResponse}/supervisor-end-year-response/${this.goalMasterId}`;
      this.apiGet(url, "Get Supervisor End Year Response Error").then((res) => {
        const { data } = res;
        this.supervisorResponse = data[0];
        //console.log(this.supervisorResponse);
        this.sam_discussion_held_on = new Date(
          this.supervisorResponse.selfAssessment.sam_discussion_held_on
        )
          .toISOString()
          .substr(0, 10);
      });
    },
    async midYearAssessments() {
      this.masterId = this.$route.params.masterId;
      this.selectedYear = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      this.activity = this.$route.params.activity;
      this.activityId = this.$route.params.activityId;
      const url = `${this.ROUTES.selfAssessment}/get-self-assessment-by-master/${this.masterId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data)
        this.selectedStart = data.openGoal[0].gs_from;
        this.selectedEnd = data.openGoal[0].gs_to;
        localStorage.setItem("startDate", this.selectedStart);
        localStorage.setItem("endDate", this.selectedEnd);
        if (data.question.length > 0) {
          this.texts = [];
          this.optional = data.master?.sam_optional;
          this.sam_discussion_held_on = new Date(
            data.master?.sam_discussion_held_on
          )
            .toISOString()
            .substr(0, 10);
          this.assessStatus = data.question[0].sa_status;
          data.question.forEach(async (datum) => {
            this.selfAssessmentStatus = true;
            this.prefillStatus = true;
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              update: datum.sa_update,
              accomplishment: datum.sa_accomplishment,
              next_step: datum.sa_next_steps,
              challenge: datum.sa_challenges,
              support: datum.sa_support_needed,
            };
            this.texts.push(dat);
          });
        }
      });
    },
    async getSelfAssessment() {
      this.selectedYear = this.$route.params.year;
      this.employeeId = this.$route.params.employee;
      this.activity = this.$route.params.activity;
      this.activityId = this.$route.params.activityId;
      const url = `${this.ROUTES.selfAssessment}/get-self-assessment/${this.employeeId}/${this.activityId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        this.assessments = [];
        this.assessStatus = data.questions[0].sa_status;
        this.gsID = data.openGoal[0].gs_id;
        this.selectedYear = data.openGoal[0].gs_year;
        this.selectedStart = data.openGoal[0].gs_from;
        this.selectedEnd = data.openGoal[0].gs_to;
        localStorage.setItem("startDate", this.selectedStart);
        localStorage.setItem("endDate", this.selectedEnd);
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
        <div class="card">
          <div class="card-body">
            <div class="media mb-3">
              <div>
                <span
                  class="badge badge-primary badge-pill"
                  v-if="parseInt(activity) === 1"
                >
                  Beginning of Year
                </span>
                <span
                  class="badge badge-primary badge-pill"
                  v-else-if="parseInt(activity) === 2"
                >
                  Mid-Year
                </span>
                <span class="badge badge-primary badge-pill" v-else>
                  End of Year
                </span>
                <span class="badge badge-primary badge-pill ml-3">
                  {{ selectedYear }}
                </span>
              </div>
            </div>

            <div class="row" v-if="parseInt(activity) === 3">
              <div class="col-6">
                <div class="card mb-4">
                  <div class="card-body" v-if="employee[0]">
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
                  <div class="card-body" v-if="employee[0]">
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
              <div class="col-md-12">
                <h5 class="mb-2">
                  End of Year: {{ selectedYear }}
                </h5> <br>
                <h5 class="mb-1">
                  Review Period
                  {{ new Date(selectedStart).toDateString() }} -
                  {{ new Date(selectedEnd).toDateString() }}
                </h5>
              </div>
                <div class="col-6">
                  <div class="card mb-4">
                    <div class="card-body">
                      <div class="p-3 bg-light mb-4">
                        <h5 class="font-size-14 mb-0">Supervisor Details</h5>
                      </div>
                      <div class="d-flex justify-content-between text-capitalize">
                        <p>Supervisor Name</p>
                        <p >
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
                        <p >
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

              <div class="col-lg-6">
                <div class="card">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Manager Evaluation</h5>
                    </div>
                    <div class="mt-5">
                      <p>
                        <strong class="font-size-14 mb-0">
                          Strength (required):
                        </strong>
                        Think about this employee’s achievements and identify an
                        area of strength that you have observed in them. An
                        example of a strength may be a task or process that
                        comes easily to your employee, and something that
                        excites/motivates them.
                      </p>
                      <div class="form-group">
                        <textarea
                          v-if="supervisorResponse"
                          v-model="supervisorResponse.eysr_strength"
                          type="text"
                          rows="4"
                          class="form-control"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="mt-5">
                      <p>
                        <strong class="font-size-14 mb-0">
                          Growth Area (required):
                        </strong>
                        Identify an area of growth you wish this employee to
                        focus on in the next 6 months. This may be a task or
                        process your employee finds particularly challenging, or
                        something they need to learn more about in order to
                        excel in their role.
                      </p>
                      <div class="form-group">
                        <textarea
                          v-if="supervisorResponse"
                          v-model="supervisorResponse.eysr_growth"
                          type="text"
                          rows="4"
                          class="form-control"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="mt-5">
                      <strong class="font-size-14 mb-0">
                        Select a rating for this employee (required):
                      </strong>
                      <b-list-group v-if="supervisorResponse" class="mt-3">
                        <b-list-group-item
                          href="#"
                          class="d-flex"
                          active
                          variant="secondary"
                        >
                          <div class="ml-1 mr-5 w-25 d-flex align-items-center">
                            {{ supervisorResponse.rating.rating_name }}
                          </div>
                          <div class="w-75">
                            {{ supervisorResponse.rating.rating_desc }}
                          </div>
                        </b-list-group-item>
                      </b-list-group>
                    </div>
                    <div class="mt-5">
                      <p>
                        <strong class="font-size-14 mb-0">
                          Additional comments:
                        </strong>
                      </p>
                      <div class="form-group">
                        <textarea
                          v-if="supervisorResponse"
                          v-model="supervisorResponse.eysr_additional_comment"
                          type="text"
                          rows="4"
                          class="form-control"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="mt-5 mb-3">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label for="">Discussion held on:</label>
                            <input
                              type="date"
                              v-model="sam_discussion_held_on"
                              placeholder="Discussion Held On"
                              class="form-control"
                              readonly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Employee Reflection</h5>
                    </div>
                    <div>
                      <p>
                        <strong class="font-size-14 mb-0">Reflection:</strong>
                        Consider your work and performance from this fiscal
                        year. Comment about your accomplishments and challenges.
                        If you wish, you may list your goals from this year and
                        comment on each goal. If you have at least one direct
                        report, comment on how you met or worked towards the
                        <a
                          href="https://rescue.app.box.com/s/w9mny3pek9xb0b2hwtz7uqxzlneh7nha"
                          target="_blank"
                        >
                          People Manager Standards.
                        </a>
                      </p>
                      <b-table-simple hover responsive bordered outlined>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>S/n</b-th>
                            <b-th>Goal</b-th>
                            <b-th>Reflection</b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr
                            v-for="(data, index) in midYearCheckingQuestions"
                            :key="index"
                          >
                            <b-td style="width: 1%">
                              {{ index + 1 }}
                            </b-td>
                            <b-td style="width: 30%">
                              {{ data.eyr_goal }}
                            </b-td>
                            <b-td style="width: 70%">
                              {{ data.eyr_reflection }}
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </div>
                    <div class="mt-5">
                      <p>
                        <strong class="font-size-14 mb-0">Strength:</strong>
                        Think about your achievements and identify an area of
                        strength that you have observed in yourself. An example
                        of a strength may be a task or process that comes easily
                        to you, and something that excites/motivates you.
                      </p>
                      <div class="form-group">
                        <textarea
                          type="text"
                          rows="4"
                          class="form-control"
                          v-model="eyr_strength"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="mt-5">
                      <p>
                        <strong class="font-size-14 mb-0">Growth Area:</strong>
                        Identify a growth area you wish to focus on in the next
                        6 months. This may be a task or process you find
                        particularly challenging, or something you need to learn
                        more about to excel in your role.
                        <br />
                        Suggest 1-2 steps you can take to begin working on this
                        growth area.
                      </p>
                      <div class="form-group">
                        <textarea
                          type="text"
                          rows="4"
                          class="form-control"
                          v-model="eyr_growth_area"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="mt-5">
                      <strong class="font-size-14 mb-0">
                        Check the applicable boxes:
                      </strong>
                      <ul class="mt-2">
                        <li
                          class="mb-3"
                          v-for="(question, index) in endOfYearQuestions"
                          :key="index"
                        >
                          <div class="d-flex justify-content-between">
                            <div>{{ question.eya_question }}</div>
                            <div>
                              <b-form-radio-group
                                :options="endOfYearQuestionOptions"
                                v-model="question.eyr_response"
                                disabled
                              />
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row" v-else-if="parseInt(activity) === 1">
              <div class="col-lg-12">
                <h5 class="mb-2">
                  Beginning of Year: {{ selectedYear }}
                </h5>
                <h5 class="mb-1">
                  Review Period
                  {{ new Date(selectedStart).toDateString() }} -
                  {{ new Date(selectedEnd).toDateString() }}
                </h5>
                <div class="row">
                  <div class="col-4">
                    <div class="card mb-4">
                      <div class="card-body">
                        <div class="p-3 bg-light mb-4">
                          <h5 class="font-size-14 mb-0">Supervisor Details</h5>
                        </div>
                        <div
                          class="d-flex justify-content-between text-capitalize"
                        >
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
                  <div class="col-4">
                    <div class="card mb-4">
                      <div class="card-body">
                        <div class="p-3 bg-light mb-4">
                          <h5 class="font-size-14 mb-0">Employee Details</h5>
                        </div>
                        <div
                          class="d-flex justify-content-between text-capitalize"
                        >
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
                  <div class="col-md-4">
                    <div class="card">
                      <div class="card-body">
                        <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                          <div class="d-inline mb-0">
                            <h5 class="font-size-14 mb-0">Application Re-assignment</h5>
                          </div>
                        </div>
                        <div class="mb-3">
                          <form >
                            <div class="form-group">
                              <label for="">Initially Assigned to</label>
                              <multiselect
                                id="assignedTo"
                                v-model="assignedTo"
                                :options="assignedOfficials"
                                :custom-label="employeeLabel"
                                :class="{
                          'is-invalid': submitted && $v.assignedTo.$error,
                        }"
                              ></multiselect>
                            </div>
                            <div class="form-group">
                              <label for="">Re-assign to</label>
                              <multiselect
                                id="reAssignedTo"
                                v-model="reAssignedTo"
                                :options="officials"
                                :custom-label="reAssignLabel"
                                :class="{
                          'is-invalid': submitted && $v.reAssignedTo.$error,
                        }"
                              ></multiselect>
                              <input type="hidden" v-model="leaveID" >
                            </div>
                            <div class="form-group d-flex justify-content-center">
                              <b-button
                                v-if="!submitted"
                                type="submit"
                                class="btn btn-success btn-lg mt-4 d-flex justify-content-center"
                              >
                                Save Changes
                              </b-button>
                              <b-button v-else disabled class="btn btn-success btn-block mt-4">
                                Saving changes...
                              </b-button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div
                    class="col-12"
                    v-for="(field, index) in assessments"
                    :key="index"
                  >
                    <div class="form-group">
                      <label for="goal" class="bg-light p-1">
                        Goal
                        <span class="badge-danger badge">{{ index + 1 }}</span>
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
            <div class="row" v-else-if="parseInt(activity) === 2">
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

              <div class="col-lg-12">
                <div class="card">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Goal Setting Form</h5>
                    </div>
                    <div class="mb-3">
                      <h5 class="mb-2">
                        Mid Year Checking: {{ selectedYear }}
                      </h5>
                      <h5 class="mb-1">
                        Review Period
                        {{ new Date(selectedStart).toDateString() }} -
                        {{ new Date(selectedEnd).toDateString() }}
                      </h5>
                      <p class="mt-3">
                        Work with your manager to discuss and agree on at least
                        <strong>3</strong> goals for your work over this review
                        period.
                      </p>
                      <p>
                        Try to write at least 2-3 performance goals, focused on
                        your key areas of responsibility. Then, write 1 goal
                        about an area of growth/development. To create a
                        development goal, consider a strength you would like to
                        get even better in, or a challenging area you wish to
                        improve in.
                      </p>
                      <p>
                        Your goals should be SMART (specific, measurable,
                        actionable, realistic, timebound). For tips on creating
                        SMART goals,
                        <a
                          href="https://rescue.box.com/s/v5a0wfucoe1drhrz2cepy6wzr6urr3hr"
                          target="_blank"
                        >
                          click here.
                        </a>
                        For an e-learning module on how to write a good goal,
                        <a
                          href="https://kayaconnect.org/auth/saml2/login.php?wants=https://kayaconnect.org/course/info.php?id=1276&idp=dbcf769ab2c00b042dd2189fca3b115f&passive=off"
                          target="_blank"
                        >
                          click here.
                        </a>
                      </p>
                    </div>
                    <form>
                      <b-table-simple hover responsive bordered outlined>
                        <b-thead head-variant="dark">
                          <b-tr>
                            <b-th>S/n</b-th>
                            <b-th>Goal/Project</b-th>
                            <b-th>Update</b-th>
                            <b-th>Accomplishments</b-th>
                            <b-th>Challenges</b-th>
                            <b-th>Support Needed</b-th>
                            <b-th>Next Steps</b-th>
                            <b-th></b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr v-for="(field, index) in texts" :key="index">
                            <b-td style="width: 1%">
                              {{ index + 1 }}
                            </b-td>
                            <b-td style="width: 19%">
                              <textarea
                                type="text"
                                v-model="field.goal"
                                rows="6"
                                class="form-control"
                                :readonly="assessStatus === 1 ? true : false"
                              />
                            </b-td>
                            <b-td style="width: 11%">
                              <div class="form-group">
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    v-model="field.update"
                                    value="Complete"
                                    type="radio"
                                    :name="index"
                                    :checked="field.update === 'Complete'"
                                    :disabled="
                                      assessStatus === 1 ? true : false
                                    "
                                  />
                                  <label class="form-check-label">
                                    Complete
                                  </label>
                                </div>
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    id="complete"
                                    v-model="field.update"
                                    value="On track"
                                    :checked="field.update === 'On track'"
                                    :disabled="
                                      assessStatus === 1 ? true : false
                                    "
                                    type="radio"
                                    :name="index"
                                  />
                                  <label class="form-check-label">
                                    On track
                                  </label>
                                </div>
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    id="on-track"
                                    v-model="field.update"
                                    value="Delayed"
                                    type="radio"
                                    :name="index"
                                    :checked="field.update === 'Delayed'"
                                    :disabled="
                                      assessStatus === 1 ? true : false
                                    "
                                  />
                                  <label class="form-check-label">
                                    Delayed
                                  </label>
                                </div>
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    v-model="field.update"
                                    value="Not started"
                                    type="radio"
                                    :name="index"
                                    :checked="field.update"
                                    :disabled="
                                      assessStatus === 1 ? true : false
                                    "
                                  />
                                  <label class="form-check-label">
                                    Not started
                                  </label>
                                </div>
                                <div class="form-check">
                                  <input
                                    class="form-check-input"
                                    v-model="field.update"
                                    value="No longer relevant"
                                    type="radio"
                                    :name="index"
                                    :checked="
                                      field.update === 'No longer relevant'
                                    "
                                    :disabled="
                                      assessStatus === 1 ? true : false
                                    "
                                  />
                                  <label class="form-check-label">
                                    No longer relevant
                                  </label>
                                </div>
                              </div>
                            </b-td>
                            <b-td style="width: 17%">
                              <textarea
                                type="text"
                                v-model="field.accomplishment"
                                rows="6"
                                class="form-control"
                                :readonly="assessStatus === 1 ? true : false"
                              />
                            </b-td>
                            <b-td style="width: 17%">
                              <textarea
                                type="text"
                                v-model="field.challenge"
                                rows="6"
                                class="form-control"
                                :readonly="assessStatus === 1 ? true : false"
                              />
                            </b-td>
                            <b-td style="width: 17%">
                              <textarea
                                type="text"
                                v-model="field.support"
                                rows="6"
                                class="form-control"
                                :readonly="assessStatus === 1 ? true : false"
                              />
                            </b-td>
                            <b-td style="width: 17%; cursor: pointer">
                              <textarea
                                type="text"
                                v-model="field.next_step"
                                rows="6"
                                class="form-control"
                                :readonly="assessStatus === 1 ? true : false"
                              />
                            </b-td>
                            <b-td style="width: 1%" v-if="assessStatus === 0">
                              <button
                                v-if="index > 2"
                                type="button"
                                class="btn btn-sm btn-danger"
                                @click="delField(index)"
                              >
                                DEL
                              </button>
                            </b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                      <div
                        class="alert alert-info d-flex mt-3"
                        v-if="assessStatus === 0"
                      >
                        <i class="ri-error-warning-line mr-2"></i>
                        You must submit a minimum of 3 goals.
                        <span
                          style="cursor: pointer; text-decoration: underline"
                          class="ml-1"
                          @click="addField"
                        >
                          Click here to add a new goal
                        </span>
                      </div>
                      <div class="row">
                        <div class="col-md-4">
                          <div class="form-group">
                            <label for="">Discussion Held on:</label>
                            <input
                              type="date"
                              v-model="sam_discussion_held_on"
                              placeholder="Discussion Held On"
                              class="form-control"
                            />
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="form-group">
                            <label for="op">
                              Optional – other items to discuss (career
                              opportunities, area of growth & development, etc.)
                            </label>
                            <b-form-textarea
                              id="option"
                              no-resize
                              :readonly="assessStatus === 1 ? true : false"
                              rows="3"
                              v-model="optional"
                              placeholder="Optional"
                              class="form-control"
                              :class="{
                                'is-invalid': submitted && $v.optional.$error,
                              }"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
