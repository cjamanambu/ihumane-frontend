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
    async prefillAssessment() {
      let url = `${this.ROUTES.endYearResponse}/get-end-year/${this.empId}/${this.openGoalActivityId}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
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
        <i class="mdi mdi-skip-backward mr-2"></i>
        Self Assessment
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="card">
      <div class="card-body">
        <div class="p-3 bg-light mb-4">
          <h5 class="font-size-14 mb-0">Employee Reflection</h5>
        </div>
        <div>
          <p>
            <strong class="font-size-14 mb-0">Reflection:</strong>
            Consider your work and performance from this fiscal year. Comment
            about your accomplishments and challenges. If you wish, you may list
            your goals from this year and comment on each goal. If you have at
            least one direct report, comment on how you met or worked towards
            the
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
            Identify a growth area you wish to focus on in the next 6 months.
            This may be a task or process you find particularly challenging, or
            something you need to learn more about to excel in your role.
            <br />
            Suggest 1-2 steps you can take to begin working on this growth area.
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
              class="mb-3 w-75"
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
  </Layout>
</template>
