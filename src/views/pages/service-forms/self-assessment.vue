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
  mounted() {
    this.getOpenGoalSetting();
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
      openGoalActivity: null,
      openGoalActivityId:null,
      start: "",
      end: "",
      duration: 0,
      submitted: false,
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
    setTimesheetDate() {
      this.timesheetDate = new Date(this.$route.params.date);
    },
    getTimesheetData() {
      const employeeID = this.getEmployee.emp_id;
      const date = this.$route.params.date;
      const url = `${this.ROUTES.timesheet}/get-time-sheet/${employeeID}/${date}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.start = data.ts_start;
          this.end = data.ts_end;
          this.duration = data.ts_duration;
        }
      });
    },


    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Timesheet Entry");
      } else {
        const url = `${this.ROUTES.timesheet}/add-time-sheet`;
        const data = {
          ts_emp_id: this.getEmployee.emp_id,
          ts_month: `${this.timesheetDate.getMonth() + 1}`,
          ts_year: `${this.timesheetDate.getFullYear()}`,
          ts_day: `${this.timesheetDate.getDate()}`,
          ts_start: this.start,
          ts_end: this.end,
          ts_duration: this.duration,
        };
        this.apiPost(url, data, "Add Timesheet Error").then((res) => {
          const { data } = res;
          if (data) {
            this.apiResponseHandler(data, "Modified Timesheet Entry");
          }
          this.$v.$reset();
          this.getTimesheetData();
        });
      }
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

          <form @submit.prevent="submitNew">
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
                      <div v-if="field.id > 0" class="form-group">
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
          </div>
        </div>
      </div>

      <div v-else-if="openGoalActivity === 3" class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Mid Year Checking</h5>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-danger mb-4">
              <h5 class="font-size-14 mb-0">No Activity Set</h5>
            </div>
          </div>
        </div>
      </div>


    </div>
  </Layout>
</template>
