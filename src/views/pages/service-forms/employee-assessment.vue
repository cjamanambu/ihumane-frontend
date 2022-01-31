<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Employee Assessment",
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
    this.empId = this.$route.params.empid

   this.getOpenGoalSetting()

    this.getSelfAssessment()


  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Employee Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Employee Assessment",
          href: "/employee-assessment",
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
      prefillAssessments: [ ],
      empId: this.$route.params.empid,
      statuses: [
        { text: "CLOSE", value: 1 },
        { text: "OPEN", value: 0 },
      ],
      // statues: [{ value: 0, text: "Open" }, { value: 1, text: "Closed" }],
    };
  },
  methods: {

   async getSelfAssessment(){
      const urls = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
     const url = await this.apiGet(urls).then((res) => {
       const { data } = res;
        if (data) {

            return `${this.ROUTES.selfAssessment}/get-self-assessment/${this.empId}/${parseInt(data[0].gs_id)}`;

        }
      });

       await this.apiGet(url).then((res) => {
         const { data } = res;
         if (data) {

           this.assessments = [ ]

           data.forEach(async (datum) => {

             const dat = {
               id: datum.sa_id,
               goal: datum.sa_comment,
               status: parseInt(datum.sa_status)
             }

             this.assessments.push(dat)

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

    update(){
      const employeeID = this.empId
      const url = `${this.ROUTES.selfAssessment}/supervisor-update-self-assessment/${employeeID}`;
      this.goals = [ ]
      this.assessments.forEach(async (field) => {
        const data = {
          sa_id: field.id,
          sa_comment: field.goal,
          sa_status: field.status
        };
        this.goals.push(data)

      });
      this.apiPatch(url, this.goals, "Update goals Error").then();
      this.apiResponseHandler("Process Complete", "Goals Updated");
      this.getSelfAssessment()


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

            <form @submit.prevent="update">
            <div class="row" v-for="(field, index) in assessments" :key="index">

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
              <div class="row" v-for="(field, index) in assessments" :key="index">

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



    </div>
  </Layout>
</template>
