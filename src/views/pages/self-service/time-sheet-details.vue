<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 1 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Time Sheet Details",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.fetchRequest();
  },
  props: ["employee"],
  methods: {
    fetchRequest() {
      let month = this.$route.params.month;
      let year = this.$route.params.year;
      let empId = this.$route.params.empId;

      // const url = `${this.ROUTES.timesheet}/${month}/${year}`;
      const url = `${this.ROUTES.timesheet}/time-sheet/${month}/${year}/${empId}`;

      this.apiGet(url, "Get Time sheet details").then((res) => {
        const { timesheet, timeAllocation, log } = res.data;
        console.log(timesheet);
        this.timeSheet = timesheet;
        this.allocation = timeAllocation[0];
        this.breakdown = timeAllocation;
        this.log = log;
        this.ref_no = this.allocation.ta_ref_no;
        this.getLocation(this.allocation.Employee.emp_location_id);
        this.getSector(this.allocation.Employee.emp_department_id);
        this.ta_status = this.allocation.ta_status;
        for (let i = 0; i < this.log.length; i++) {
          if (this.log[i].auth_officer_id === this.getEmployee.emp_id) {
            this.my_status = this.log[i].auth_status;
          }
        }
      });
    },
    getLocation(locationId) {
      const url = `${this.ROUTES.location}/${locationId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t6 = res.data.location_name;
      });
    },
    getSector(sectorId) {
      const url = `${this.ROUTES.department}/${sectorId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t3 = res.data.d_t3_code;
      });
    },
    authorizationHandler(val) {
      if (this.comment === null) {
        alert("Leave a comment");
      } else {
        const url = `${this.ROUTES.appAuthorization}`;
        const data = {
          appId: `${this.ref_no}`,
          status: val,
          officer: this.getEmployee.emp_id,
          type: 2,
          comment: this.comment,
          markAsFinal: this.final,
          nextOfficer: this.nextOfficer,
        };
        this.apiPost(url, data, "Authorization Error")
          .then((res) => {
            this.apiResponseHandler(`${res.data}`, "Authorization action");
            this.fetchRequest();
          })
          .catch((error) => {
            console.log(error);
          });
        //alert("Comment: "+this.comment+" val: "+val);
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
  data() {
    return {
      title: "Time Sheet Details",
      isApiBusy: false,
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Time Sheet Details",
          active: true,
        },
      ],
      application: null,
      timeSheet: [],
      allocation: [],
      log: [],
      my_status: null,
      donor: null,
      t2Codes: [],
      final: 1,
      official: null,
      comment: null,
      allocationId: null,
      ref_no: null,
      ta_status: null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: "true",
        },
      ],
      breakdown: null,
      t6: null,
      t3: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-secondary"
        @click="$router.push({ name: 'manage-time-sheets' })"
      >
        <i class="mdi mdi-step-backward mr-2"></i>
        Go Back
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Timesheet Entries</h5>
              </div>
              <small
                v-if="this.ta_status === 1"
                class="text-success float-right"
              >
                Approved
              </small>
              <small
                v-else-if="this.ta_status === 2"
                class="text-danger float-right"
              >
                Discarded
              </small>
              <small v-else class="text-warning float-right"> Pending </small>
            </div>
            <div class="row">
              <div class="col-lg-12">
                <div class="table-responsive">
                  <table class="table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Day</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        class="table-light"
                        v-for="(ts, index) in this.timeSheet"
                        :key="index"
                      >
                        <th scope="row">{{ index + 1 }}</th>
                        <td>
                          {{
                            new Date(
                              `${ts.ts_month}-${ts.ts_day}-${ts.ts_year}`
                            ).toDateString()
                          }}
                        </td>
                        <td>
                          <span v-if="ts.ts_is_present === 1">
                            {{ tConvert(ts.ts_start) }}
                          </span>
                          <span
                            class="text-primary"
                            v-else-if="ts.ts_is_present === 2"
                          >
                            P. HOLIDAY
                          </span>
                          <span
                            class="text-warning"
                            v-else-if="ts.ts_is_present === 3"
                          >
                            WEEKEND
                          </span>
                          <span
                            class="text-info"
                            v-else-if="ts.ts_is_present === 4"
                          >
                            LEAVE
                          </span>
                          <span v-else class="text-danger">ABSENT</span>
                        </td>
                        <td>
                          <span v-if="ts.ts_is_present === 1">
                            {{ tConvert(ts.ts_end) }}
                          </span>
                          <span
                            class="text-primary"
                            v-else-if="ts.ts_is_present === 2"
                          >
                            P. HOLIDAY
                          </span>
                          <span
                            class="text-warning"
                            v-else-if="ts.ts_is_present === 3"
                          >
                            WEEKEND
                          </span>
                          <span
                            class="text-info"
                            v-else-if="ts.ts_is_present === 4"
                          >
                            LEAVE
                          </span>
                          <span v-else class="text-danger">ABSENT</span>
                        </td>
                        <td>
                          <span v-if="ts.ts_is_present === 1">
                            {{ tConvert(ts.ts_duration) }} hrs
                          </span>
                          <span
                            class="text-primary"
                            v-else-if="ts.ts_is_present === 2"
                          >
                            P. HOLIDAY
                          </span>
                          <span
                            class="text-warning"
                            v-else-if="ts.ts_is_present === 3"
                          >
                            WEEKEND
                          </span>
                          <span
                            class="text-info"
                            v-else-if="ts.ts_is_present === 4"
                          >
                            LEAVE
                          </span>
                          <span v-else class="text-danger">ABSENT</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Log</h5>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-12">
                <div class="table-responsive">
                  <table class="table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Officer</th>
                        <th>Status</th>
                        <th>Comment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        class="table-light"
                        v-for="(off, ind) in this.log"
                        :key="ind"
                      >
                        <th scope="row">{{ ind + 1 }}</th>
                        <td>
                          {{
                            off.officers.emp_first_name
                              ? off.officers.emp_first_name
                              : ""
                          }}
                          {{
                            off.officers.emp_last_name
                              ? off.officers.emp_last_name
                              : ""
                          }}
                        </td>
                        <td>
                          <small
                            v-if="off.auth_status === 1"
                            class="text-success"
                          >
                            Approved
                          </small>
                          <small
                            v-else-if="off.auth_status === 2"
                            class="text-danger"
                          >
                            Discarded
                          </small>
                          <small v-else class="text-warning"> Pending </small>
                        </td>
                        <td>{{ off.auth_comment }}</td>
                        <td>{{ new Date(off.updatedAt).toDateString() }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Employee Details</h5>
              </div>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Employee Name</span>
              <span>
                {{ this.allocation.Employee.emp_first_name }}
                {{ this.allocation.Employee.emp_last_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Phone No.</span>
              <span>
                {{ this.allocation.Employee.emp_phone_no }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Office Email</span>
              <span>
                {{ this.allocation.Employee.emp_office_email }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span>
                {{ this.allocation.Employee.emp_unique_id }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T3 Code</span>
              <span> {{ t3 }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T6 Code</span>
              <span> {{ t6 }} </span>
            </div>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Time Allocation</h5>
              </div>
            </div>
            <div
              class="d-flex justify-content-between mb-2"
              v-for="(charge, index) in breakdown"
              :key="index"
            >
              <span>Grant Code: {{ charge.ta_tcode }}</span>
              <span>Percentage Charge: {{ charge.ta_charge }}%</span>
            </div>
            <div
              class="d-flex justify-content-between mb-2"
              v-for="(charge, index) in breakdown"
              :key="index"
            >
              <span>Match Code: {{ charge.ta_t0_code }}</span>
              <span>Percentage Charge: {{ charge.ta_t0_percent }}%</span>
            </div>
            <!--            <hr />-->
            <!--            <div-->
            <!--              class="text-danger d-flex justify-content-between mt-3"-->
            <!--              v-if="defaultCharge > 0"-->
            <!--            >-->
            <!--              <strong class="d-inline-block">-->
            <!--                Default Charge - {{ numAbsents }} absence(s)</strong-->
            <!--              >-->
            <!--              <strong>-->
            <!--                {{ parseFloat(defaultCharge.toFixed(2)).toLocaleString() }}-->
            <!--              </strong>-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
