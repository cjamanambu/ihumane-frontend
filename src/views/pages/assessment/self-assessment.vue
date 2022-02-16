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
  beforeMount() {
    this.getOpenGoalSetting();
  },
  mounted() {
    this.getOpenGoalSetting();
    this.prefillAssessment();
    this.getSelfAssessment();
    this.finalAssessment();
    this.getRatings();
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
      texts: [{ id: 0, goal: null }],
      endYearQuestions: [],
      openGoalActivity: null,
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
      });

      this.getSelfAssessment();
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
      });
      this.apiPatch(url, this.goals, "Update goals Error").then(() => {
        this.apiResponseHandler("Process Complete", "Goals Updated");
      });
      this.getSelfAssessment();
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
<style>
.back {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div
        v-if="openGoalActivity === 1 && parseInt(checkOpenGoal) === 1"
        class="col-lg-12"
      >
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Beginning of the Year</h5>
            </div>
            <div v-if="!selfAssessmentStatus">
              <form @submit.prevent="submitNewBeginning">
                <div class="row" v-for="(field, index) in texts" :key="index">
                  <div class="col-10">
                    <div class="form-group">
                      <label for="goal">
                        Question <span class="text-danger">*</span>
                      </label>
                      <b-form-textarea
                        id="eya_question"
                        no-resize
                        rows="3"
                        type="date"
                        v-model="field.goal"
                        class="form-control"
                        :class="{
                          'is-invalid': submitted && $v.goal.$error,
                        }"
                      />
                    </div>
                  </div>
                  <div class="col-2">
                    <div v-if="index > 0" class="form-group">
                      <label style="visibility: hidden">hidden</label><br />
                      <button
                        type="button"
                        class="btn btn-danger"
                        @click="delField(index)"
                      >
                        DEL
                      </button>
                    </div>
                    <div v-else class="form-group">
                      <label style="visibility: hidden">hidden</label><br />
                      <button
                        type="button"
                        class="btn btn-success"
                        @click="addField"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
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

            <div v-else>
              <form @submit.prevent="update">
                <div
                  class="row"
                  v-for="(field, index) in assessments"
                  :key="index"
                >
                  <div v-if="field.status === 0" class="col-lg-12">
                    <div class="row">
                      <div class="col-9">
                        <div class="form-group">
                          <label for="goal">
                            Question <span class="text-danger">*</span>
                          </label>
                          <b-form-textarea
                            id="eya_question"
                            type="date"
                            v-model="field.goal"
                            class="form-control"
                            :class="{
                              'is-invalid': submitted && $v.goal.$error,
                            }"
                          />
                        </div>
                      </div>

                      <div class="col-3">
                        <div class="form-group">
                          <div v-if="index > 0" class="form-group">
                            <label style="visibility: hidden">hidden</label>
                            <button
                              type="button"
                              class="btn btn-danger"
                              @click="delAssessment(index)"
                            >
                              DEL
                            </button>
                          </div>
                          <div v-else class="form-group">
                            <label style="visibility: hidden">hidden</label>
                            <button
                              type="button"
                              class="btn btn-success"
                              @click="addAssessment"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="col-lg-12">
                    <div class="row">
                      <div class="col-9">
                        <div class="form-group">
                          <label for="goal">
                            Question <span class="text-danger">*</span>
                          </label>
                          <b-form-textarea
                            id="eya_question"
                            type="date"
                            disabled
                            v-model="field.goal"
                            class="form-control"
                            :class="{
                              'is-invalid': submitted && $v.goal.$error,
                            }"
                          />
                        </div>
                      </div>
                      <div class="col-3">
                        <i> Reviewed By Supervisor </i>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-lg-9">
                    <b-button
                      v-if="!submitting"
                      class="btn btn-success btn-block mt-4"
                      type="submit"
                    >
                      Update
                    </b-button>
                    <b-button
                      v-else
                      disabled
                      class="btn btn-success btn-block mt-4"
                      type="submit"
                    >
                      Updating...
                    </b-button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="openGoalActivity === 2 && parseInt(checkOpenGoal) === 1"
        class="col-lg-12"
      >
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Mid Year Checking</h5>
            </div>

            <div v-if="!prefillStatus">
              <form @submit.prevent="submitNew">
                <div
                  class="row"
                  v-for="(field, index) in prefillAssessments"
                  :key="index"
                >
                  <div class="col-lg-12">
                    <div class="row">
                      <div class="col-9">
                        <div class="form-group">
                          <label for="goal">
                            Question <span class="text-danger">*</span>
                          </label>
                          <b-form-textarea
                            id="eya_question"
                            type="date"
                            v-model="field.goal"
                            class="form-control"
                            :class="{
                              'is-invalid': submitted && $v.goal.$error,
                            }"
                          />
                        </div>
                      </div>

                      <div class="col-3">
                        <div class="form-group">
                          <div v-if="index > 0" class="form-group">
                            <label style="visibility: hidden">hidden</label>
                            <button
                              type="button"
                              class="btn btn-danger"
                              @click="delPrefillAssessment(index)"
                            >
                              DEL
                            </button>
                          </div>
                          <div v-else class="form-group">
                            <label style="visibility: hidden">hidden</label>
                            <button
                              type="button"
                              class="btn btn-success"
                              @click="addPrefillAssessment"
                            >
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-lg-9">
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

            <div v-else>
              <form @submit.prevent="update">
                <div
                  class="row"
                  v-for="(field, index) in assessments"
                  :key="index"
                >
                  <div v-if="field.status === 0" class="col-lg-12">
                    <div class="row">
                      <div class="col-9">
                        <div class="form-group">
                          <label for="goal">
                            Question <span class="text-danger">*</span>
                          </label>
                          <b-form-textarea
                            id="eya_question"
                            type="date"
                            v-model="field.goal"
                            class="form-control"
                            :class="{
                              'is-invalid': submitted && $v.goal.$error,
                            }"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="col-lg-12">
                    <div class="row">
                      <div class="col-9">
                        <div class="form-group">
                          <label for="goal">
                            Question <span class="text-danger">*</span>
                          </label>
                          <b-form-textarea
                            id="eya_question"
                            disabled
                            type="date"
                            v-model="field.goal"
                            class="form-control"
                            :class="{
                              'is-invalid': submitted && $v.goal.$error,
                            }"
                          />
                        </div>
                      </div>
                      <div class="col-3">
                        <p>Reviewed By Supervisor</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-lg-9">
                    <b-button
                      v-if="!submitting"
                      class="btn btn-success btn-block mt-4"
                      type="submit"
                    >
                      Update
                    </b-button>
                    <b-button
                      v-else
                      disabled
                      class="btn btn-success btn-block mt-4"
                      type="submit"
                    >
                      Updating...
                    </b-button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="openGoalActivity === 3 && parseInt(checkOpenGoal) === 1"
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
        <div class="alert alert-info">There is no open activity yet.</div>
      </div>
    </div>
  </Layout>
</template>
