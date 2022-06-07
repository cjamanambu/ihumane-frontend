<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";
import Multiselect from "vue-multiselect";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if ((userType === 1 || userType === 3) && permissions.includes("TRAVEL")) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Travel Application Details",
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
  },
  validations: {
    comment: { required },
    official: { required },
  },
  methods: {
    fetchRequest() {
      let requestID = this.$route.params.travelAppID;
      const url = `${this.ROUTES.travelApplication}/${requestID}`;
      this.apiGet(url, "Get Travel Application").then((res) => {
        const { application, breakdown, expenses, log } = res.data;
        this.application = application;
        this.breakdowns = breakdown;
        this.expenses = expenses;
        this.log = log;
        this.checkCurrentStatus();
        // this.fetchDonorInfo();
        // this.fetchExpenses();
        this.fetchEmployees();
        this.getLocation(application.applicant.emp_location_id);
        this.getSector(application.applicant.emp_department_id);
      });
    },
    employeeLabel({ text }) {
      return `${text}`;
    },
    reAssignLabel({ text }) {
      return `${text}`;
    },
    fetchDonorInfo() {
      const url = `${this.ROUTES.donor}/${this.application.travelapp_t1_code}`;
      this.apiGet(url, "Get Donor Error").then((res) => {
        const { data } = res;
        this.donor = data;
      });
    },
    fetchExpenses() {
      this.expenses.forEach((expense) => {
        const url = `${this.ROUTES.grantChart}/${expense.travelapp_t2_id}`;
        this.apiGet(url, "Get Expense Error").then((res) => {
          const { data } = res;
          this.t2Codes.push({
            expense: data.gc_expense,
            code: data.gc_account_code,
          });
        });
      });
    },
    fetchEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        this.officials = [
          {
            value: null,
            text: "Please choose the next reviewer",
            disabled: true,
          },
        ];
        const { data } = res;
        data.forEach((employee) => {
          if (
            employee.emp_id !== this.application.applicant.emp_id &&
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
    reAssignLeaveApplication(){
      this.submitted = true;
      let requestID = this.$route.params.travelAppID;
      const url = `${this.ROUTES.leaveApplication}/re-assign-travel-application/${requestID}`;
      const data = {
        appId: requestID,
        reassignTo: this.reAssignedTo.value,
        assignedTo:this.assignedTo.value,
      };
      this.apiPatch(url, data, "Re-assign travel  Error").then();
      this.apiResponseHandler("Change effected", "Travel application updated");
      this.submitted = false;
      this.fetchRequest();
    },
    checkCurrentStatus() {
      this.log.every((entry) => {
        if (entry.auth_officer_id === this.getEmployee.emp_id) {
          if (entry.auth_status > 0) {
            this.status = entry.auth_status;
            return false;
          }
        }
        return true;
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
        const data = {
          appId: this.application.travelapp_id.toString(),
          type: 3,
          comment: this.comment,
          markAsFinal,
          officer: this.getEmployee.emp_id,
        };
        type === "approve" || type === "forward"
          ? (data.status = 1)
          : (data.status = 2);
        !this.final ? (data.nextOfficer = this.official) : "";
        this.apiPost(this.ROUTES.authorization, data)
          .then((res) => {
            this.$router.push({ name: "travel-authorization" }).then(() => {
              this.apiResponseHandler("Authorization Complete", res.data);
            });
          })
          .finally(() => {
            this.approving = false;
            this.declining = false;
          });
      }
    },
  },
  data() {
    return {
      title: "Travel Application Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Travel Application Details",
          active: true,
        },
      ],
      reAssignedTo: null,
      assignedTo: null,
      application: null,
      breakdowns: [],
      expenses: [],
      log: [],
      donor: null,
      t2Codes: [],
      comment: null,
      final: true,
      official: null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: true,
        },
      ],
      assignedOfficials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: true,
        },
      ],
      submitted: false,
      status: null,
      approving: false,
      declining: false,
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
        @click="$router.push({ name: 'manage-travel-applications' })"
      >
        <i class="mdi mdi-step-backward mr-2"></i>
        Go Back
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8" v-if="application">
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
                {{ application.applicant.emp_first_name }}
                {{ application.applicant.emp_first_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Phone No.</span>
              <span>
                {{ application.applicant.emp_phone_no }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Office Email</span>
              <span>
                {{ application.applicant.emp_office_email }}
              </span>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span>
                {{ application.applicant.emp_unique_id }}
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
            <div class="d-flex justify-content-between mb-3">
              <span>Status</span>
              <span v-if="status === 1" class="text-success">Approved</span>
              <span v-else-if="status === 2" class="text-danger">Declined</span>
              <span v-else class="text-warning">Pending</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5
                  class="font-size-14 mb-0"
                  v-if="application.travelapp_travel_cat === 1"
                >
                  Official Travel Authorization / Per Diem Form
                </h5>
                <h5 class="font-size-14 mb-0" v-else>
                  Personal Travel Authorization
                </h5>
              </div>
              <span class="d-inline mb-0">
                <small
                  v-if="application.travelapp_status === 0"
                  class="text-warning"
                >
                  Application Pending
                </small>
                <small
                  v-else-if="application.travelapp_status === 1"
                  class="text-success"
                >
                  Application Approved
                </small>
                <small
                  v-else-if="application.travelapp_status === 2"
                  class="text-danger"
                >
                  Application Declined
                </small>
              </span>
            </div>
            <div class="row">
              <div class="col-lg-8">
                <div class="form-group">
                  <label for="">
                    Purpose of Travel
                    <small class="text-muted">(Description)</small>
                  </label>
                  <p class="text-muted">
                    {{ application.travelapp_purpose }}
                  </p>
                </div>
                <div class="form-group">
                  <label for="">
                    Dates of Travel
                    <small class="text-muted">(TO & FRO)</small>
                  </label>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> Start </label>
                        <p class="text-muted">
                          {{
                            new Date(
                              application.travelapp_start_date
                            ).toDateString()
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> End </label>
                        <p class="text-muted">
                          {{
                            new Date(
                              application.travelapp_end_date
                            ).toDateString()
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div
                  class="form-group"
                  v-if="application && application.travelapp_travel_cat === 1"
                >
                  <label for="">Program / Charge Codes</label>
                  <div class="row">
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label class="" for="">
                          T1 <small class="text-muted">(Grant Code)</small>
                        </label>
                      </div>
                    </div>
                    <div class="col-lg-8">
                      <div class="form-group">
                        <span>
                          <!--                          {{ donor.donor_code }} ({{ donor.donor_description }})-->
                          {{ application.travelapp_t1_code }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="expenses.length">
                    <div class="row">
                      <div class="col-lg-4">
                        <div class="form-group">
                          <label for="">
                            T2 <small class="text-muted">(Expense)</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-lg-8">
                        <div class="form-group">
                          <p
                            class="mb-0"
                            v-for="(t2code, index) in expenses"
                            :key="index"
                          >
                            {{ t2code.travelapp_t2_id }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>DEPART FROM</b-th>
                      <b-th>DATE</b-th>
                      <b-th>AIR/ROAD</b-th>
                      <b-th>AM/PM</b-th>
                      <b-th>DESTINATION</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr v-for="(breakdown, index) in breakdowns" :key="index">
                      <b-td style="width: 30%">
                        <span>
                          {{ breakdown.ta_breakdown_from }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span>
                          {{
                            new Date(breakdown.ta_breakdown_date).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 10%">
                        <span v-if="breakdown.ta_breakdown_mode === 1">
                          Road
                        </span>
                        <span v-else> Air </span>
                      </b-td>
                      <b-td style="width: 10%">
                        <span v-if="breakdown.ta_breakdown_prompt === 1">
                          AM
                        </span>
                        <span v-else> PM </span>
                      </b-td>
                      <b-td style="width: 30%">
                        <span>
                          {{ breakdown.ta_breakdown_destination }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
            <div class="row mt-4" v-if="application.travelapp_travel_cat === 1">
              <div class="col-12">
                <b-table-simple responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>PER DIEM RATE</b-th>
                      <b-th>NO. DAYS</b-th>
                      <b-th>CURRENCY</b-th>
                      <b-th class="text-center">TOTAL</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr>
                      <b-td style="width: 30%">
                        <span>
                          {{ application.travelapp_per_diem.toLocaleString() }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span>
                          {{ application.travelapp_days.toLocaleString() }}
                        </span>
                      </b-td>
                      <b-td style="cursor: pointer; width: 20%">
                        <span> NGN </span>
                      </b-td>
                      <b-td style="width: 30%; text-align: center">
                        {{ application.travelapp_total.toLocaleString() }}
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-12">
                <b-table-simple responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th class="text-center">HOTEL REQUIRED?</b-th>
                      <b-th>CITY</b-th>
                      <b-th>ARRIVAL DATE</b-th>
                      <b-th>DEPARTURE DATE</b-th>
                      <b-th>PREFERRED HOTEL</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr>
                      <b-td class="text-center" style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          YES
                        </span>
                        <span v-else> NO </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{ application.travelapp_city }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{
                            new Date(
                              application.travelapp_arrival_date
                            ).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{
                            new Date(
                              application.travelapp_departure_date
                            ).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{ application.travelapp_preferred_hotel }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card" v-if="application.travelapp_status === 0">
          <div class="card-body">
            <div
              class="p-3 bg-light mb-4 d-flex justify-content-between"
              style="background: #58181f !important; color: #fff !important"
            >
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0 text-white">
                  Application Re-assignment
                </h5>
              </div>
            </div>
            <div class="mb-3">
              <form @submit.prevent="reAssignLeaveApplication">
                <div class="form-group">
                  <label for="">From</label>
                  <multiselect
                    id="assignedTo"
                    v-model="assignedTo"
                    :options="assignedOfficials"
                    :custom-label="employeeLabel"
                    :class="{
                      'is-invalid': submitted && $v.assignedTo.$error,
                    }"
                  ></multiselect>
                </div>
                <div class="form-group">
                  <label for="">Re-assign to</label>
                  <multiselect
                    id="reAssignedTo"
                    v-model="reAssignedTo"
                    :options="officials"
                    :custom-label="reAssignLabel"
                    :class="{
                      'is-invalid': submitted && $v.reAssignedTo.$error,
                    }"
                  ></multiselect>
                  <input type="hidden" v-model="leaveID" />
                </div>
                <div class="form-group d-flex justify-content-center">
                  <b-button
                    v-if="!submitted"
                    type="submit"
                    class="btn btn-success btn-lg mt-4 d-flex justify-content-center"
                  >
                    Save Changes
                  </b-button>
                  <b-button
                    v-else
                    disabled
                    class="btn btn-success btn-block mt-4"
                  >
                    Saving changes...
                  </b-button>
                </div>
              </form>
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
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>OFFICER</b-th>
                      <b-th>STATUS</b-th>
                      <b-th>COMMENT</b-th>
                      <b-th>DATE</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr v-for="(logEntry, index) in log" :key="index">
                      <b-td style="width: 25%">
                        <span>
                          {{ logEntry.officers.emp_first_name }}
                          {{ logEntry.officers.emp_last_name }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span
                          v-if="logEntry.auth_status === 0"
                          class="text-warning"
                        >
                          Pending
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 1"
                          class="text-success"
                        >
                          Approved
                        </span>
                        <span
                          v-else-if="logEntry.auth_status === 2"
                          class="text-success"
                        >
                          Declined
                        </span>
                      </b-td>
                      <b-td style="width: 40%">
                        <span>
                          {{ logEntry.auth_comment }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span>
                          {{ new Date(logEntry.updatedAt).toDateString() }}
                          {{
                            new Date(logEntry.updatedAt).toLocaleTimeString()
                          }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
