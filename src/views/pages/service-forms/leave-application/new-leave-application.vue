<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
import { required } from "vuelidate/lib/validators";

export default {
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
      submitted: false,
    };
  },
  methods: {
    getLeaveAccruals() {
      let url = `${this.ROUTES.leaveAccrual}/get-leave-acrruals/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Leave Accruals Error").then((res) => {
        console.log({ res });
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
    notBeforeToday(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
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
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Application");
      } else {
        const data = {
          leapp_empid: this.getEmployee.emp_id,
          leapp_leave_type: this.leaveType,
          leapp_start_date: this.leapp_start_date,
          leapp_end_date: this.leapp_end_date,
          leapp_alt_email: this.leapp_alt_email,
          leapp_alt_phone: this.leapp_alt_phone,
        };
        const url = `${this.ROUTES.leaveApplication}/add-leave-application`;
        this.apiPost(url, data, "Add Leave Application").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New leave application Added");
        });
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
                  :class="{
                    'is-invalid': submitted && $v.leaveType.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="start-date">
                  Start Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_start_date"
                  valueType="format"
                  placeholder="Select start date"
                  :disabled-date="notBeforeToday"
                  :class="{
                    'is-invalid': submitted && $v.leapp_start_date.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="start-date">
                  End Date <span class="text-danger">*</span>
                </label>
                <date-picker
                  v-model="leapp_end_date"
                  valueType="format"
                  placeholder="Select end date"
                  :disabled-date="notBeforeStartDate"
                  :class="{
                    'is-invalid': submitted && $v.leapp_end_date.$error,
                  }"
                />
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
          </div>
        </div>
        <div class="col-lg-5">
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
