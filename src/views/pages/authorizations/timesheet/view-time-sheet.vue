<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Time Sheet Authorization",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  mounted() {
    this.fetchRequest();
    this.getAuthorizingRoles(2); //time sheet
  },
  validations: {
    comment: { required },
    official: { required },
    roleId: { required },
  },
  props: ["employee"],
  methods: {
    fetchRequest() {
      let month = this.$route.params.month;
      let year = this.$route.params.year;
      let empId = this.$route.params.empId;
      let refNo = this.$route.params.refNo;
      const url = `${this.ROUTES.timesheet}/time-sheet/${month}/${year}/${empId}/${refNo}`;
      this.apiGet(url, "Get Time sheet authorization").then(async (res) => {
        let { timesheet, timeAllocation, log } = res.data;
        this.totalDurationHrs = 0;
        this.totalDurationMins = 0;
        let totalHrs = 0;
        let totalMins = 0;
        timesheet.forEach((time) => {
          let timeSplit = time.ts_duration.toString().split(".");
          totalHrs += parseFloat(timeSplit[0]);
          totalMins += parseFloat(timeSplit[1]) || 0;
        });
        totalHrs += parseInt(totalMins / 60);
        // totalHrs = `${totalHrs}.${totalMins % 60}`;
        this.totalDurationHrs = totalHrs;
        this.totalDurationMins = totalMins % 60;
        this.timeSheet = timesheet;
        this.ref_no = refNo;
        this.numAbsents = 0;
        await this.timeSheet.forEach((timesheet) => {
          if (!timesheet.ts_is_present) {
            this.numAbsents++;
          }
        });
        if (this.numAbsents > 0) {
          this.currentEmployee = timeAllocation[0].employee;
          this.defaultCharge =
            (parseInt(this.currentEmployee.emp_gross) / 22) * this.numAbsents;
        }
        this.breakdown = timeAllocation;
        this.allocation = timeAllocation[0];
        this.log = log;
        this.getLocation(this.allocation.employee.emp_location_id);
        this.getSector(this.allocation.employee.emp_job_role_id);
        this.ta_status = this.allocation.ta_status;
        for (let i = 0; i < this.log.length; i++) {
          if (this.log[i].auth_officer_id === this.getEmployee.emp_id) {
            this.my_status = this.log[i].auth_status;
          }
        }
        this.fetchEmployees();
      });
    },
    authorizingAsLabel({ text }) {
      return `${text}`;
    },
    nextAuthorizingOfficer({ text }) {
      return `${text}`;
    },
    getLocation(locationId) {
      const url = `${this.ROUTES.location}/${locationId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t6 = res.data.location_name;
      });
    },
    getSector(sectorId) {
      const url = `${this.ROUTES.jobRole}/${sectorId}`;
      this.apiGet(url, "Couldn't get location details").then((res) => {
        this.t3 = res.data.job_role;
      });
    },
    getAuthorizingRoles(type) {
      //1=leave,2=time sheet,3=travel
      this.roles = [];
      const url = `${this.ROUTES.authorizationRole}/${type}`;
      this.apiGet(url, "Couldn't get authorizing roles").then((res) => {
        const { data } = res;
        data.map((role) => {
          this.roles.push({
            value: role.ar_id,
            text: role.ar_title,
          });
        });
      });
    },
    submit(type) {
      this.submitted = true;
      if (this.type === "approve") {
        this.approving = true;
      } else if (this.type === "decline") {
        this.declining = true;
      }
      let markAsFinal;
      this.final ? (this.official = "null") : "";
      this.final ? (markAsFinal = 1) : (markAsFinal = 0);
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Authorization");
      } else {
        const val = type === "approve" ? 1 : 2;
        const data = {
          appId: `${this.ref_no}`,
          status: val,
          officer: this.getEmployee.emp_id,
          type: 2,
          role: this.roleId.value,
          comment: this.comment,
          markAsFinal,
        };

        type === "approve" || type === "forward"
          ? (data.status = 1)
          : (data.status = 2);
        !this.final ? (data.nextOfficer = this.official.value) : "";

        this.apiPost(this.ROUTES.authorization, data)
          .then((res) => {
            this.$router.push({ name: "time-sheet-authorization" }).then(() => {
              this.apiResponseHandler("Authorization Complete", res.data);
            });
          })
          .finally(() => {
            this.approving = false;
            this.declining = false;
          });
      }
    },
    /*authorizationHandler(val) {
      if (this.comment === null) {
        alert("Leave a comment");
      } else {
        const url = `${this.ROUTES.appAuthorization}`;
        const data = {
          appId: `${this.ref_no}`,
          status: val,
          officer: this.getEmployee.emp_id,
          type: 2,
          role: this.roleId.value,
          comment: this.comment,
          markAsFinal: this.final,
          nextOfficer: this.nextOfficer.value,
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
    },*/
    fetchEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        this.officials = [];
        const { data } = res;
        data.forEach((employee) => {
          if (
            employee.emp_id !== this.allocation.employee.emp_id &&
            employee.emp_id !== this.getEmployee.emp_id
          ) {
            this.officials.push({
              value: employee.emp_id,
              text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
              disabled: false,
            });
          }
        });
      });
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
      title: "Time Sheet Authorization",
      locationId: null,
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Time Sheet Authorization",
          active: true,
        },
      ],
      t6: null, //location
      t3: null,
      application: null,
      timeSheet: [],
      allocation: [],
      log: [],
      my_status: null,
      donor: null,
      t2Codes: [],
      final: 0,
      official: null,
      comment: null,
      allocationId: null,
      ref_no: null,
      ta_status: null,
      roles: [],
      type: null,
      submitted: false,
      status: null,
      approving: false,
      declining: false,
      roleId: null,
      officials: [],
      breakdown: [],
      currentEmployee: null,
      numAbsents: 0,
      defaultCharge: 0,
      totalDurationHrs: 0,
      totalDurationMins: 0,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'time-sheet-authorization' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Time Sheet Authorizations
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
                        <th>Attendance</th>
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
                          <span v-else>-</span>
                        </td>
                        <td>
                          <span v-if="ts.ts_is_present === 1">
                            {{ tConvert(ts.ts_end) }}
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td>
                          <span v-if="ts.ts_is_present === 1">
                            {{ ts.ts_duration }} hrs
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td style="width: 10%">
                          <small
                            class="text-success"
                            v-if="ts.ts_is_present === 1"
                          >
                            PRESENT
                          </small>
                          <small
                            class="text-primary"
                            v-else-if="ts.ts_is_present === 2"
                          >
                            P. HOLIDAY
                          </small>
                          <small
                            class="text-warning"
                            v-else-if="ts.ts_is_present === 3"
                          >
                            WEEKEND
                          </small>
                          <small
                            class="text-info"
                            v-else-if="ts.ts_is_present === 4"
                          >
                            LEAVE
                          </small>
                          <small class="text-danger" v-else>ABSENT</small>
                        </td>
                      </tr>
                      <tr class="m-0 table-light">
                        <th></th>
                        <th>Total Duration</th>
                        <th></th>
                        <th></th>
                        <th>
                          {{ totalDurationHrs }} hrs
                          {{ totalDurationMins }} mins
                        </th>
                        <th></th>
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
                        <th>Authorized As</th>
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
                        <td v-if="off.role">{{ off.role.ar_title }}</td>
                        <td v-else>---</td>
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
            <hr v-if="defaultCharge > 0" />
            <div
              class="text-danger d-flex justify-content-between mt-3"
              v-if="defaultCharge > 0"
            >
              <strong class="d-inline-block">
                Default Charge - {{ numAbsents }} absence(s)</strong
              >
              <strong>
                {{ parseFloat(defaultCharge.toFixed(2)).toLocaleString() }}
              </strong>
            </div>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Details</h5>
              </div>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Employee Name</span>
              <span>
                {{ this.allocation.employee.emp_first_name }}
                {{ this.allocation.employee.emp_last_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span>
                {{ this.allocation.employee.emp_unique_id }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Phone No.</span>
              <span>
                {{ this.allocation.employee.emp_phone_no }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Office Email</span>
              <span>
                {{ this.allocation.employee.emp_office_email }}
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
            <div v-if="this.my_status === 0">
              <b-form-group>
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="final"
                  name="checkbox-1"
                  :unchecked-value="0"
                  :value="1"
                >
                  Mark this authorization as final
                </b-form-checkbox>
              </b-form-group>
              <div v-if="final === 1">
                <b-form-group>
                  <b-form-textarea
                    rows="5"
                    no-resize
                    placeholder="Leave your comments here.."
                    v-model="comment"
                  />
                </b-form-group>
                <b-form-group>
                  <multiselect
                    v-model="roleId"
                    :options="roles"
                    :custom-label="authorizingAsLabel"
                    :class="{
                      'is-invalid': submitted && $v.roleId.$error,
                    }"
                  ></multiselect>
                </b-form-group>

                <div class="d-flex">
                  <button
                    @click="submit('approve')"
                    class="btn btn-success w-100 mr-3"
                  >
                    Approve
                  </button>
                  <button
                    @click="submit('decline')"
                    class="btn btn-danger w-100"
                  >
                    Decline
                  </button>
                </div>
              </div>
              <div v-else>
                <b-form-group>
                  <b-form-textarea
                    rows="5"
                    no-resize
                    v-model="comment"
                    placeholder="Leave your comments here.."
                  />
                </b-form-group>
                <b-form-group>
                  <multiselect
                    v-model="roleId"
                    :options="roles"
                    :custom-label="authorizingAsLabel"
                    placeholder="Authorizing as..."
                    :class="{
                      'is-invalid': submitted && $v.roleId.$error,
                    }"
                  ></multiselect>
                </b-form-group>
                <b-form-group>
                  <multiselect
                    v-model="official"
                    :options="officials"
                    placeholder="Please choose the next reviewer"
                    :custom-label="nextAuthorizingOfficer"
                    :class="{
                      'is-invalid': submitted && $v.official.$error,
                    }"
                  ></multiselect>
                </b-form-group>
                <div>
                  <button
                    v-if="!submitting"
                    @click="submit('forward')"
                    class="btn btn-success w-100 mr-3"
                  >
                    Forward Request
                  </button>
                  <button v-else disabled class="btn btn-success w-100 mr-3">
                    Forwarding...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
