<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Profile",
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

    this.getEndYearAssessment()
    this.getRatings()


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
      year: null,
      endYearQuestions: [ ],
      openGoalActivity: null,
      openGoalActivityId:null,
      rating: null,
      ratingStatus: null,
      ratings: [ ],
      ratingsArray: [ ],
      ratingsStatuses: [ ],
      employeeRating: null,
      goals: [],
      start: "",
      end: "",
      duration: 0,
      submitted: false,
      emp_first_name: null,
      emp_last_name: null,
      emp_other_name: null,
      emp_qualification: null,
      emp_account_no: null,
      emp_bank_id: null,
      emp_state_id: null,
      emp_lga_id: null,
      emp_marital_status: null,
      emp_spouse_name: null,
      emp_spouse_phone_no: null,
      emp_next_of_kin_name: null,
      emp_next_of_kin_address: null,
      emp_next_of_kin_phone_no: null,
      emp_ailments: null,
      emp_blood_group: null,
      emp_genotype: null,
      emp_emergency_name: null,
      emp_emergency_contact: null
    };
  },
  methods: {

    async getEmployee(){
      const url = `${this.ROUTES.employee}/get-employee/${this.getEmployee.emp_id}`
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.emp_first_name = data.emp_first_name,
           this.emp_last_name = data.emp_last_name,
              this.emp_other_name=data.emp_other_name,
              this.emp_qualification=data.emp_qualification,
              this.emp_account_no=data.emp_account_no,
              this.emp_bank_id=data.emp_bank_id,
              this.emp_state_id=data.emp_state_id,
              this.emp_lga_id=data.emp_lga_id,
              this.emp_marital_status=data.emp_marital_status,
              this.emp_spouse_name=data.emp_spouse_name,
              this.emp_spouse_phone_no=data.emp_spouse_phone_no,
              this.emp_next_of_kin_name=data.emp_next_of_kin_name,
              this.emp_next_of_kin_address=data.emp_next_of_kin_address,
              this.emp_next_of_kin_phone_no=data.emp_next_of_kin_phone_no,
              this.emp_ailments=data.emp_ailments,
              this.emp_blood_group=data.emp_blood_group,
              this.emp_genotype=data.emp_genotype,
              this.emp_emergency_name=data.emp_emergency_name,
              this.emp_emergency_contact=data.emp_emergency_contact

        }
      });
    },

    update(){

      const url = `${this.ROUTES.employee}/get-employee/${this.getEmployee.this.emp_id}`
      const data = {
        emp_first_name: this.emp_first_name,
        emp_last_name: this.emp_last_name,
        emp_other_name: this.emp_other_name,
        emp_qualification: this.emp_qualification,
        emp_account_no: this.emp_account_no,
        emp_bank_id: this.emp_bank_id,
        emp_state_id: this.emp_state_id,
        emp_lga_id: this.emp_lga_id,
        emp_marital_status: this.emp_marital_status,
        emp_spouse_name: this.emp_spouse_name,
        emp_spouse_phone_no: this.emp_spouse_phone_no,
        emp_next_of_kin_name: this.emp_next_of_kin_name,
        emp_next_of_kin_address: this.emp_next_of_kin_address,
        emp_next_of_kin_phone_no: this.emp_next_of_kin_phone_no,
        emp_ailments: this.emp_ailments,
        emp_blood_group: this.emp_blood_group,
        emp_genotype: this.emp_genotype,
        emp_emergency_name: this.emp_emergency_name,
        emp_emergency_contact: this.emp_emergency_contact
      };

      this.apiPatch(url, data, "Update Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Update");



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


      <div v-else-if="openGoalActivity === 3" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">End Of Year Assessment</h5>
            </div>


            <div class="row" v-for="(field, index) in endYearAssessments" :key="index">

              <div class="col-lg-12">
                <div class="row">
                  <div class="col-6">

                    <div class="form-group">

                      <div>
                        <b-card title="Questions">
                          <br>
                          <b-card-text>
                            {{field.goal }}
                          </b-card-text>



                        </b-card>
                      </div>



                    </div>
                  </div>
                  <div class="col-6">

                    <div class="form-group">

                      <div>
                        <b-card title="Response">
                          <br>
                          <b-card-text>
                            {{field.response }}
                          </b-card-text>



                        </b-card>
                      </div>



                    </div>

                  </div>
                </div>
              </div>




            </div>

            <div  v-if="parseInt(ratingStatus) === 0">
              <div class="row">




                <div class="col-lg-12">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Grading Rubric</h5>
                    </div>
                  </div>

                  <b-card v-for="(field, index) in ratings" :key="index" :title="field.text">
                    <br>
                    <b-card-text>
                      {{field.desc }}
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

            <div  v-else>
              <div class="row">




                <div class="col-lg-12">
                  <div class="card-body">
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Grading Rubric</h5>
                    </div>
                  </div>

                  <b-card v-for="(field, index) in ratings" :key="index" :title="field.text">
                    <br>
                    <b-card-text>
                      {{field.desc }}
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



    </div>
  </Layout>
</template>
