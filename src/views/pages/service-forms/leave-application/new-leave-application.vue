<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { required } from "vuelidate/lib/validators";
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
    title: "New Leave Application",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    DatePicker,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.getLeaveAccruals();
    this.fetchApplications();
    this.getHRFocalPoints();
  },
  validations: {
    leaveType: { required },
    leapp_start_date: { required },
    leapp_end_date: { required },
  },
  data() {
    return {
      title: "New Leave Application",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "New Leave Application",
          active: true,
        },
      ],
      uploadFieldName: "file",
      uploadFiles: [],
      leaveAccruals: [],
      leaveType: null,
      leaveTypes: [],
      leapp_start_date: null,
      leapp_end_date: null,
      leapp_alt_email: null,
      leapp_alt_phone: null,
      submitted: false,
      omittedDays: [],
      omittedStartDate: null,
      omittedEndDate: null,
      focalPoints: [],
      location: null,
      existingLeaveType: null,
      applications: [],
      applying: false,
    };
  },
  methods: {
    getLeaveAccruals() {
      let url = `${this.ROUTES.leaveAccrual}/get-leave-acrruals/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Leave Accruals Error").then((res) => {
        const { data } = res;
        this.leaveTypes = [
          { value: null, text: "Please select a leave type", disabled: true },
        ];
        data.forEach((leaveAccrual) => {
          if (typeof leaveAccrual.accrual === "number") {
            this.leaveAccruals.push(leaveAccrual);
            this.leaveTypes.push({
              value: leaveAccrual.leave.leave_type_id,
              text: `${leaveAccrual.leave.leave_name} (${leaveAccrual.accrual} day(s) accrued)`,
            });
          } else {
            this.leaveTypes.push({
              value: leaveAccrual.leave.leave_type_id,
              text: `${leaveAccrual.leave.leave_name} (${leaveAccrual.accrual})`,
            });
          }
        });
      });
    },
    fetchApplications() {
      const url = `${this.ROUTES.leaveApplication}/get-employee-leave/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Employee Leaves Error").then((res) => {
        const { data } = res.data;
        this.omittedDays = [];
        this.applications = data;
        data.forEach((application) => {
          if (
            application.leapp_status === 0 ||
            application.leapp_status === 1 ||
            application.leapp_status === 3
          )
            this.omittedDays.push(
              ...this.getDates(
                application.leapp_start_date,
                application.leapp_end_date
              )
            );
        });
      });
    },
    getHRFocalPoints() {
      const locationID = this.getEmployee.location.location_id;
      this.location = this.getEmployee.location.location_name;
      const url = `${this.ROUTES.hrFocalPoint}/${locationID}`;
      this.apiGet(url, "Get Focal Point Error").then((res) => {
        const { data } = res;
        this.focalPoints = data;
      });
    },
    getDates(startDate, endDate) {
      const dates = [];
      let currentDate = new Date(startDate);
      const addDays = function (days) {
        const date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
      while (currentDate <= new Date(endDate)) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
      }
      return dates;
    },
    notBeforeToday(date) {
      const today = new Date();
      return date < today;
    },
    confirmStartDate() {
      this.omittedStartDate = this.omittedDays.find((date) => {
        return (
          date.toDateString() === new Date(this.leapp_start_date).toDateString()
        );
      });
    },
    confirmEndDate() {
      this.omittedEndDate = this.omittedDays.find((date) => {
        return (
          date.toDateString() === new Date(this.leapp_end_date).toDateString()
        );
      });
    },
    confirmApplicationType() {
      this.existingLeaveType = this.applications.find((application) => {
        return (
          application.leapp_leave_type === this.leaveType &&
          (application.leapp_status === 0 ||
            application.leapp_status === 1 ||
            application.leapp_status === 3)
        );
      });
    },
    notBeforeStartDate(date) {
      let startDate = new Date();
      if (this.leapp_start_date) {
        startDate = new Date(this.leapp_start_date);
      }
      startDate.setHours(0, 0, 0, 0);
      return date < startDate;
    },
    launchFilePicker() {
      this.$refs.file.click();
    },
    async onFileChange(fieldName, files) {
      this.uploadFiles = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          this.uploadFiles.push(files[i]);
        }
      } else {
        this.$bvToast.toast("Please select at least one file to upload", {
          title: "No Files Selected",
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });
      }
    },
    deleteFile(index) {
      this.uploadFiles.splice(index, 1);
    },
    async submitNew() {
      this.submitted = true;
      this.applying = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Application");
      } else {
        const data = {
          leapp_empid: this.getEmployee.emp_id,
          leapp_leave_type: this.leaveType,
          leapp_start_date: this.leapp_start_date,
          leapp_end_date: this.leapp_end_date,
        };
        this.leapp_alt_email
          ? (data["leapp_alt_email"] = this.leapp_alt_email)
          : false;
        this.leapp_alt_phone
          ? (data["leapp_alt_phone"] = this.leapp_alt_phone)
          : false;
        let url = `${this.ROUTES.leaveApplication}/add-leave-application`;
        await this.apiPost(url, data, "Add Leave Application").then(
          async (res) => {
            const { data } = res;
            if (data) {
              const leaveApplicationID = data.leapp_id;
              if (this.uploadFiles.length > 0) {
                url = `${this.ROUTES.leaveDoc}/leave-doc/${leaveApplicationID}`;
                let formData = new FormData();
                await this.uploadFiles.forEach((file) => {
                  formData.append("documents", file);
                });
                await this.apiPost(
                  url,
                  formData,
                  "Upload Leave Supporting Documents Error"
                );
              }
              this.$router.push("/leave-application").then(() => {
                this.apiResponseHandler(
                  "Action Successful",
                  "Leave Application Submitted"
                );
              });
            }
          }
        );
        this.applying = false;
      }
    },
  },
};
</script>
<style>
.cursor-pointer {
  cursor: pointer;
}
.file-uploads {
  padding: 3em;
  border: 1px dashed #1cbb8c;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
}
.file-detail {
  border: 1px solid #ced4da;
  padding: 0.5em 1em;
  border-radius: 5px;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push('/leave-application')"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Leave Applications
      </b-button>
    </div>
    <div class="row mb-3">
      <div
        class="col-lg-3"
        v-for="(leaveAccrual, index) in leaveAccruals"
        :key="index"
      >
        <div
          class="card cursor-pointer"
          @click="leaveType = leaveAccrual.leave.leave_type_id"
        >
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  {{ leaveAccrual.accrual }} Day(s) Accrued
                </p>
                <h5 class="mb-0 text-truncate">
                  {{ leaveAccrual.leave.leave_name }}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <form @submit.prevent="submitNew">
      <div class="row">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Leave Application Details</h5>
              </div>
              <div class="form-group">
                <label> Leave Type <span class="text-danger">*</span> </label>
                <b-form-select
                  id="leave-types"
                  v-model="leaveType"
                  :options="leaveTypes"
                  @change="confirmApplicationType"
                  :class="{
                    'is-invalid': submitted && $v.leaveType.$error,
                  }"
                />
                <small v-if="existingLeaveType" class="text-danger">
                  You have an existing
                  {{ existingLeaveType.LeaveType.leave_name }} application
                </small>
              </div>
              <div class="form-group">
                <label for="start-date">
                  Start Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_start_date"
                  valueType="format"
                  @input="confirmStartDate"
                  placeholder="Select start date"
                  :disabled-date="notBeforeToday"
                  :class="{
                    'is-invalid': submitted && $v.leapp_start_date.$error,
                  }"
                />
                <small v-if="omittedStartDate" class="text-danger">
                  {{ new Date(leapp_start_date).toDateString() }} is already
                  part of a current leave application.
                </small>
              </div>
              <div class="form-group">
                <label for="start-date">
                  End Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_end_date"
                  valueType="format"
                  @input="confirmEndDate"
                  placeholder="Select end date"
                  :disabled-date="notBeforeStartDate"
                  :class="{
                    'is-invalid': submitted && $v.leapp_end_date.$error,
                  }"
                />
                <small v-if="omittedEndDate" class="text-danger">
                  {{ new Date(leapp_end_date).toDateString() }} is already part
                  of a current leave application.
                </small>
              </div>
              <div class="form-group">
                <label for="alt-email"> Emergency Email Address </label>
                <input
                  id="alt-email"
                  type="email"
                  v-model="leapp_alt_email"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="alt-email"> Emergency Phone Number </label>
                <input
                  id="alt-email"
                  type="text"
                  v-model="leapp_alt_phone"
                  class="form-control"
                />
              </div>
              <b-button
                v-if="!applying"
                class="btn btn-success btn-block mt-4"
                type="submit"
                :disabled="
                  omittedStartDate || omittedEndDate || existingLeaveType
                "
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
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card mb-4">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">
                  HR Focal Points for {{ location }}
                </h5>
              </div>
              <div v-if="focalPoints.length > 0">
                <div
                  class="media mb-2"
                  v-for="(focalPoint, index) in focalPoints"
                  :key="index"
                >
                  <img
                    :src="focalPoint.focal_person.emp_passport"
                    width="8%"
                    class="mr-3"
                    alt="profile pic"
                  />
                  <div class="media-body">
                    <h6 class="text-capitalize mt-0 mb-n1">
                      {{ focalPoint.focal_person.emp_first_name }}
                      {{ focalPoint.focal_person.emp_last_name }}
                    </h6>
                    <small class="text-capitalize">
                      {{ focalPoint.focal_person.emp_unique_id }}
                    </small>
                  </div>
                </div>
              </div>
              <div v-else class="alert alert-info">
                There are currently no HR Focal Points for your location.
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Supporting Documents</h5>
              </div>
              <input
                type="file"
                ref="file"
                multiple
                :name="uploadFieldName"
                @change="onFileChange($event.target.name, $event.target.files)"
                style="display: none"
              />
              <div class="file-uploads mb-3" @click="launchFilePicker()">
                <p class="mb-0 text-muted">Click here to upload files</p>
              </div>
              <div v-if="uploadFiles.length > 0">
                <div class="alert alert-info mb-3">
                  You've chosen the following documents to upload. Confirm and
                  upload your selection below.
                </div>
                <div
                  class="file-detail d-flex justify-content-between align-items-center mt-3"
                  v-for="(file, index) in uploadFiles"
                  :key="index"
                >
                  <small>
                    <span>{{ file.name }}</span>
                    <br />
                    <span>{{ file.size | getFileSize }}</span>
                  </small>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="deleteFile(index)"
                  >
                    DEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </Layout>
</template>
