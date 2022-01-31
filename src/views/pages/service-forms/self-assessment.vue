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
    this.prefillAssessment()
    this.getSelfAssessment()


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
          active: true
        },

      ],
      texts: [{ id: 0, goal: null }],
      endYearQuestions: [ ],
      openGoalActivity: null,
      openGoalActivityId:null,
      goals: [],
      start: "",
      end: "",
      duration: 0,
      submitted: false,
      count: 0,
      selfAssessmentStatus: false,
      prefillStatus: false,
      selfAssessmentGoals: [ ],
      assessments: [ ],
      prefillAssessments: [ ]
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

   async getSelfAssessment(){
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
     const url = await this.apiGet(urls).then((res) => {
       const { data } = res;
        if (data) {
          return `${this.ROUTES.selfAssessment}/get-self-assessment/${this.getEmployee.emp_id}/${parseInt(data[0].gs_id)}`;
        }
      });
     await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {

          this.assessments = [ ]

          data.forEach(async (datum) => {
            this.selfAssessmentStatus = true
            this.prefillStatus = true
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              status: datum.sa_status
            }

            this.assessments.push(dat)

          });

        }
      });
    },

   async prefillAssessment(){
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      const url = await this.apiGet(urls).then((res) => {
        const { data } = res;
        if (data) {
          return `${this.ROUTES.selfAssessment}/prefill-self-assessment/${this.getEmployee.emp_id}/${parseInt(data[0].gs_id)}`;
        }
      });
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          const questions = data.questions
          this.prefillAssessments = [ ]
        questions.forEach(async (datum) => {
        this.prefillStatus = false
            const dat = {
              id: datum.sa_id,
              goal: datum.sa_comment,
              response: datum.sa_response,
               status: datum.sa_status
            }

            this.prefillAssessments.push(dat)

          });

        }
      });
    },

    getOpenGoalSetting(){
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.openGoalActivity = parseInt(data[0].gs_activity)
          this.openGoalActivityId = parseInt(data[0].gs_id)
        }
      });
    },

    submitNewBeginning(){
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.openGoalActivityId}`;
      this.goals = [ ]
      this.texts.forEach(async (field) => {
        const data = {
             sa_comment: field.goal,
        };

        this.goals.push(data)

      });
      this.apiPost(url, this.goals, "Add goals Error").then();

      this.getSelfAssessment();
      this.apiResponseHandler("Process Complete", "Goals Added");


    },

    update(){
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/update-self-assessment/${employeeID}`;
      this.goals = [ ]
      this.assessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_comment: field.goal,
        };
        this.goals.push(data)

      });
      this.apiPatch(url, this.goals, "Update goals Error").then();
      this.apiResponseHandler("Process Complete", "Goals Updated");
      this.getSelfAssessment()


    },

    respond(){
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/respond-self-assessment/${employeeID}`;
      this.goals = [ ]
      this.prefillAssessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_response: field.response
        };

        this.goals.push(data)

      });
      this.apiPatch(url, this.goals, "Update goals Error").then();
      this.apiResponseHandler("Process Complete", "Goals Updated");
      this.prefillAssessment()


    },

    submitNew() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.selfAssessment}/add-self-assessment/${employeeID}/${this.openGoalActivityId}`;
      this.goals = [ ]
      this.prefillAssessments.forEach(async (field) => {
        const data = {
          sa_comment: field.goal,
        };

        this.goals.push(data)

      });
      this.apiPost(url, this.goals, "Add goals Error").then();
      this.apiResponseHandler("Process Complete", "Goals Added");
      this.getSelfAssessment()
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

    <div v-if="openGoalActivity === 1" class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="p-3 bg-light mb-4">
            <h5 class="font-size-14 mb-0">Beginning of the Year</h5>
          </div>

          <div v-if="!selfAssessmentStatus">
            <form @submit.prevent="submitNewBeginning">
              <div class="row" v-for="(field, index) in texts" :key="index">

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
                              @click="delField(index)"
                          >
                            DEL
                          </button>
                        </div>
                        <div v-else class="form-group">
                          <label style="visibility: hidden">hidden</label>
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
              <div class="row" v-for="(field, index) in assessments" :key="index">

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
                      <i>
                        Reviewed By Supervisor
                      </i>
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

      <div v-else-if="openGoalActivity === 2" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Mid Year Checking</h5>
            </div>

            <div v-if="!prefillStatus">
              <form @submit.prevent="submitNew">
                <div class="row" v-for="(field, index) in prefillAssessments" :key="index">

                  <div  v-if="field.status === 0" class="col-lg-12">
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
                        <i>
                          Reviewed By Supervisor
                        </i>
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
                <div class="row" v-for="(field, index) in assessments" :key="index">

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

      <div v-else-if="openGoalActivity === 3" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">End of Year Checking</h5>
            </div>

            <div v-if="!prefillStatus">
              <form @submit.prevent="respond">
                <div class="row" v-for="(field, index) in prefillAssessments" :key="index">

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
                              type="date"
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
                              id="eya_question"
                              type="date"
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
  </Layout>
</template>
