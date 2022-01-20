<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Timesheet Entry",
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
    this.setTimesheetDate();
    this.getTimesheetData();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Timesheet Entry",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "TimeSheet",
          href: "/timesheet",
        },
        {
          text: "Timesheet Entry",
          active: true,
        },
      ],
      timesheetDate: null,
      start: "",
      end: "",
      duration: 0,
      submitted: false,
    };
  },
  methods: {
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
          console.log({ data });
          this.start = data.ts_start;
          this.end = data.ts_end;
          this.duration = data.ts_duration;
        }
      });
    },
    submit() {
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
          console.log({ res });
          this.$v.$reset();
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
      <div class="col-lg-7">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">File Entry</h5>
            </div>
            <form @submit.prevent="submit">
              <div class="row">
                <div class="col-lg-5">
                  <div class="form-group">
                    <label for="start">
                      Start Time <span class="text-danger">*</span>
                    </label>
                    <input
                      id="start"
                      type="time"
                      v-model="start"
                      class="form-control"
                      :class="{
                        'is-invalid': submitted && $v.start.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.start.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.start.required">
                        Start time is required.
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-lg-5">
                  <div class="form-group">
                    <label for="end">
                      End Time <span class="text-danger">*</span>
                    </label>
                    <input
                      id="end"
                      type="time"
                      class="form-control"
                      v-model="end"
                      :class="{
                        'is-invalid': submitted && $v.end.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.end.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.end.required">
                        End time is required.
                      </span>
                    </div>
                  </div>
                </div>
                <div class="col-lg-2">
                  <div class="form-group">
                    <label for="duration">
                      Duration (hrs) <span class="text-danger">*</span>
                    </label>
                    <input
                      id="duration"
                      type="number"
                      class="form-control"
                      step=".01"
                      v-model="duration"
                      :class="{
                        'is-invalid': submitted && $v.duration.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.duration.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.duration.required">
                        Duration is required.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
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
            </form>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0 d-flex justify-content-between">
                Timesheet Data
                <span class="back text-danger" @click="$router.back()">
                  Go Back
                </span>
              </h5>
            </div>

            <div class="d-flex justify-content-between">
              <p>Pay Period Day</p>
              <p>
                <span>{{ timesheetDate.getDate() }}</span>
                <span>-</span>
                <span>{{ timesheetDate.getMonth() | getMonth }}</span>
              </p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Date/Day</p>
              <p>
                <span class="text-uppercase">
                  {{ timesheetDate.getDay() | getDay }}
                </span>
              </p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Start Time</p>
              <p
                v-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>{{ start }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Finish Time</p>
              <p
                v-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>{{ end }}</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Break Hours</p>
              <p v-if="timesheetDate.getDay() === 5">-</p>
              <p
                v-else-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>45mins</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Hours Worked</p>
              <p v-if="timesheetDate.getDay() === 5">7:00</p>
              <p
                v-else-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>{{ this.duration }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
