<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
export default {
  page: {
    title: "Assess Employee (End of Year)",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  async mounted() {
    this.empId = this.$route.params.empid;
    this.fetchEmployee();
    await this.getOpenGoalSetting();
    await this.prefillAssessment();
    await this.getEndYearRatings();
  },
  validations: {
    strength: { required },
    growth_area: { required },
    selectedRating: { required },
  },
  data() {
    return {
      title: "Assess Employee (End of Year)",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Assess Employee (End of Year)",
          active: true,
        },
      ],
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
      currentEmployee: null,
      goalMasterId: null,
      ratings: [],
      selectedRating: null,
      approved: 0,
      strength: null,
      growth_area: null,
      additional_comment: null,
      gsId: null,
      status: 0,
    };
  },
  methods: {
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
    async getRating() {
      const url = `${this.ROUTES.rating}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        console.log(data);
      });
    },
    async prefillAssessment() {
      let url = `${this.ROUTES.endYearResponse}/get-end-year/${this.empId}/${this.openGoalActivityId}`;
      this.apiGet(url).then(async (res) => {
        const { data } = res;
        this.gsId = data[0].eyr_gs_id;
        this.goalMasterId = data[0].eyr_master_id;
        await this.getSupervisorEndYearResponse();
        if (data.length) {
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
    async getEndYearRatings() {
      let url = `${this.ROUTES.rating}/get-end-year-ratings`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.ratings = data;
      });
    },
    fetchEmployee() {
      const employeeID = this.$route.params.empid;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        this.currentEmployee = res.data;
      });
    },
    selectRating(rating) {
      this.selectedRating = rating;
    },
    async getSupervisorEndYearResponse() {
      const url = `${this.ROUTES.endYearResponse}/supervisor-end-year-response/${this.goalMasterId}`;
      this.apiGet(url, "Get Supervisor End Year Response Error").then((res) => {
        const { data } = res;
        let endYearResponse = data[0];
        this.strength = endYearResponse.eysr_strength;
        this.growth_area = endYearResponse.eysr_growth;
        this.selectedRating = endYearResponse.rating?.rating_id;
        this.additional_comment = endYearResponse.eysr_additional_comment;
        this.status = endYearResponse.eysr_status;
      });
    },
    submitManagerEvaluation() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Submission...");
      } else {
        const employeeID = this.$route.params.empid;
        const gsId = this.gsId;
        const data = {
          strength: this.strength,
          growth_area: this.growth_area,
          rating: this.selectedRating.toString(),
          master: this.goalMasterId,
          additional_comment: this.additional_comment,
          approve: this.approved,
          employee: employeeID,
          gsId: gsId,
          supervisor: this.getEmployee.emp_id,
        };
        const url = `${this.ROUTES.endYearResponse}/supervisor-end-year-response`;
        this.apiPost(url, data, " Error submitting response").then(() => {
          this.apiResponseHandler(
            `Supervisor Response Submitted`,
            "Action Successful"
          );
          this.$v.$reset();
          this.getSupervisorEndYearResponse();
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
        @click="$router.push({ name: 'assess-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Assess Employees
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-lg-6">
        <div v-if="currentEmployee" class="card mb-4 bg-light">
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
        <div class="card bg-light">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Employee Reflection</h5>
            </div>
            <div>
              <p>
                <strong class="font-size-14 mb-0">Reflection:</strong>
                Consider your work and performance from this fiscal year.
                Comment about your accomplishments and challenges. If you wish,
                you may list your goals from this year and comment on each goal.
                If you have at least one direct report, comment on how you met
                or worked towards the
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
                <strong class="font-size-14 mb-0">Strength:</strong> Think about
                your achievements and identify an area of strength that you have
                observed in yourself. An example of a strength may be a task or
                process that comes easily to you, and something that
                excites/motivates you.
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
                months. This may be a task or process you find particularly
                challenging, or something you need to learn more about to excel
                in your role.
                <br />
                Suggest 1-2 steps you can take to begin working on this growth
                area.
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
      <div class="col-lg-6">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Manager Evaluation</h5>
            </div>
            <div>
              <p>
                Consider this direct report’s work and performance from this
                fiscal year and respond to the questions below. If your employee
                is a people manager, comment about how they met or worked
                towards the
                <a
                  href="https://rescue.app.box.com/s/w9mny3pek9xb0b2hwtz7uqxzlneh7nha"
                  target="_blank"
                >
                  People Manager Standards
                </a>
                this past year. <br />
                Be specific about times the employee exceeded expectations, if
                applicable. Make note of any specific performance concerns
                and/or areas they should focus on in the year ahead.
              </p>
            </div>
            <form @submit.prevent="submitManagerEvaluation">
              <div class="mt-5">
                <p>
                  <strong class="font-size-14 mb-0"
                    >Strength (required):</strong
                  >
                  Think about this employee’s achievements and identify an area
                  of strength that you have observed in them. An example of a
                  strength may be a task or process that comes easily to your
                  employee, and something that excites/motivates them.
                </p>
                <div class="form-group">
                  <textarea
                    v-model="strength"
                    type="text"
                    rows="4"
                    class="form-control"
                    :readonly="status === 1"
                  />
                </div>
              </div>
              <div class="mt-5">
                <p>
                  <strong class="font-size-14 mb-0">
                    Growth Area (required):
                  </strong>
                  Identify an area of growth you wish this employee to focus on
                  in the next 6 months. This may be a task or process your
                  employee finds particularly challenging, or something they
                  need to learn more about in order to excel in their role.
                </p>
                <div class="form-group">
                  <textarea
                    v-model="growth_area"
                    type="text"
                    rows="4"
                    class="form-control"
                    :readonly="status === 1"
                  />
                </div>
              </div>
              <div class="mt-5">
                <strong class="font-size-14 mb-0">
                  Select a rating for this employee (required):
                </strong>
                <b-list-group class="mt-3">
                  <b-list-group-item
                    v-for="(rating, index) in ratings"
                    :key="index"
                    href="#"
                    class="d-flex"
                    :active="selectedRating === rating.rating_id"
                    @click="selectRating(rating.rating_id)"
                    variant="secondary"
                  >
                    <div class="ml-1 mr-5 w-25 d-flex align-items-center">
                      {{ rating.rating_name }}
                    </div>
                    <div class="w-75">{{ rating.rating_desc }}</div>
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
                    v-model="additional_comment"
                    type="text"
                    rows="4"
                    class="form-control"
                    :readonly="status === 1"
                  />
                </div>
              </div>
              <div v-if="status !== 1">
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="approved"
                  name="checkbox-1"
                  :value="1"
                  :unchecked-value="0"
                >
                  Mark as approved
                </b-form-checkbox>

                <div class="form-group mt-3">
                  <button class="btn btn-success btn-block">Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
