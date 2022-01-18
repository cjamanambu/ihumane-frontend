<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";

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
          text: "Timesheet Entry",
          active: true,
        },
      ],
      timesheetDate: null,
    };
  },
  methods: {
    setTimesheetDate() {
      this.timesheetDate = new Date(this.$route.params.date);
    },
    getTimesheetData() {
      this.apiGet();
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
    <div class="row">
      <div class="col-lg-7">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">File Report</h5>
            </div>
            <form @submit.prevent>
              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group">
                    <label for="match-code">
                      Match Code (T0) <span class="text-danger">*</span>
                    </label>
                    <input id="match-code" type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label for="charge-1">
                      % to Charge (T0) <span class="text-danger">*</span>
                    </label>
                    <input id="charge-1" type="number" class="form-control" />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group">
                    <label for="grant-code">
                      Grant Code (T1) <span class="text-danger">*</span>
                    </label>
                    <input id="grant-code" type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label for="charge-2">
                      % to Charge (T1) <span class="text-danger">*</span>
                    </label>
                    <input id="charge-2" type="number" class="form-control" />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="end-date">
                      End Date <span class="text-danger">*</span>
                    </label>
                    <input id="end-date" type="date" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="program-code">
                      Program Code (T3) <span class="text-danger">*</span>
                    </label>
                    <input id="program-code" type="text" class="form-control" />
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
                International Rescue Committee - Overseas Staff
                <span class="back text-danger" @click="$router.back()">
                  Go Back
                </span>
              </h5>
            </div>
            <div class="d-flex justify-content-between">
              <p>Payroll Reporting Period</p>
              <p>
                <span class="mr-1">{{
                  timesheetDate.getMonth() | getMonth
                }}</span>
                <span>{{ timesheetDate.getFullYear() }}</span>
              </p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Name</p>
              <p>
                {{ getUser.user_name }}
              </p>
            </div>
            <div class="d-flex justify-content-between">
              <p>T7 Code</p>
              <p>-</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Location (T5)</p>
              <p>-</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Site Code (T6)</p>
              <p>-</p>
            </div>
            <div class="d-flex justify-content-between mb-4">
              <p>Nationality</p>
              <p>Non-US</p>
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
              <p v-else>8:00am</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Finish Time</p>
              <p v-if="timesheetDate.getDay() === 5">3:00pm</p>
              <p
                v-else-if="
                  timesheetDate.getDay() === 0 || timesheetDate.getDay() === 6
                "
              >
                WEEKEND
              </p>
              <p v-else>5:00pm</p>
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
              <p v-else>8:15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
