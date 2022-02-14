<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Leave Authorization",
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
  validations: {
    comment: { required },
    official: { required },
  },
  methods: {
    fetchRequest() {
      let requestID = this.$route.params.leaveAppID;
      const url = `${this.ROUTES.leaveApplication}/${requestID}`;
      this.apiGet(url, "Get Leave Application").then((res) => {
        console.log({ res });
        const { application, log } = res.data;
        this.application = application;
        this.log = log;
        this.fetchEmployees();
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
          // employee.emp_id !== this.application.Employee.emp_id &&
          if (employee.emp_id !== this.getEmployee.emp_id) {
            this.officials.push({
              value: employee.emp_id,
              text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
              disabled: false,
            });
          }
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
        const data = {
          appId: this.application.leapp_id.toString(),
          type: 1,
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
            this.$router.push({ name: "leave-authorization" }).then(() => {
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
      title: "Leave Authorization",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Authorization",
          active: true,
        },
      ],
      application: null,
      log: [],
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
      submitted: false,
      status: null,
      approving: false,
      declining: false,
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
        @click="$router.push({ name: 'leave-authorization' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Leave Authorizations
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Leave Authorization</h5>
              </div>
              <span class="d-inline mb-0">
                <small
                  v-if="application.leapp_status === 0"
                  class="text-warning"
                >
                  Application Pending
                </small>
                <small
                  v-else-if="application.leapp_status === 1"
                  class="text-success"
                >
                  Application Approved
                </small>
                <small
                  v-else-if="application.leapp_status === 2"
                  class="text-danger"
                >
                  Application Declined
                </small>
              </span>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="form-group">
                  <label for=""> Leave Type </label>
                  <p class="text-muted">
                    {{ application.LeaveType.leave_name }}
                  </p>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Start Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_start_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> End Date </label>
                  <p class="text-muted">
                    {{ new Date(application.leapp_end_date).toDateString() }}
                  </p>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for=""> Leave Length </label>
                  <p class="text-muted">
                    {{ application.leapp_total_days }} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card mt-4">
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
                {{ application.employee.emp_first_name }}
                {{ application.employee.emp_last_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span> {{ application.employee.emp_unique_id }} </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T3 Code</span>
              <span> - </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T6 Code</span>
              <span> - </span>
            </div>
            <div v-if="status" class="d-flex justify-content-between mb-3">
              <span>Status</span>
              <span v-if="status === 1" class="text-success">Approved</span>
              <span v-else-if="status === 2" class="text-danger">Declined</span>
            </div>
            <div v-else>
              <b-form-group>
                <b-form-checkbox
                  id="checkbox-1"
                  v-model="final"
                  name="checkbox-1"
                  :value="true"
                  :unchecked-value="false"
                >
                  Mark this authorization as final
                </b-form-checkbox>
              </b-form-group>
              <b-form-group>
                <b-form-textarea
                  rows="5"
                  no-resize
                  placeholder="Leave your comments here.."
                  v-model="comment"
                  :class="{
                    'is-invalid': submitted && $v.comment.$error,
                  }"
                />
              </b-form-group>
              <div class="d-flex" v-if="final">
                <button
                  v-if="!approving"
                  @click="submit('approve')"
                  class="btn btn-success w-100 mr-3"
                >
                  Approve
                </button>
                <button v-else disabled class="btn btn-success w-100 mr-3">
                  Approving...
                </button>
                <button
                  v-if="!declining"
                  @click="submit('decline')"
                  class="btn btn-danger w-100"
                >
                  Decline
                </button>
                <button v-else disabled class="btn btn-danger w-100">
                  Declining...
                </button>
              </div>
              <div v-else>
                <b-form-group>
                  <b-form-select
                    v-model="official"
                    :options="officials"
                    :class="{
                      'is-invalid': submitted && $v.official.$error,
                    }"
                  />
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
