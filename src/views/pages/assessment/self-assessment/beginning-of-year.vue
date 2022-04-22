<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Beginning of Year Assessment",
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
    this.getSelfAssessment();
  },
  data() {
    return {
      title: "Beginning of Year Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Beginning of Year Assessment",
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
      newAssessment: false,
      assessStatus:0,
      gsID: null,
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
    async getSelfAssessment() {
      const url = `${this.ROUTES.selfAssessment}/get-self-assessments/${this.getEmployee.emp_id}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.questions.length) {
          this.texts = [];
          this.gsID = data.openGoal[0].gs_id;
          this.assessStatus = data.questions[0].sa_status;
          data.questions.forEach(async (datum) => {
            this.selfAssessmentStatus = true;
            this.prefillStatus = true;
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              status: datum.sa_status,
            };
            this.texts.push(dat);
          });
        } else {
          this.newAssessment = true;
          this.texts = [
            { id: 0, goal: null },
            { id: 1, goal: null },
            { id: 2, goal: null },
          ];
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
          this.openGoalActivityFrom = data[0].gs_from;
          this.openGoalActivityTo = data[0].gs_to;
          this.openGoalActivityYear = data[0].gs_year;
          this.checkOpenGoal = 1;
        }
      });
    },
    submitNewBeginning() {
      const employeeID = this.getEmployee.emp_id;
      //console.log("EmpID: "+employeeID);
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.openGoalActivityId}`;
      this.goals = [];
      let validForm = true;
      this.texts.every(async (field) => {
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
        this.apiPost(url, this.goals, "Add goals Error").then(() => {
          this.apiResponseHandler("Process Complete", "Goals Added");
          this.getSelfAssessment();
        });
      }
    },
    updateBeginning() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/update-assessment/${employeeID}/${this.gsID}`;
      this.goals = [];
      let validForm = true;
      this.texts.every(async (field) => {
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
        this.apiPatch(url, this.goals, "Add goals Error").then(() => {
          this.apiResponseHandler("Process Complete", "Goals Added");
          this.getSelfAssessment();
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
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'self-assessment' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Self Assessment
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div
        v-if="openGoalActivity === 1 && parseInt(checkOpenGoal) === 1"
        class="col-lg-12"
      >
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Goal Setting Form </h5>
            </div>
            <div class="mb-3">
              <h5 class="mb-2">
                Beginning of Year: {{ openGoalActivityYear }}
              </h5>
              <h5 class="mb-1">
                Review Period:
                {{ new Date(openGoalActivityFrom).toDateString() }} -
                {{ new Date(openGoalActivityTo).toDateString() }}
              </h5>
              <p class="mt-3">
                Work with your manager to discuss and agree on at least
                <strong>3</strong> goals for your work over this review period.
              </p>
              <p>
                Try to write at least 2-3 performance goals, focused on your key
                areas of responsibility. Then, write 1 goal about an area of
                growth/development. To create a development goal, consider a
                strength you would like to get even better in, or a challenging
                area you wish to improve in.
              </p>
              <p>
                Your goals should be SMART (specific, measurable, actionable,
                realistic, timebound). For tips on creating SMART goals,
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
            <form v-if="newAssessment" @submit.prevent="submitNewBeginning">
              <div class="row" v-for="(field, index) in texts" :key="index">
                <div class="col">
                  <div class="form-group">
                    <label for="goal">
                      Goal {{ index + 1 }} {{ assessStatus }}<span class="text-danger">* </span>
                    </label>
                    <b-form-textarea
                      id="eya_question"
                      no-resize
                      rows="3"
                      v-model="field.goal"
                      :readonly="assessStatus === 1 ? true : false"
                      class="form-control "
                      :class="{
                        'is-invalid': submitted && $v.goal.$error,
                      }"
                    />
                  </div>
                </div>
                <div class="col-1" v-if="index > 2">
                  <div class="form-group">
                    <label style="visibility: hidden">hidden</label><br />
                    <button
                      type="button"
                      class="btn btn-danger btn-block"
                      @click="delField(index)"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>
              <div class="alert alert-info d-flex mt-3">
                <i class="ri-error-warning-line mr-2"></i>
                You must submit a minimum of 3 goals.
                <span style="cursor: pointer" class="ml-1" @click="addField">
                  Click here to add a new goal
                </span>
              </div>
              <div class="row">
                <div class="col-12">
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
            <form v-else @submit.prevent="updateBeginning">
              <div class="row" v-for="(field, index) in texts" :key="index">
                <div class="col">
                  <div class="form-group">
                    <label for="goal">
                      Goal {{ index + 1 }} <span class="text-danger">*</span>
                    </label>
                    <b-form-textarea
                      id="eya_question"
                      no-resize
                      rows="3"
                      v-model="field.goal"
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.goal.$error,
                      }"
                    />
                  </div>
                </div>
                <div class="col-1" v-if="index > 2">
                  <div class="form-group">
                    <label style="visibility: hidden">hidden</label><br />
                    <button
                      type="button"
                      class="btn btn-danger btn-block"
                      @click="delField(index)"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>
              <div class="alert alert-info d-flex mt-3">
                <i class="ri-error-warning-line mr-2"></i>
                You must submit a minimum of 3 goals.
                <span style="cursor: pointer" class="ml-1" @click="addField">
                  Click here to add a new goal
                </span>
              </div>
              <div class="row">
                <div class="col-12">
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
      <div v-else class="col-12">
        <div class="alert alert-info">
          The beginning of year review period is currently closed.
        </div>
      </div>

    </div>
  </Layout>
</template>
