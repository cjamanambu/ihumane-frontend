<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Mid Year Checking Assessment",
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
    await this.getOpenGoalSetting();
    await this.getSelfAssessment();
  },
  data() {
    return {
      title: "Mid Year Checking Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Mid Year Checking Assessment",
          active: true,
        },
      ],
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
      assessStatus:0,
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
      gsID: null,
      activeGoalId:null,
      optional:null,
      sam_discussion_held_on:null,

    };
  },
  methods: {
    addField() {
      this.texts.push({
        id: this.count++,
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
      });
      this.count++;
    },
    delField(index) {
      //console.log(index);
      if (index > 0) {
        this.texts.splice(index, 1);
      }
    },
    async getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.activeGoalId = parseInt(data[0].gs_id);
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityId = parseInt(data[0].gs_id);
          this.openGoalActivityFrom = data[0].gs_from;
          this.openGoalActivityTo = data[0].gs_to;
          this.openGoalActivityYear = data[0].gs_year;
          this.checkOpenGoal = 1;
        }
      });
    },
    async getSelfAssessment() {
      const url = `${this.ROUTES.selfAssessment}/get-self-assessment/${this.getEmployee.emp_id}/${this.activeGoalId}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.questions.length > 0) {
          this.texts = [];
          this.gsID = data.openGoal[0].gs_id;
          this.assessStatus = data.questions[0].sa_status;
          this.optional = data.master?.sam_optional;
          this.sam_discussion_held_on =  new Date(data.master?.sam_discussion_held_on).toISOString().substr(0,10);

          data.questions.forEach(async (datum) => {
            this.selfAssessmentStatus = true;
            this.prefillStatus = true;
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              update: datum.sa_update,
              accomplishment:datum.sa_accomplishment,
              next_step:datum.sa_next_steps,
              challenge:datum.sa_challenges,
              support:datum.sa_support_needed,
            };
            this.texts.push(dat);

          });
        } else {
          const prevUrl = `${this.ROUTES.selfAssessment}/prefill-goal-setting/${this.getEmployee.emp_id}`;
           this.apiGet(prevUrl).then((res) => {

            const { data } = res;
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
                    accomplishment:datum.sa_accomplishment,
                    next_step:datum.sa_next_steps,
                    challenge:datum.sa_challenges,
                    support:datum.sa_support_needed,
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


    submitNewBeginning() {

      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.activeGoalId}`;
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
    submitMidYearChecking() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment-mid-year/${employeeID}/${this.activeGoalId}`;
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
    test(event) {
      console.log(event.target.value)
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
  },
};
</script>

<style>
textarea {
  resize: none;
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
        <i class="mdi mdi-skip-backward mr-2"></i>
        Self Assessment
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div
        v-if="openGoalActivity === 2 && parseInt(checkOpenGoal) === 1"
        class="col-lg-12"
      >
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Goal Setting Form</h5>
            </div>
            <div class="mb-3">
              <h5 class="mb-2">
                Mid Year Checking: {{ openGoalActivityYear }}
              </h5>
              <h5 class="mb-1">
                Review Period
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
            <form @submit.prevent="submitMidYearChecking">
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
                    <b-td
                      style="width: 19%;"
                    >
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
                            :checked="field.update === 'Complete' "
                            :disabled="assessStatus === 1 ? true : false"
                          />
                          <label class="form-check-label"> Complete </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            id="complete"
                            v-model="field.update"
                            value="On track"
                            :checked="field.update === 'On track'  "
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
                            :checked="field.update === 'Delayed' "
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
                            :checked="field.update "
                            :disabled="assessStatus === 1 ? true : false"
                          />
                          <label class="form-check-label"> Not started  </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            v-model="field.update"
                            value="No longer relevant"
                            type="radio"
                            :name="index"
                            :checked="field.update === 'No longer relevant'  "
                            :disabled="assessStatus === 1 ? true : false"
                          />
                          <label class="form-check-label">
                            No longer relevant
                          </label>
                        </div>
                      </div>
                    </b-td>
                    <b-td
                      style="width: 17%;"
                    >
                      <textarea
                        type="text"
                        v-model="field.accomplishment"
                        rows="6"
                        class="form-control"
                        :readonly="assessStatus === 1 ? true : false"
                      />
                    </b-td>
                    <b-td
                      style="width: 17%"
                    >
                      <textarea
                        type="text"
                        v-model="field.challenge"
                        rows="6"
                        class="form-control"
                        :readonly="assessStatus === 1 ? true : false"
                      />
                    </b-td>
                    <b-td
                      style="width: 17%;"
                    >
                      <textarea
                        type="text"
                        v-model="field.support"
                        rows="6"
                        class="form-control"
                        :readonly="assessStatus === 1 ? true : false"
                      />
                    </b-td>
                    <b-td
                      style="width: 17%; cursor: pointer"
                    >
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
              <div class="alert alert-info d-flex mt-3" v-if="assessStatus === 0 ">
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
                    <input type="date" v-model="sam_discussion_held_on" placeholder="Discussion Held On" class="form-control">
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label for="op">
                      Optional – other items to discuss (career opportunities,
                      area of growth & development, etc.)
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
              <div class="row">
                <div class="col-12">
                  <b-button
                    v-if="!submitting"
                    class="btn btn-success btn-block mt-4"
                    type="submit"
                    :disabled="assessStatus === 1 ? true : false"
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

            <!--            <form @submit.prevent="submitMidYearChecking">-->
            <!--              <div class="row" v-for="(field, index) in texts" :key="index">-->
            <!--                <div class="col">-->
            <!--                  <div class="form-group">-->
            <!--                    <label for="goal">-->
            <!--                      Goal {{ index + 1 }} <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="eya_question"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="field.goal"-->
            <!--                      class="form-control"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.goal.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                  <div class="form-group" style="margin-left: 30px">-->
            <!--                    <label for="goal">-->
            <!--                      Update-->
            <!--                      <label for="" class="badge badge-danger">{{-->
            <!--                        index + 1-->
            <!--                      }}</label>-->
            <!--                      <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <div class="form-check">-->
            <!--                      <input-->
            <!--                        class="form-check-input"-->
            <!--                        v-model="field.update"-->
            <!--                        checked-->
            <!--                        value="Complete"-->
            <!--                        type="radio"-->
            <!--                      />-->
            <!--                      <label class="form-check-label"> Complete </label>-->
            <!--                    </div>-->
            <!--                    <div class="form-check">-->
            <!--                      <input-->
            <!--                        class="form-check-input"-->
            <!--                        id="on-track"-->
            <!--                        v-model="field.update"-->
            <!--                        value="On track"-->
            <!--                        type="radio"-->
            <!--                      />-->
            <!--                      <label class="form-check-label"> On track </label>-->
            <!--                    </div>-->
            <!--                    <div class="form-check">-->
            <!--                      <input-->
            <!--                        class="form-check-input"-->
            <!--                        id="delayed"-->
            <!--                        v-model="field.update"-->
            <!--                        value="Delayed"-->
            <!--                        type="radio"-->
            <!--                      />-->
            <!--                      <label class="form-check-label"> Delayed </label>-->
            <!--                    </div>-->
            <!--                    <div class="form-check">-->
            <!--                      <input-->
            <!--                        class="form-check-input"-->
            <!--                        v-model="field.update"-->
            <!--                        value="Not started"-->
            <!--                        type="radio"-->
            <!--                      />-->
            <!--                      <label class="form-check-label"> Not started </label>-->
            <!--                    </div>-->
            <!--                    <div class="form-check">-->
            <!--                      <input-->
            <!--                        class="form-check-input"-->
            <!--                        v-model="field.update"-->
            <!--                        value="No longer relevant"-->
            <!--                        type="radio"-->
            <!--                      />-->
            <!--                      <label class="form-check-label">-->
            <!--                        No longer relevant-->
            <!--                      </label>-->
            <!--                    </div>-->
            <!--                  </div>-->
            <!--                  <div class="form-group" style="margin-left: 30px">-->
            <!--                    <label for="goal">-->
            <!--                      Challenge-->
            <!--                      <label for="" class="badge badge-danger">{{-->
            <!--                        index + 1-->
            <!--                      }}</label>-->
            <!--                      <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="eya_question"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="field.challenge"-->
            <!--                      placeholder="Challenge"-->
            <!--                      class="form-control"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.challenge.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                  <div class="form-group" style="margin-left: 30px">-->
            <!--                    <label for="goal">-->
            <!--                      Accomplishment-->
            <!--                      <label for="" class="badge badge-danger">{{-->
            <!--                        index + 1-->
            <!--                      }}</label>-->
            <!--                      <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="eya_question"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="field.accomplishment"-->
            <!--                      placeholder="Accomplishment"-->
            <!--                      class="form-control"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.accomplishment.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                  <div class="form-group" style="margin-left: 30px">-->
            <!--                    <label for="goal">-->
            <!--                      Support Needed-->
            <!--                      <label for="" class="badge badge-danger">{{-->
            <!--                        index + 1-->
            <!--                      }}</label>-->
            <!--                      <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="eya_question"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="field.support"-->
            <!--                      class="form-control"-->
            <!--                      placeholder="Support needed"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.support.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                  <div class="form-group" style="margin-left: 30px">-->
            <!--                    <label for="goal">-->
            <!--                      Next Step-->
            <!--                      <label for="" class="badge badge-danger">{{-->
            <!--                        index + 1-->
            <!--                      }}</label>-->
            <!--                      <span class="text-danger">*</span>-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="eya_question"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="field.next_step"-->
            <!--                      class="form-control"-->
            <!--                      placeholder="Next step"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.next_step.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                </div>-->

            <!--                <div class="col-1" v-if="index > 2">-->
            <!--                  <div class="form-group">-->
            <!--                    <label style="visibility: hidden">hidden</label><br />-->
            <!--                    <button-->
            <!--                      type="button"-->
            <!--                      class="btn btn-danger btn-block"-->
            <!--                      @click="delField(index)"-->
            <!--                    >-->
            <!--                      DEL-->
            <!--                    </button>-->
            <!--                  </div>-->
            <!--                </div>-->
            <!--              </div>-->
            <!--              <div class="alert alert-info d-flex mt-3">-->
            <!--                <i class="ri-error-warning-line mr-2"></i>-->
            <!--                You must submit a minimum of 3 goals.-->
            <!--                <span style="cursor: pointer" class="ml-1" @click="addField">-->
            <!--                  Click here to add a new goal-->
            <!--                </span>-->
            <!--              </div>-->
            <!--              <div class="row">-->
            <!--                <div class="col-12">-->
            <!--                  <div class="form-group">-->
            <!--                    <label for="op">-->
            <!--                      Optional – other items to discuss (career opportunities,-->
            <!--                      area of growth & development, etc.-->
            <!--                    </label>-->
            <!--                    <b-form-textarea-->
            <!--                      id="option"-->
            <!--                      no-resize-->
            <!--                      rows="3"-->
            <!--                      v-model="optional"-->
            <!--                      placeholder="Optional"-->
            <!--                      class="form-control"-->
            <!--                      :class="{-->
            <!--                        'is-invalid': submitted && $v.optional.$error,-->
            <!--                      }"-->
            <!--                    />-->
            <!--                  </div>-->
            <!--                </div>-->
            <!--              </div>-->
            <!--              <div class="row">-->
            <!--                <div class="col-12">-->
            <!--                  <b-button-->
            <!--                    v-if="!submitting"-->
            <!--                    class="btn btn-success btn-block mt-4"-->
            <!--                    type="submit"-->
            <!--                  >-->
            <!--                    Submit-->
            <!--                  </b-button>-->
            <!--                  <b-button-->
            <!--                    v-else-->
            <!--                    disabled-->
            <!--                    class="btn btn-success btn-block mt-4"-->
            <!--                    type="submit"-->
            <!--                  >-->
            <!--                    Submitting...-->
            <!--                  </b-button>-->
            <!--                </div>-->
            <!--              </div>-->
            <!--            </form>-->
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
