<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
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
    title: "End of Year Assessment",
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
    this.empId = this.getEmployee.emp_id;
    await this.getOpenGoalSetting();
    await this.prefillAssessment();
  },
  data() {
    return {
      title: "End of Year Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "End of Year Assessment",
          active: true,
        },
      ],
      texts: [
        { id: 0, goal: null },
        { id: 1, goal: null },
        { id: 2, goal: null },
      ],
      endYearQuestions: [],
      openGoalActivity: null,
      openGoalActivityYear: null,
      openGoalActivityFrom: null,
      openGoalActivityTo: null,
      openGoalActivityId: null,
      goals: [],
      start: "",
      end: "",
      duration: 0,
      submitted: false,
      count: 0,
      selfAssessmentStatus: false,
      prefillStatus: false,
      selfAssessmentGoals: [],
      assessments: [],
      prefillAssessments: [],
      finalAssessmentStatus: 0,
      assessmentResults: 0,
      ratings: [],
      ratingsArray: [],
      employeeRating: null,
      checkOpenGoal: 0,
      empId: null,
      endOfYearQuestions: null,
      midYearCheckingQuestions: null,
      endOfYearQuestionOptions: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" },
      ],
      reflections: [],
      endOfYearResponse: [],
      eyr_strength: null,
      eyr_growth_area: null,
      approvedStatus: false,
      prefilled: false,
      prefilledData: null,
      prefilledStrength: null,
      prefilledGrowthArea: null,
      prefilledMidYearData: null,
      prefilledEndOfYearData: null,
      supervisorResponse: null,
      goalMasterId: null,
      gsId: null,
      eysr_strength: null,
      eysr_growth_area: null,
      eysr_additional_comment: null,
      sam_discussion_held_on: null,
    };
  },
  methods: {
    addField() {
      this.texts.push({ id: this.count++, goal: null });
      this.count++;
    },

    delField(index) {
      if (index > 0) {
        this.texts.splice(index, 1);
      }
    },

    addAssessment() {
      this.assessments.push({ id: this.count++, goal: null });
      this.count++;
    },

    delAssessment(index) {
      if (index > 0) {
        this.assessments.splice(index, 1);
      }
    },

    addPrefillAssessment() {
      this.prefillAssessments.push({ id: this.count++, goal: null });
      this.count++;
    },

    delPrefillAssessment(index) {
      if (index > 0) {
        this.prefillAssessments.splice(index, 1);
      }
    },

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
      const url = `${this.ROUTES.selfAssessment}/get-self-assessments/${this.empId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.assessments = [];
          data.forEach(async (datum) => {
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              response: datum.sa_response,
              status: parseInt(datum.sa_status),
              eya: datum.sa_eya_id,
            };
            this.assessments.push(dat);
          });
        }
      });
    },

    async getEndYearAssessment() {
      // const url = `${this.ROUTES.endYearResponse}/prefill`;
    },

    async prefillAssessment() {
      let url = `${this.ROUTES.endYearResponse}/get-end-year/${this.empId}/${this.openGoalActivityId}`;
      this.apiGet(url).then(async (res) => {
        const { data } = res;
        if (data.length) {
          this.gsId = data[0].eyr_gs_id;
          this.goalMasterId = data[0].eyr_master_id;
          await this.getSupervisorEndYearResponse();
          // this.prefilled = false;
          data.every((entry) => {
            if (entry.eyr_status === 1) {
              this.approvedStatus = true;
              return false;
            }
            return true;
          });
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
        } else {
          this.prefilled = false;
          url = `${this.ROUTES.endYearResponse}/prefill-end-year/${this.empId}`;
          this.apiGet(url).then((res) => {
            this.midYearCheckingQuestions = [];
            this.endOfYearQuestions = [];
            const { data } = res;
            const { midYearCheckingQuestions, endOfYearQuestions } = data;
            midYearCheckingQuestions.forEach((question) => {
              this.midYearCheckingQuestions.push({
                ...question,
                eyr_reflection: null,
              });
            });
            endOfYearQuestions.forEach((question) => {
              this.endOfYearQuestions.push({
                ...question,
                eyr_response: "no",
              });
            });
          });
        }
      });
    },

    async finalAssessment() {
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      const url = await this.apiGet(urls).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          return `${this.ROUTES.endYearRating}/get-rating/${
            this.getEmployee.emp_id
          }/${parseInt(data[0].gs_year)}`;
        }
      });
      if (url) {
        await this.apiGet(url).then((res) => {
          const { data } = res;
          if (data) {
            this.finalAssessmentStatus = 1;
            this.employeeRating = data.eyr_rating;
          }
        });
      }
    },

    async getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityId = parseInt(data[0].gs_id);
          this.openGoalActivityFrom = data[0].gs_from;
          this.openGoalActivityTo = data[0].gs_to;
          this.openGoalActivityYear = data[0].gs_year;
          this.checkOpenGoal = 1;
        }
      });
    },

    submitNewBeginning() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.openGoalActivityId}`;
      this.goals = [];
      this.texts.forEach(async (field) => {
        const data = {
          sa_comment: field.goal,
        };

        this.goals.push(data);
      });
      this.apiPost(url, this.goals, "Add goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Added");
        this.getSelfAssessment();
      });
    },

    update() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/update-self-assessment/${employeeID}`;
      this.goals = [];
      this.assessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_comment: field.goal,
        };
        this.goals.push(data);
        //console.log("goals", this.goals);
      });
      this.apiPatch(url, this.goals, "Update goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Updated");
        this.getSelfAssessment();
      });
    },
    async getSupervisorEndYearResponse() {
      const url = `${this.ROUTES.endYearResponse}/supervisor-end-year-response/${this.goalMasterId}`;
      this.apiGet(url, "Get Supervisor End Year Response Error").then((res) => {
        const { data } = res;
        this.supervisorResponse = data[0];
        this.sam_discussion_held_on = new Date(
          this.supervisorResponse.selfAssessment.sam_discussion_held_on
        )
          .toISOString()
          .substr(0, 10);
      });
    },
    respond() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/respond-self-assessment/${employeeID}`;
      this.goals = [];
      this.assessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_response: field.response,
          sa_status: 1,
        };
        this.goals.push(data);
      });
      this.apiPatch(url, this.goals, "Update goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Updated");
        this.getSelfAssessment();
      });
    },

    submitNew() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.openGoalActivityId}`;
      this.goals = [];
      this.prefillAssessments.forEach(async (field) => {
        const data = {
          sa_comment: field.goal,
        };

        this.goals.push(data);
      });
      this.apiPost(url, this.goals, "Add goals Error").then();
      this.apiResponseHandler("Process Complete", "Goals Added");
      this.getSelfAssessment();
      //this.prefillAssessment()
    },
    async submitEndOfYear() {
      let url = `${this.ROUTES.endYearResponse}/add-question/${this.empId}/${this.openGoalActivityId}`;
      const data = [];
      await this.midYearCheckingQuestions.forEach((question) => {
        data.push({
          eyr_goal: question.sa_comment,
          eyr_reflection: question.eyr_reflection,
          eyr_type: 1,
          eyr_strength: this.eyr_strength,
          eyr_growth_area: this.eyr_growth_area,
          eyr_response: null,
        });
      });
      await this.endOfYearQuestions.forEach((question) => {
        data.push({
          eyr_goal: question.eya_question,
          eyr_reflection: null,
          eyr_type: 2,
          eyr_strength: this.eyr_strength,
          eyr_growth_area: this.eyr_growth_area,
          eyr_response: question.eyr_response,
        });
      });
      this.apiPost(url, data, "Submit End of Year Error").then((res) => {
        this.apiResponseHandler(`${res.data}`, "Submit End of Year");
        this.prefillAssessment();
      });
    },
  },
};
</script>
<style>
.bg-skyblue {
  background-color: #87ceeb;
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
        <i class="mdi mdi-plus mr-2"></i>
        Self Assessment
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div v-if="openGoalActivity === 3 && parseInt(checkOpenGoal) === 1">
        <div class="row">
          <div class="col-lg-6">
            <div class="card mb-4 bg-skyblue">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">Supervisor Details</h5>
                </div>
                <div class="d-flex justify-content-between text-capitalize">
                  <p>Employee Name</p>
                  <p v-if="supervisorResponse">
                    {{ supervisorResponse.supervisor.emp_first_name }}
                    {{ supervisorResponse.supervisor.emp_last_name }}
                  </p>
                  <span v-else>-</span>
                </div>
                <div class="d-flex justify-content-between">
                  <p>T7 Number</p>
                  <p v-if="supervisorResponse">
                    {{ supervisorResponse.supervisor.emp_unique_id }}
                  </p>
                  <span v-else>-</span>
                </div>
                <div class="d-flex justify-content-between">
                  <p>Phone Number</p>
                  <p v-if="supervisorResponse">
                    {{ supervisorResponse.supervisor.emp_phone_no }}
                  </p>
                  <span v-else>-</span>
                </div>
                <div class="d-flex justify-content-between">
                  <p>Office Email</p>
                  <p v-if="supervisorResponse">
                    {{ supervisorResponse.supervisor.emp_office_email }}
                  </p>
                  <span v-else>-</span>
                </div>
                <!--                <div class="d-flex justify-content-between">-->
                <!--                  <p>T3 Code</p>-->
                <!--                  <p v-if="supervisorResponse">-->
                <!--                    {{ supervisorResponse.supervisor.sector.d_t3_code }}-->
                <!--                  </p>-->
                <!--                  <span v-else>-</span>-->
                <!--                </div>-->
                <!--                <div class="d-flex justify-content-between">-->
                <!--                  <p class="mb-0">T6 Code</p>-->
                <!--                  <p class="mb-0" v-if="supervisorResponse">-->
                <!--                    {{ supervisorResponse.supervisor.location.l_t6_code }}-->
                <!--                  </p>-->
                <!--                  <span v-else>-</span>-->
                <!--                </div>-->
              </div>
            </div>
            <div class="card bg-skyblue">
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
                    area of strength that you have observed in them. An example
                    of a strength may be a task or process that comes easily to
                    your employee, and something that excites/motivates them.
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
                    Identify an area of growth you wish this employee to focus
                    on in the next 6 months. This may be a task or process your
                    employee finds particularly challenging, or something they
                    need to learn more about in order to excel in their role.
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
                <div v-if="approvedStatus">
                  <div>
                    <p>
                      <strong class="font-size-14 mb-0">Reflection:</strong>
                      Consider your work and performance from this fiscal year.
                      Comment about your accomplishments and challenges. If you
                      wish, you may list your goals from this year and comment
                      on each goal. If you have at least one direct report,
                      comment on how you met or worked towards the
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
                      <strong class="font-size-14 mb-0">Strength:</strong> Think
                      about your achievements and identify an area of strength
                      that you have observed in yourself. An example of a
                      strength may be a task or process that comes easily to
                      you, and something that excites/motivates you.
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
                      Identify a growth area you wish to focus on in the next 6
                      months. This may be a task or process you find
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
                <form v-else @submit.prevent="submitEndOfYear">
                  <div>
                    <p>
                      <strong class="font-size-14 mb-0">Reflection:</strong>
                      Consider your work and performance from this fiscal year.
                      Comment about your accomplishments and challenges. If you
                      wish, you may list your goals from this year and comment
                      on each goal. If you have at least one direct report,
                      comment on how you met or worked towards the
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
                          v-for="(question, index) in midYearCheckingQuestions"
                          :key="index"
                        >
                          <b-td style="width: 1%">
                            {{ index + 1 }}
                          </b-td>
                          <b-td style="width: 30%">
                            {{ question.sa_comment }}
                          </b-td>
                          <b-td style="width: 70%">
                            <div class="form-group">
                              <textarea
                                type="text"
                                rows="4"
                                class="form-control"
                                v-model="question.eyr_reflection"
                              />
                            </div>
                          </b-td>
                        </b-tr>
                      </b-tbody>
                    </b-table-simple>
                  </div>
                  <div class="mt-5">
                    <p>
                      <strong class="font-size-14 mb-0">Strength:</strong> Think
                      about your achievements and identify an area of strength
                      that you have observed in yourself. An example of a
                      strength may be a task or process that comes easily to
                      you, and something that excites/motivates you.
                    </p>
                    <div class="form-group">
                      <textarea
                        type="text"
                        rows="4"
                        class="form-control"
                        v-model="eyr_strength"
                      />
                    </div>
                  </div>
                  <div class="mt-5">
                    <p>
                      <strong class="font-size-14 mb-0">Growth Area:</strong>
                      Identify a growth area you wish to focus on in the next 6
                      months. This may be a task or process you find
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
                            />
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="row">
                    <div class="col-lg-12">
                      <b-button
                        v-if="!submitting"
                        class="btn btn-success btn-block mt-4"
                        type="submit"
                      >
                        Submit
                      </b-button>
                      <b-button
                        v-else
                        disabled
                        class="btn btn-success btn-block mt-4"
                        type="submit"
                      >
                        Submitting...
                      </b-button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="col-12">
        <div class="alert alert-info">
          The end of year review period is currently closed.
        </div>
      </div>
    </div>
  </Layout>
</template>
