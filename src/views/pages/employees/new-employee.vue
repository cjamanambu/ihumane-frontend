<script>
import { FormWizard, TabContent } from "vue-form-wizard";
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
export default {
  page: {
    title: "New Employee",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, FormWizard, TabContent },
  mounted() {
    this.fetchLocations();
    this.fetchPositions();
    this.fetchBanks();
  },
  validations: {
    location: { required },
    position: { required },
    bank: { required },
    employee_number: { required },
    first_name: { required },
    last_name: { required },

    personal_email: { required },
    official_email: { required },
    telephone: { required },
    account_number: { required },
  },
  methods: {
    resetForm() {
      this.first_name = null;
      this.last_name = null;
      this.other_name = null;
      this.employee_number = null;
      this.personal_email = null;
      this.official_email = null;
      this.location = null;
      this.position = null;
      this.account_number = null;
      this.bank = null;
      this.telephone = null;
    },
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Location Error").then((res) => {
        this.locations = [{ value: null, text: "Please select a location" }];
        const { data } = res;
        data.forEach((location) => {
          this.locations.push({
            value: location.location_id,
            text: location.location_name,
          });
        });
      });
    },
    fetchPositions() {
      this.apiGet(this.ROUTES.jobRole, "Get Position Error").then((res) => {
        this.positions = [{ value: null, text: "Please select a position" }];
        const { data } = res;
        data.forEach((position) => {
          this.positions.push({
            value: position.job_role_id,
            text: position.job_role,
          });
        });
      });
    },
    fetchBanks() {
      this.apiGet(this.ROUTES.bank, "Get Bank Error").then((res) => {
        this.banks = [{ value: null, text: "Please select a bank" }];
        const { data } = res;
        data.forEach((bank) => {
          this.banks.push({
            value: bank.bank_id,
            text: bank.bank_name,
          });
        });
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Employee");
      } else {
        const data = {
          first_name: this.first_name,
          last_name: this.last_name,
          unique_id: this.employee_number,
          personal_email: this.personal_email,
          office_email: this.official_email,
          location: this.location,
          job_role: this.position,
          account_no: this.account_number,
          bank: this.bank,
          phone_no: this.telephone,
        };
        const url = `${this.ROUTES.employee}/employee-enrollment`;
        this.apiPost(url, data, "Employee Enrollment Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Employee Enrolled");
          this.$v.$reset();
          this.resetForm();
        });
      }
    },
    onComplete: function () {
      this.submitNew();
    },
  },
  data() {
    return {
      submitting: false,
      title: "New Employee",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "New Employee",
          active: true,
        },
      ],
      location: null,
      position: null,
      bank: null,
      locations: [{ value: null, text: "Please select a location" }],
      positions: [],
      banks: [{ value: null, text: "Please Select a Bank" }],
      employee_number: null,
      first_name: null,
      last_name: null,
      other_name: null,
      personal_email: null,
      official_email: null,
      telephone: null,
      account_number: null,
      submitted: false,
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
        @click="$router.push({ name: 'manage-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Manage Employees
      </b-button>
    </div>

    <div class="row">
      <div class="col-xl-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">New Employee</h4>
            <form-wizard color="#556ee6" @on-complete="onComplete">
              <tab-content icon="mdi mdi-account-circle">
                <div class="row">
                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName"
                        >Employee ID</label
                      >
                      <div class="col-md-9">
                        <input
                          id="employeeNumber"
                          type="text"
                          v-model="employee_number"
                          class="form-control"
                          name="employeeNumber"
                          placeholder="Employee Number"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="personalEmail"
                        >Personal Email</label
                      >
                      <div class="col-md-9">
                        <input
                          id="personalEmail"
                          type="email"
                          v-model="personal_email"
                          class="form-control"
                          name="personalEmail"
                          placeholder="Personal Email"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName"
                        >Official Email</label
                      >
                      <div class="col-md-9">
                        <input
                          id="officialEmail"
                          type="email"
                          v-model="official_email"
                          class="form-control"
                          name="officialEmail"
                          placeholder="Official Email"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName"
                        >First name</label
                      >
                      <div class="col-md-9">
                        <input
                          id="firstName"
                          type="text"
                          class="form-control"
                          name="firstName"
                          v-model="first_name"
                          placeholder="First Name"
                        />
                      </div>
                    </div>
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="lastName"
                        >Last name</label
                      >
                      <div class="col-md-9">
                        <input
                          id="lastName"
                          type="text"
                          class="form-control"
                          name="lastName"
                          v-model="last_name"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName"
                        >Telephone</label
                      >
                      <div class="col-md-9">
                        <input
                          id="telephone"
                          type="text"
                          class="form-control"
                          v-model="telephone"
                          name="telephone"
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- end col -->
                </div>
                <!-- end row -->
              </tab-content>
              <tab-content icon="mdi mdi-face-profile">
                <div class="row">
                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName"
                        >Position</label
                      >
                      <div class="col-md-9">
                        <b-form-select
                          id="position"
                          v-model="position"
                          :options="positions"
                          :class="{
                            'is-invalid': submitted && $v.position.$error,
                          }"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName"
                        >Bank</label
                      >
                      <div class="col-md-9">
                        <b-form-select
                          id="bank"
                          v-model="bank"
                          :options="banks"
                          :class="{
                            'is-invalid': submitted && $v.bank.$error,
                          }"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName"
                        >Location</label
                      >
                      <div class="col-md-9">
                        <b-form-select
                          id="location"
                          v-model="location"
                          :options="locations"
                          :class="{
                            'is-invalid': submitted && $v.location.$error,
                          }"
                        />
                      </div>
                    </div>
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="lastName"
                        >NUBAN</label
                      >
                      <div class="col-md-9">
                        <input
                          id="nuban"
                          type="text"
                          v-model="account_number"
                          class="form-control"
                          name="nuban"
                          placeholder="Account Number"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- end col -->
                </div>
                <!-- end row -->
              </tab-content>
              <tab-content icon="mdi mdi-checkbox-marked-circle-outline">
                <div class="row">
                  <div class="col-12">
                    <div class="text-center">
                      <h2 class="mt-0">
                        <i class="mdi mdi-check-all"></i>
                      </h2>
                      <h3 class="mt-0">Thank you !</h3>

                      <p class="w-75 mb-2 mx-auto">All Good.</p>

                      <div class="mb-3">
                        <div class="custom-control custom-checkbox">
                          <input
                            id="customCheck1"
                            type="checkbox"
                            class="custom-control-input"
                          />
                          <label class="custom-control-label" for="customCheck1"
                            >I agree with the Terms and Conditions</label
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- end col -->
                </div>
                <!-- end row -->
              </tab-content>
            </form-wizard>
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
  </Layout>
</template>
