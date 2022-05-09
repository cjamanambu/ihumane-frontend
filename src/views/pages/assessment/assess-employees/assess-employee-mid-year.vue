<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Assess Employee (Mid-year)",
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
    this.empId = this.$route.params.empid;
    await this.fetchEmployee();
    await this.getOpenGoalSetting();
    await this.getSelfAssessment();
    await this.getEndYearAssessment();
    await this.getRatings();

    this.authuser = this.getEmployee.emp_id;
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Assess Employee (Mid-year)",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Assess Employee (Mid-year)",
          href: "/assess-employee",
          active: true,
        },
      ],
      authuser: null,
      texts: [
        {
          id: 0,
          goal: "",
          goalEdit: false,
          challenge: "",
          challengeEdit: false,
          accomplishment: "",
          accomplishmentEdit: false,
          support: "",
          supportEdit: false,
          next_step: "",
          nextStepEdit: null,
          update: "",
        },
        {
          id: 1,
          goal: "",
          goalEdit: false,
          challenge: "",
          challengeEdit: false,
          accomplishment: "",
          accomplishmentEdit: false,
          support: "",
          supportEdit: false,
          next_step: "",
          nextStepEdit: null,
          update: "",
        },
        {
          id: 2,
          goal: "",
          goalEdit: false,
          challenge: "",
          challengeEdit: false,
          accomplishment: "",
          accomplishmentEdit: false,
          support: "",
          supportEdit: false,
          next_step: "",
          nextStepEdit: null,
          update: "",
        },
      ],
      assessStatus: 0,
      //supervisor:null,
      year: null,
      endYearQuestions: [],
      openGoalActivity: null,
      openGoalActivityId: null,
      activeGoalId: null,
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
      optional: null,
      sam_discussion_held_on: null,
      selfAssessmentGoals: [],
      endYearAssessments: [],
      assessments: [],
      prefillAssessments: [],
      empId: this.$route.params.empid,
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
      this.masterId = this.$route.params.masterId;

      const url = `${this.ROUTES.selfAssessment}/get-self-assessment-by-master/${this.masterId}`;
      //const url = `${this.ROUTES.selfAssessment}/get-self-assessment/${this.getEmployee.emp_id}/${this.gsID}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        console.log({ data });
        if (data.question.length > 0) {
          this.texts = [];
          // this.gsID = data.openGoal[0].gs_id;
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
        } else {
          const prevUrl = `${this.ROUTES.selfAssessment}/prefill-goal-setting/${this.getEmployee.emp_id}`;
          this.apiGet(prevUrl).then((res) => {
            const { data } = res;
            console.log({ data });
            this.texts = [];
            this.gsID = parseInt(data[0].sa_gs_id);
            this.assessStatus = 0; //data[0].sa_status;
            data.forEach(async (datum) => {
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
          });

          this.newAssessment = true;
          this.texts = [
            { id: 0, goal: null },
            { id: 1, goal: null },
            { id: 2, goal: null },
          ];
        }
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
    async getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.activeGoalId = parseInt(data[0].gs_id);
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityId = parseInt(data[0].gs_id);
        }
      });
    },
    submitMidYearChecking() {
      const employeeID = this.empId;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment-mid-year/${employeeID}/${this.openGoalActivityId}`;
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
          sa_challenges: field.challenge,
          sa_accomplishment: field.accomplishment,
          sa_support_needed: field.support,
          sa_next_steps: field.next_step,
          sa_update: field.update,
          optional: this.optional,
          sam_discussion_held_on: this.sam_discussion_held_on,
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
    submitNewBeginning() {
      const employeeID = this.empId;
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
      };
      this.apiPost(url, data, "Could not process request").then(() => {
        this.apiResponseHandler(
          "Process Complete",
          "Employee self-assessment completed."
        );
        //this.$router.push("/assess-employees");
        location.reload();
      });
    },
    async fetchEmployee() {
      const employeeID = this.$route.params.empid;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      await this.apiGet(url, "Get Employee Error").then((res) => {
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
    <div v-else>
      <div>
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Mid-Year Checking</h5>
              </div>
              <div class="card-body">
                <form
                  v-if="texts.length > 0"
                  @submit.prevent="submitMidYearChecking"
                >
                  <b-table-simple hover responsive bordered outlined>
                    <b-thead head-variant="dark">
                      <b-tr>
                        <b-th>S/n</b-th>
                        <b-th>Goal/Project</b-th>
                        <b-th>Update</b-th>
                        <b-th>Accomplishments</b-th>
                        <b-th>Challenges</b-th>
                        <b-th>Support Needed</b-th>
                        <b-th>Next Steps </b-th>
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
                                :disabled="assessStatus === 1 ? true : false"
                                :checked="field.update === 'Complete'"
                              />
                              <label class="form-check-label"> Complete </label>
                            </div>
                            <div class="form-check">
                              <input
                                class="form-check-input"
                                id="complete"
                                v-model="field.update"
                                value="On track"
                                :checked="field.update === 'On track'"
                                :disabled="assessStatus === 1 ? true : false"
                                type="radio"
                                :name="index"
                              />
                              <label class="form-check-label"> On track </label>
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
                                :disabled="assessStatus === 1 ? true : false"
                              />
                              <label class="form-check-label"> Delayed </label>
                            </div>
                            <div class="form-check">
                              <input
                                class="form-check-input"
                                v-model="field.update"
                                value="Not started"
                                type="radio"
                                :name="index"
                                :checked="field.update"
                                :disabled="assessStatus === 1 ? true : false"
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
                                :checked="field.update === 'No longer relevant'"
                                :disabled="assessStatus === 1"
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
                            style="display: none"
                          >
                            DEL
                          </button>
                        </b-td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                  <div
                    class="alert alert-info d-flex mt-3"
                    v-if="assessStatus !== 1"
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
                  <div class="row">
                    <div class="col-12">
                      <b-button
                        v-if="!submitting"
                        class="btn btn-success btn-block mt-4"
                        type="submit"
                        :disabled="assessStatus === 1"
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
              <div class="card-body" v-if="currentEmployee">
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
            <div
              class="card"
              v-if="
                currentEmployee &&
                authuser === currentEmployee.emp_supervisor_id
              "
            >
              <div class="card-body">
                <form @submit.prevent="processAssessment">
                  <div class="btn-group d-flex">
                    <button
                      class="btn btn-success btn-sm"
                      :disabled="assessStatus === 1"
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
    </div>
  </Layout>
</template>
