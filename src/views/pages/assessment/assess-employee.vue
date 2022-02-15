<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Assess Employee",
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
    this.getOpenGoalSetting();
    this.getSelfAssessment();
    this.getEndYearAssessment();
    this.getRatings();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Assess Employee",
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
      texts: [{ id: 0, goal: null }],
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
      statuses: [
        { text: "CLOSE", value: 1 },
        { text: "OPEN", value: 0 },
      ],
      // statues: [{ value: 0, text: "Open" }, { value: 1, text: "Closed" }],
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
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(urls).then(async (res) => {
        const { data } = res;
        if (data.length > 0) {
          const url = `${this.ROUTES.selfAssessment}/get-self-assessment/${
            this.empId
          }/${parseInt(data[0].gs_id)}`;
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
                };
                this.assessments.push(dat);
              });
            }
          });
        }
      });
    },
    async getEndYearAssessment() {
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(urls).then(async (res) => {
        const { data } = res;
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
        @click="$router.push({ name: 'assess-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Assess Employees
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div v-if="openGoalActivity === 1" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Beginning of the Year</h5>
            </div>
            <form @submit.prevent="update">
              <div
                class="row"
                v-for="(field, index) in assessments"
                :key="index"
              >
                <div class="col-lg-12" v-if="field.status === 0">
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
                      <b-form-group>
                        <label>Status</label><br />
                        <!--                      <b-form-select-->
                        <!--                          id="location"-->
                        <!--                          v-model="field.status"-->
                        <!--                          :options="statues"-->
                        <!--                          :class="{-->
                        <!--              'is-invalid': submitted && $v.location.$error,-->
                        <!--            }"-->
                        <!--                      />-->
                        <b-form-radio-group
                          id="user_type"
                          v-model="field.status"
                          :options="statuses"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                  </div>
                </div>
                <div class="col-lg-12" v-else>
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
      <div v-else-if="openGoalActivity === 2" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Mid Year Checking</h5>
            </div>
            <form @submit.prevent="update">
              <div
                class="row"
                v-for="(field, index) in assessments"
                :key="index"
              >
                <div class="col-lg-12" v-if="field.status === 0">
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
                      <b-form-group>
                        <label>Status</label><br />
                        <!--                      <b-form-select-->
                        <!--                          id="location"-->
                        <!--                          v-model="field.status"-->
                        <!--                          :options="statues"-->
                        <!--                          :class="{-->
                        <!--              'is-invalid': submitted && $v.location.$error,-->
                        <!--            }"-->
                        <!--                      />-->
                        <b-form-radio-group
                          id="user_type"
                          v-model="field.status"
                          :options="statuses"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                  </div>
                </div>
                <div class="col-lg-12" v-else>
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
      <div v-else-if="openGoalActivity === 3" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">End Of Year Assessment</h5>
            </div>
            <div
              class="row"
              v-for="(field, index) in endYearAssessments"
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
            <div v-if="parseInt(ratingStatus) === 0">
              <div class="row">
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
              </div>
              <div class="row">
                <form @submit.prevent="update">
                  <div class="col-lg-12">
                    <b-form-group>
                      <label>Overall Rating</label><br />
                      <b-form-radio-group
                        id="user_type"
                        v-model="employeeRating"
                        :options="ratingsArray"
                        button-variant="outline-success"
                        buttons
                      />
                    </b-form-group>
                    <b-button
                      v-if="!submitting"
                      class="btn btn-success mt-4"
                      type="submit"
                    >
                      Update
                    </b-button>
                    <b-button
                      v-else
                      disabled
                      class="btn btn-success mt-4"
                      type="submit"
                    >
                      Updating...
                    </b-button>
                  </div>
                </form>
              </div>
            </div>
            <div v-else>
              <div class="row">
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
          </div>
        </div>
      </div>
      <div v-else class="col-lg-12">
        <div class="alert alert-info">
          There is no open activity to assess for this employee yet.
        </div>
      </div>
    </div>
  </Layout>
</template>
