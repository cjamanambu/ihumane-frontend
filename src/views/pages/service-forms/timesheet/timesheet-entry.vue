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
      isPresent: true,
      update: false,
    };
  },
  methods: {
    setTimesheetDate() {
      this.timesheetDate = new Date(this.$route.params.date);
    },
    setPresent() {
      this.isPresent = true;
      this.update = true;
    },
    setAbsent() {
      this.isPresent = false;
      this.start = "";
      this.end = "";
      this.duration = "";
      this.update = true;
    },
    getTimesheetData() {
      const employeeID = this.getEmployee.emp_id;
      const date = this.$route.params.date;
      const url = `${this.ROUTES.timesheet}/get-time-sheet/${employeeID}/${date}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        console.log({ data });
        if (data) {
          this.start = data.ts_start;
          this.end = data.ts_end;
          this.duration = data.ts_duration;
          data.ts_is_present
            ? (this.isPresent = true)
            : (this.isPresent = false);
        }
      });
    },
    submit() {
      const url = `${this.ROUTES.timesheet}/add-time-sheet`;

      if (this.isPresent) {
        this.submitted = true;
        this.$v.$touch();
        if (this.$v.$invalid) {
          this.apiFormHandler("Invalid Timesheet Entry");
        } else {
          const data = {
            ts_emp_id: this.getEmployee.emp_id,
            ts_month: `${this.timesheetDate.getMonth() + 1}`,
            ts_year: `${this.timesheetDate.getFullYear()}`,
            ts_day: `${this.timesheetDate.getDate()}`,
            ts_start: this.start,
            ts_end: this.end,
            ts_duration: this.duration,
            ts_is_present: 1,
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
      } else {
        const data = {
          ts_emp_id: this.getEmployee.emp_id,
          ts_month: `${this.timesheetDate.getMonth() + 1}`,
          ts_year: `${this.timesheetDate.getFullYear()}`,
          ts_day: `${this.timesheetDate.getDate()}`,
          ts_start: "0",
          ts_end: "0",
          ts_duration: 0,
          ts_is_present: 0,
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
    tConvert(time) {
      // Check correct time format and split into components
      time = time
        .toString()
        .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join(""); // return adjusted time or original string
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
        @click="$router.push({ name: 'timesheet' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        View Timesheet
      </b-button>
    </div>
    <div class="alert alert-warning" v-if="!isPresent">
      Please note, you will be marked as absent for the timesheet entry on
      {{ timesheetDate.toDateString() }}
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-lg-7">
        <div class="card">
          <div class="card-body">
            <div
              class="p-3 bg-light mb-4 d-flex align-items-center justify-content-between"
            >
              <h5 class="font-size-14 mb-0">File Entry</h5>
              <b-button
                v-if="isPresent"
                class="btn btn-warning mr-3"
                @click="setAbsent"
              >
                Set Absent
              </b-button>
              <b-button v-else class="btn btn-info mr-3" @click="setPresent">
                Set Present
              </b-button>
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
                      :disabled="!isPresent"
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
                      :disabled="!isPresent"
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
                      :disabled="!isPresent"
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
                  <span v-if="update">Update</span>
                  <span v-else> Submit </span>
                </b-button>
                <b-button
                  v-else
                  disabled
                  class="btn btn-success btn-block mt-4"
                  type="submit"
                >
                  <span v-if="update">Updating...</span>
                  <span v-else>Submitting...</span>
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
              <h5 class="font-size-14 mb-0">Timesheet Data</h5>
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
              <p v-else>{{ this.tConvert(start) }}</p>
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
              <p v-else>{{ this.tConvert(end) }}</p>
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
              <p
                v-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>{{ duration }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
