<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
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
  mounted() {
    this.getOpenGoalSetting();
    this.prefillAssessment();
    this.getSelfAssessment();
    this.finalAssessment();
    this.getRatings();
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
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      const url = await this.apiGet(urls).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          return `${this.ROUTES.selfAssessment}/get-self-assessment/${
            this.getEmployee.emp_id
          }/${parseInt(data[0].gs_id)}`;
        }
      });
      if (url) {
        await this.apiGet(url).then((res) => {
          const { data } = res;
          if (data) {
            this.assessments = [];

            data.forEach(async (datum) => {
              this.selfAssessmentStatus = true;
              this.prefillStatus = true;
              const dat = {
                id: datum.sa_id,
                goal: datum.sa_comment,
                status: datum.sa_status,
              };

              this.assessments.push(dat);
            });
          }
        });
      }
    },

    async prefillAssessment() {
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      const url = await this.apiGet(urls).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          return `${this.ROUTES.selfAssessment}/prefill-self-assessment/${
            this.getEmployee.emp_id
          }/${parseInt(data[0].gs_id)}`;
        }
      });
      if (url) {
        await this.apiGet(url, "Get Prefilled Assessments Error").then(
          (res) => {
            const { data } = res;
            if (data) {
              const questions = data.questions;
              this.prefillAssessments = [];
              questions.forEach(async (datum) => {
                this.prefillStatus = false;
                const dat = {
                  id: datum.sa_id,
                  goal: datum.sa_comment,
                  response: datum.sa_response,
                  status: datum.sa_status,
                };

                this.prefillAssessments.push(dat);
              });
            }
          }
        );
      }
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
        console.log("goals", this.goals);
      });
      this.apiPatch(url, this.goals, "Update goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Updated");
        this.getSelfAssessment();
      });
    },

    respond() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/respond-self-assessment/${employeeID}`;
      this.goals = [];
      this.prefillAssessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_response: field.response,
          sa_status: 1,
        };

        this.goals.push(data);
      });
      this.apiPatch(url, this.goals, "Update goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Updated");
        this.$router.push({
          name: "self-assessment",
        });
      });

      this.prefillAssessment();
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
        v-if="openGoalActivity === 3 && parseInt(checkOpenGoal) === 1"
        class="col-lg-12"
      >
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">End of Year Checking</h5>
            </div>

            <div v-if="!prefillStatus">
              <div v-if="parseInt(finalAssessmentStatus) === 1">
                <div
                  class="row"
                  v-for="(field, index) in prefillAssessments"
                  :key="index"
                >
                  <div class="col-lg-12">
                    <div class="row">
                      <div class="col-6">
                        <div class="form-group">
                          <div>
                            <b-card title="Questions">
                              <br />
                              <b-card-text>
                                {{ field.goal }}
                              </b-card-text>
                            </b-card>
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="form-group">
                          <div>
                            <b-card title="Response">
                              <br />
                              <b-card-text>
                                {{ field.response }}
                              </b-card-text>
                            </b-card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-12">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Grading Rubric</h5>
                    </div>
                  </div>

                  <b-card
                    v-for="(field, index) in ratings"
                    :key="index"
                    :title="field.text"
                  >
                    <br />
                    <b-card-text>
                      {{ field.desc }}
                    </b-card-text>
                  </b-card>
                </div>

                <div class="row">
                  <form @submit.prevent="update">
                    <div class="col-lg-12">
                      <b-form-group>
                        <label>Overall Rating </label><br />

                        <b-form-radio-group
                          id="user_type"
                          v-model="employeeRating"
                          :options="ratingsArray"
                          readonly
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                  </form>
                </div>
              </div>

              <div v-if="parseInt(finalAssessmentStatus) === 0">
                <form @submit.prevent="respond">
                  <div
                    class="row"
                    v-for="(field, index) in prefillAssessments"
                    :key="index"
                  >
                    <div class="col-lg-12">
                      <div class="row">
                        <div class="col-4">
                          <div class="form-group">
                            <label for="goal">
                              Question <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              disabled
                              v-model="field.goal"
                              class="form-control"
                              :class="{
                                'is-invalid': submitted && $v.goal.$error,
                              }"
                            />
                          </div>
                        </div>

                        <div class="col-4">
                          <div class="form-group">
                            <label for="goal">
                              Response <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              v-model="field.response"
                              class="form-control"
                              :class="{
                                'is-invalid': submitted && $v.goal.$error,
                              }"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-lg-8">
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
          The mid-year checking review period is currently closed.
        </div>
      </div>
    </div>
  </Layout>
</template>
