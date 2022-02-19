<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import {required} from "vuelidate/lib/validators";
export default {
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
  },
  mounted() {
    this.fetchRequest();
    this.getAuthorizingRoles();
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
      const url = `${this.ROUTES.timesheet}/time-sheet/${month}/${year}/${empId}`;

      this.apiGet(url, "Get Time sheet authorization").then((res) => {

        console.log({ res });
        const { timesheet, timeAllocation, log } = res.data;
        this.timeSheet = timesheet;
        this.allocation = timeAllocation;
        this.log = log;
        this.ref_no = this.allocation.ta_ref_no;
        this.getLocation(this.allocation.Employee.emp_location_id);
        this.getSector(this.allocation.Employee.emp_job_role_id);
        this.ta_status = this.allocation.ta_status;
        for (let i = 0; i < this.log.length; i++) {
          if (this.log[i].auth_officer_id === this.getEmployee.emp_id) {
            this.my_status = this.log[i].auth_status;
          }
        }
      });
    },
    getLocation(locationId){

      const url = `${this.ROUTES.location}/${locationId}`
      this.apiGet(url, "Couldn't get location details").then((res)=>{
        this.t6 = res.data.location_name;
      });
    },
    getSector(sectorId){
      const url = `${this.ROUTES.jobRole}/${sectorId}`;
      this.apiGet(url, "Couldn't get location details").then((res)=>{
        this.t3 = res.data.job_role;
      });
    },
    getAuthorizingRoles(){
      const url = `${this.ROUTES.authorizationRole}`;
      this.apiGet(url, "Couldn't get authorizing roles").then((res)=>{
        const { data} = res;
        data.map((role) => {
          this.roles.push({
            value: role.ar_id,
            text: role.ar_title,
          });
        });

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
          role: this.roleId,
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
  },
  data() {
    return {
      title: "Time Sheet Authorization",
      locationId:null,
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
      t6:null, //location
      t3:null,
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
      roles:[{
        value:null,
        text:"Authorizing as...",
        disabled:true,
      }],
      roleId:null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: "true",
        },
      ],
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
                <h5>Time Sheet</h5>
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
                        <td>{{ new Date(`${ts.ts_month}-${ts.ts_day}-${ts.ts_year}`).toDateString()  }}</td>
                        <td>{{ ts.ts_start }}</td>
                        <td>{{ ts.ts_end }}</td>
                        <td>{{ ts.ts_duration }}</td>
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
                <h5>Authorization Log</h5>
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
                        <td v-if="off.role">{{off.role.ar_title}}</td>
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
                <h5 class="font-size-14 mb-0">Authorization Details</h5>
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
              <span>T7 Number</span>
              <span>
                {{ this.allocation.Employee.emp_unique_id }}
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
                  <b-form-select
                          v-model="roleId"
                          :options="roles"
                          :class="{
                      'is-invalid': submitted && $v.roleId.$error,
                    }"
                  />
                </b-form-group>
                <div class="d-flex">
                  <button
                    @click="authorizationHandler(1)"
                    class="btn btn-success w-100 mr-3"
                  >
                    Approve
                  </button>
                  <button
                    @click="authorizationHandler(2)"
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
                    placeholder="Leave your comments here.."
                  />
                </b-form-group>
                <b-form-group>
                  <b-form-select v-model="official" :options="officials" />
                </b-form-group>
                <div>
                  <button class="btn btn-success w-100 mr-3">
                    Forward Request
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
