<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { authComputed } from "@/state/helpers";

// import Stat from "./widget";
// import RevenueAnalytics from "./revenue";
// import SalesAnalytics from "./sales-analytics";
// import EarningReport from "./earning";
// import Sources from "./sources";
// import RecentActivity from "./recent-activity";
// import RevenueLocation from "./revenue-location";
// import Chat from "./chat";
// import Transaction from "./transaction";

/**
 * Dashboard component
 */
export default {
  components: {
    Layout,
    PageHeader,
    // Stat,
    // RevenueAnalytics,
    // SalesAnalytics,
    // EarningReport,
    // Sources,
    // RecentActivity,
    // RevenueLocation,
    // Chat,
    // Transaction,
  },
  computed: {
    ...authComputed,
  },
  data() {
    return {
      title: "Dashboard",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          active: true,
        },
      ],
      users: 0,
      employees: 0,
      leaves: 0,
      travels: 0,
      timeAllocations: [],
      timeAllocations1: [],
      times: 0,
      leaveApps: 0,
      travelReqs: 0,
      timesheets: 0,
      assessEmployees: 0,
      travelAuth: 0,
      leaveAuth: 0,
      timeAuth: 0,
      applications: [],
    };
  },
  mounted() {
    const { user_type } = this.getUser;
    if (user_type === 1 || user_type === 3) this.loadAdminDashboard(); // admin or moderator
    if (user_type === 2 || user_type === 3) this.loadSelfServiceDashboard(); // employee or moderator
  },
  methods: {
    async loadAdminDashboard() {
      await this.apiGet(this.ROUTES.user, "Get Users Error").then((res) => {
        const { data } = res;
        //console.log(data)
        this.users = data.length;
      });
      await this.apiGet(this.ROUTES.employee, "Get Employees Error").then(
        (res) => {
          const { data } = res;
          //console.log(data)
          this.employees = data.length;
        }
      );
      await this.apiGet(
        this.ROUTES.leaveApplication,
        "Get Leave Applications Error"
      ).then((res) => {
        const { data } = res.data;
        //console.log(data)
        this.leaves = data.length;
      });
      await this.apiGet(
        this.ROUTES.travelApplication,
        "Get Travel Applications Error"
      ).then((res) => {
        const { data } = res.data;
        //console.log(data)
        this.travels = data.length;
      });
      this.apiGet(this.ROUTES.timeAllocation, "Get Time Allocation Error").then(
        (res) => {
          let count = 0;
          const { data } = res;
          //console.log(data)
          data.forEach((time) => {
            let found = false;
            if (this.timeAllocations1.length === 0) {
              this.timeAllocations1.push({
                sn: ++count,
                ref_no: time.ta_ref_no,
                payroll_month: time.ta_month,
                payroll_year: time.ta_year,
                breakdown: [{ t1code: time.ta_tcode, charge: time.ta_charge }],
                status: time.ta_status ? time.ta_status : 0,
              });
            } else {
              this.timeAllocations1.every((timeAllocation) => {
                if (time.ta_ref_no === timeAllocation.ref_no) {
                  timeAllocation.breakdown.push({
                    t1code: time.ta_tcode,
                    charge: time.ta_charge,
                  });
                  found = true;
                  return false;
                }
                return true;
              });
              if (!found) {
                this.timeAllocations1.push({
                  sn: ++count,
                  ref_no: time.ta_ref_no,
                  payroll_month: time.ta_month,
                  payroll_year: time.ta_year,
                  breakdown: [
                    { t1code: time.ta_tcode, charge: time.ta_charge },
                  ],
                  status: time.ta_status ? time.ta_status : 0,
                });
              }
            }
          });
          this.times = this.timeAllocations1.length;
        }
      );
    },
    async loadSelfServiceDashboard() {
      this.leaveApps = 0;
      this.travelReqs = 0;
      const employeeID = this.getEmployee.emp_id;
      let url = `${this.ROUTES.leaveApplication}/get-employee-leave/${employeeID}`;
      await this.apiGet(url, "Get Employee Leaves Error").then((res) => {
        const { data } = res.data;

        data.forEach((leave) => {
          if (leave.leapp_status === 0) {
            this.leaveApps++;
          }
        });
      });
      url = `${this.ROUTES.travelApplication}/get-travel-application/${employeeID}`;
      await this.apiGet(url, "Get Travel Applications Error").then((res) => {
        const { data } = res.data;

        data.forEach((travel) => {
          if (travel.travelapp_status === 0) {
            this.travelReqs++;
          }
        });
      });
      url = `${this.ROUTES.timeAllocation}/get-employee-time-allocation/${employeeID}`;
      this.apiGet(url, "Get Time Allocation Error").then((res) => {
        let count = 0;
        const { data } = res;
        data.forEach((time) => {
          let found = false;
          if (this.timeAllocations.length === 0) {
            this.timeAllocations.push({
              sn: ++count,
              ref_no: time.ta_ref_no,
              payroll_month: time.ta_month,
              payroll_year: time.ta_year,
              breakdown: [{ t1code: time.ta_tcode, charge: time.ta_charge }],
              status: time.ta_status ? time.ta_status : 0,
            });
          } else {
            this.timeAllocations.every((timeAllocation) => {
              if (time.ta_ref_no === timeAllocation.ref_no) {
                timeAllocation.breakdown.push({
                  t1code: time.ta_tcode,
                  charge: time.ta_charge,
                });
                found = true;
                return false;
              }
              return true;
            });
            if (!found) {
              this.timeAllocations.push({
                sn: ++count,
                ref_no: time.ta_ref_no,
                payroll_month: time.ta_month,
                payroll_year: time.ta_year,
                breakdown: [{ t1code: time.ta_tcode, charge: time.ta_charge }],
                status: time.ta_status ? time.ta_status : 0,
              });
            }
          }
        });
        this.timesheets = this.timeAllocations.length;
      });
      url = `${this.ROUTES.employee}/get-supervisor-employees/${employeeID}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.assessEmployees = data.length;
      });
      url = `${this.ROUTES.travelApplication}/authorization/supervisor/${employeeID}`;
      this.apiGet(url, "Get Travel Applications Error").then((res) => {
        const { data } = res.data;
        if (data) this.travelAuth = data.length;
      });
      url = `${this.ROUTES.leaveApplication}/authorization/supervisor/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Leave Applications Error").then((res) => {
        const { data } = res.data;
        this.leaveAuth = data.length;
      });
      url = `${this.ROUTES.timeAllocation}/authorization/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Authorizations Error").then((res) => {
        let count = 0;
        const { data, officers } = res.data;
        data.forEach((time) => {
          let found = false;
          if (this.applications.length === 0) {
            this.applications.push({
              sn: ++count,
              ref_no: time.ta_ref_no,
              payroll_month: time.ta_month,
              payroll_year: time.ta_year,
              breakdown: [{ t1code: time.ta_tcode, charge: time.ta_charge }],
              status: time.ta_status ? time.ta_status : 0,
              employee: time.employee,
            });
          } else {
            this.applications.every((application) => {
              if (time.ta_ref_no === application.ref_no) {
                application.breakdown.push({
                  t1code: time.ta_tcode,
                  charge: time.ta_charge,
                });
                found = true;
                return false;
              }
              return true;
            });
            if (!found) {
              this.applications.push({
                sn: ++count,
                ref_no: time.ta_ref_no,
                payroll_month: time.ta_month,
                payroll_year: time.ta_year,
                breakdown: [{ t1code: time.ta_tcode, charge: time.ta_charge }],
                status: time.ta_status ? time.ta_status : 0,
                employee: time.employee,
              });
            }
          }
        });
        this.applications.forEach((application) => {
          officers.forEach((officer) => {
            if (application.ref_no === officer.auth_travelapp_id) {
              application["Officer"] = officer.officers;
            }
          });
        });
        this.timeAuth = this.applications.length;
      });
    },
  },
};
</script>
<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div v-if="panel === 'admin'" class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <img
                style="width: 30%"
                :src="require('@/assets/images/irc-logo.png')"
                class="mr-4"
              />
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mt-3 mb-2">
                  Welcome back,
                </p>
                <div v-if="getUser.user_type > 1">
                  <h4 class="mb-0 text-capitalize">
                    {{ this.getEmployee.emp_first_name }}
                    {{ this.getEmployee.emp_last_name }}
                  </h4>
                  <p class="text-muted mb-1">
                    {{ this.getEmployee.emp_unique_id }}
                  </p>
                  <p v-if="this.getEmployee" class="d-flex mb-0">
                    <span class="mr-2">Location (T6):</span>
                    <span>
                      {{ this.getEmployee.location.l_t6_code }}
                      <small class="text-muted">
                        ({{ this.getEmployee.location.location_name }})
                      </small>
                    </span>
                  </p>
                  <p v-if="this.getEmployee" class="d-flex mb-0">
                    <span class="mr-2">Sector (T3):</span>
                    <span>
                      {{ this.getEmployee.sector.d_t3_code }}
                      <small class="text-muted">
                        ({{ this.getEmployee.sector.department_name }})
                      </small>
                    </span>
                  </p>
                  <p class="d-flex">
                    <span class="mr-2">Global ID (D7):</span>
                    <span>
                      {{ this.getEmployee.emp_d7 }}
                    </span>
                  </p>
                </div>
                <div v-else>
                  <h4 class="text-capitalize">
                    {{ this.getUser.user_username }}
                  </h4>
                </div>

                <p class="text-muted mb-0">
                  {{ new Date().toUTCString() }}
                </p>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-2">
            <div class="text-success d-inline-flex">
              <a
                href="https://www.rescue.org/country/nigeria"
                class="d-flex align-items-center"
                target="_blank"
              >
                International Rescue Committee
                <i class="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-4">
            <div class="card cursor-pointer" @click="$router.push('/users')">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ users }} Total
                    </p>
                    <h5 class="mb-0">Users</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/manage-employees')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ employees }} Total
                    </p>
                    <h5 class="mb-0">Employees</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/manage-leave-applications')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ leaves }} Total
                    </p>
                    <h5 class="mb-0">Leave Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/manage-travel-applications')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ travels }} Total
                    </p>
                    <h5 class="mb-0">Travel Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/manage-time-sheets')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ times }} Total
                    </p>
                    <h5 class="mb-0">Timesheets Filled</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Self Assessments Done</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <img
                style="width: 30%"
                :src="require('@/assets/images/irc-logo.png')"
                class="mr-4"
              />
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mt-3 mb-2">
                  Welcome back,
                </p>
                <h4 class="mb-0 text-capitalize">
                  {{ this.getEmployee.emp_first_name }}
                  {{ this.getEmployee.emp_last_name }}
                </h4>
                <p class="text-muted mb-1">
                  {{ this.getEmployee.emp_unique_id }}
                </p>
                <p class="d-flex mb-0">
                  <span class="mr-2">Location (T6):</span>
                  <span>
                    {{ this.getEmployee.location.l_t6_code }}
                    <small class="text-muted">
                      ({{ this.getEmployee.location.location_name }})
                    </small>
                  </span>
                </p>
                <p class="d-flex mb-0">
                  <span class="mr-2">Sector (T3):</span>
                  <span>
                    {{ this.getEmployee.sector.d_t3_code }}
                    <small class="text-muted">
                      ({{ this.getEmployee.sector.department_name }})
                    </small>
                  </span>
                </p>
                <p class="d-flex">
                  <span class="mr-2">Global ID (D7):</span>
                  <span>
                    {{ this.getEmployee.emp_d7 }}
                  </span>
                </p>
                <p class="text-muted mb-0">
                  {{ new Date().toUTCString() }}
                </p>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-2">
            <div class="text-success d-inline-flex">
              <a
                href="https://www.rescue.org/country/nigeria"
                class="d-flex align-items-center"
                target="_blank"
              >
                International Rescue Committee
                <i class="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/leave-application')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ leaveApps }} Pending
                    </p>
                    <h5 class="mb-0">Leave Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/travel-requests')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ travelReqs }} Pending
                    </p>
                    <h5 class="mb-0">Travel Requests</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/timesheets')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ timesheets }} Pending
                    </p>
                    <h5 class="mb-0">Timesheets Filled</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/assess-employees')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ assessEmployees }} Total
                    </p>
                    <h5 class="mb-0">Employees to Assess</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/travel-authorization')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ travelAuth }} Total
                    </p>
                    <h5 class="mb-0">Travel Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/leave-authorization')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ leaveAuth }} Total
                    </p>
                    <h5 class="mb-0">Leave Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div
              class="card cursor-pointer"
              @click="$router.push('/time-sheet-authorization')"
            >
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">
                      {{ timeAuth }} Total
                    </p>
                    <h5 class="mb-0">Timesheet Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
