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
      authuser:null,
      texts: [{ id: 0, goal: null }],
      assessStatus:0,
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
      const url = `${this.ROUTES.selfAssessment}/get-self-assessments/${this.empId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {

          this.assessments = [];
          this.assessStatus = data[0].sa_status;
          data.forEach(async (datum) => {
            this.gsID = datum.sa_gs_id;
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
          //console.log(this.assessments);
        }
      });
    },
    async getSelfAssessmentMaster(){
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
    processAssessment(){

      const employeeID = this.$route.params.empid;
      const gsId = this.gsID;
      const url = `${this.ROUTES.selfAssessment}/approve-assessment/${employeeID}/${gsId}`;
      const data = {
        gs_id: gsId,
        emp_id:employeeID,
        //supervisor:this.getEmployee.emp_id
      };
      this.apiPost(url, data, "Could not process request").then(() => {
        this.apiResponseHandler("Process Complete", "Employee self-assessment completed.");

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
        @click="$router.push({ name: 'assess-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Assess Employees
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div v-if="openGoalActivity === 1">
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">Beginning of the Year</h5>
                </div>
                <form
                  v-if="assessments.length > 0"
                  @submit.prevent="updateGoals"
                >
                  <div
                    class="row"
                    v-for="(field, index) in assessments"
                    :key="index"
                  >
                    <div class="col-lg-12">
                      <div class="row">
                        <div class="col-12">
                          <div class="form-group">
                            <label for="goal">
                              Goal {{ index + 1 }}
                              <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              :readonly="assessStatus === 1 ? true : false"
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
                    <div class="col-lg-12">
                      <b-form-group>
                        <b-button
                          v-if="!submitting"
                          class="btn btn-success btn-block mt-4"
                          type="submit"
                          :disabled="assessStatus === 1 ? true : false"
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
                      </b-form-group>
                    </div>
                    <!--                    <div class="col-lg-4">-->
                    <!--                      <b-form-group>-->
                    <!--                        <b-button class="btn btn-warning btn-block mt-4">-->
                    <!--                          Approve-->
                    <!--                        </b-button>-->
                    <!--                      </b-form-group>-->
                    <!--                    </div>-->
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

            <div class="card" v-if="authuser === currentEmployee.emp_supervisor_id">
              <div class="card-body">
                <form @submit.prevent="processAssessment">
                  <div class="btn-group d-flex ">
                    <button class="btn btn-success btn-sm" :disabled="assessStatus === 1 ? true : false"> <i class="mdi mdi-check mr-2"></i> Approve </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div v-else-if="openGoalActivity === 2">
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">Mid Year Checking</h5>
                </div>
                <form
                  v-if="assessments.length > 0"
                  @submit.prevent="updateGoals"
                >
                  <div
                    class="row"
                    v-for="(field, index) in assessments"
                    :key="index"
                  >
                    <div class="col-lg-12">
                      <div class="row">
                        <div class="col-12">
                          <div class="form-group">
                            <label for="goal">
                              Goal {{ index + 1 }}
                              <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              v-model="field.goal"
                              :disabled="assessStatus === 1 ? true : false"
                              class="form-control"
                              :class="{
                                'is-invalid': submitted && $v.goal.$error,
                              }"
                            />
                          </div>
                          <div class="form-group " style="margin-left: 30px;">
                            <label for="goal">
                              Update <label for="" class="badge badge-danger">{{ index + 1 }}</label> <span class="text-danger">*</span>
                            </label>
                            <div class="form-check">
                              <input class="form-check-input" v-model="field.update" checked value="1" type="radio" :disabled="assessStatus === 1 ? true : false" >
                              <label class="form-check-label" >
                                Complete
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" id="on-track" v-model="field.update" value="2" type="radio" :disabled="assessStatus === 1 ? true : false" >
                              <label class="form-check-label" >
                                On track
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" id="delayed" v-model="field.update" value="3" type="radio" :disabled="assessStatus === 1 ? true : false" >
                              <label class="form-check-label" >
                                Delayed
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" v-model="field.update" value="4" type="radio" :disabled="assessStatus === 1 ? true : false" >
                              <label class="form-check-label" >
                                Not started
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" v-model="field.update" value="5" type="radio" :disabled="assessStatus === 1 ? true : false" >
                              <label class="form-check-label" >
                                No longer relevant
                              </label>
                            </div>
                          </div>
                          <div class="form-group " style="margin-left: 30px;">
                            <label for="goal">
                              Challenge <label for="" class="badge badge-danger">{{ index + 1 }}</label> <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              :disabled="assessStatus === 1 ? true : false"
                              v-model="field.challenge"
                              placeholder="Challenge"
                              class="form-control"
                              :class="{
                        'is-invalid': submitted && $v.challenge.$error,
                      }"
                            />
                          </div>
                          <div class="form-group " style="margin-left: 30px;">
                            <label for="goal">
                              Accomplishment <label for="" class="badge badge-danger">{{ index + 1 }}</label> <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              :disabled="assessStatus === 1 ? true : false"
                              v-model="field.accomplishment"
                              placeholder="Accomplishment"
                              class="form-control"
                              :class="{
                        'is-invalid': submitted && $v.accomplishment.$error,
                      }"
                            />
                          </div>
                          <div class="form-group " style="margin-left: 30px;">
                            <label for="goal">
                              Support Needed <label for="" class="badge badge-danger">{{ index + 1 }}</label> <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              :disabled="assessStatus === 1 ? true : false"
                              v-model="field.support"
                              class="form-control"
                              placeholder="Support needed"
                              :class="{
                        'is-invalid': submitted && $v.support.$error,
                      }"
                            />
                          </div>
                          <div class="form-group " style="margin-left: 30px;">
                            <label for="goal">
                              Next Step <label for="" class="badge badge-danger">{{ index + 1 }}</label> <span class="text-danger">*</span>
                            </label>
                            <b-form-textarea
                              id="eya_question"
                              no-resize
                              rows="3"
                              :disabled="assessStatus === 1 ? true : false"
                              v-model="field.next_step"
                              class="form-control"
                              placeholder="Next step"
                              :class="{
                        'is-invalid': submitted && $v.next_step.$error,
                      }"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-12">
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
                    <!--                    <div class="col-lg-4">-->
                    <!--                      <b-form-group>-->
                    <!--                        <b-button class="btn btn-warning btn-block mt-4">-->
                    <!--                          Approve-->
                    <!--                        </b-button>-->
                    <!--                      </b-form-group>-->
                    <!--                    </div>-->
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
                  <p class="mb-0">T6 Code </p>
                  <p class="mb-0">{{ currentEmployee.location.l_t6_code }}</p>
                </div>
              </div>
            </div>
            <div class="card" v-if="authuser === currentEmployee.emp_supervisor_id">
              <div class="card-body">
                <form @submit.prevent="processAssessment">
                  <div class="btn-group d-flex ">
                    <button class="btn btn-success btn-sm" :disabled="assessStatus === 1 ? true : false"> <i class="mdi mdi-check mr-2"></i> Approve </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="openGoalActivity === 3" class="col-lg-12">
        <div class="row">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-body">
                <div class="p-3 bg-light mb-4">
                  <h5 class="font-size-14 mb-0">End Of Year Assessment</h5>
                </div>
                <b-table-simple responsive bordered>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>Goals & End of Year Questions</b-th>
                      <b-th>Responses</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr
                      v-for="(field, index) in endYearAssessments"
                      :key="index"
                    >
                      <b-td> {{ field.goal }} </b-td>
                      <b-td> {{ field.response }} </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
            <div class="card mt-3">
              <div v-if="parseInt(ratingStatus) === 0">
                <div class="row">
                  <div class="col-lg-12">
                    <div class="card-body">
                      <div class="p-3 bg-light mb-4">
                        <h5 class="font-size-14 mb-0">Grading Rubric</h5>
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
                      <form @submit.prevent="update">
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
                          class="btn btn-block btn-success mt-4"
                          type="submit"
                        >
                          Update
                        </b-button>
                        <b-button
                          v-else
                          disabled
                          class="btn btn-block btn-success mt-4"
                          type="submit"
                        >
                          Updating...
                        </b-button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="row">
                  <div class="col-lg-12">
                    <div class="card-body">
                      <div class="p-3 bg-light mb-4">
                        <h5 class="font-size-14 mb-0">Grading Rubric</h5>
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
                      <div class="col-lg-12">
                        <form @submit.prevent="update">
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
                        </form>
                      </div>
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
                  <p>{{ currentEmployee.JobRole.Department.d_t3_code }}</p>
                </div>
                <div class="d-flex justify-content-between">
                  <p class="mb-0">T6 Code</p>
                  <p class="mb-0">{{ currentEmployee.location.l_t6_code }}</p>
                </div>
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
