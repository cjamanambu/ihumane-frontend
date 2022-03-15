<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Manage Employee",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  async mounted() {
    this.fetchEmployee();
    await this.getStates();
    await this.getBanks();
  },

  /*: null,

  : null,
  emp_spouse_name: null,
  emp_spouse_phone_no: null,
  emp_next_of_kin_name: null,
  emp_next_of_kin_address: null,
  emp_next_of_kin_phone_no: null,
  emp_ailments: null,
  emp_blood_group: null,
  emp_genotype: null,
  emp_emergency_name: null,
  emp_emergency_contact: null,
  emp_hire_date: null,
  emp_contract_end_date: null,
  */
  validations: {
    emp_first_name: { required },
    emp_location: { required },
    emp_last_name: { required },
    emp_phone_no: { required },
    emp_state_id: { required },
    emp_lga_id: { required },

    emp_bank_id: { required },
    emp_account_no: { required },
    emp_marital_status: { required },
    //account_number: { required },
  },
  methods: {
    toggleSelected(val) {
      //let {text, value } = val;
      console.log(val);
    },
    positionLabel({ text }) {
      return `${text}`;
    },
    bankLabel({ text }) {
      return `${text}`;
    },
    locationLabel({ text }) {
      return `${text}`;
    },
    fetchEmployee() {
      let employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        const { data } = res;
        //console.log({ data });
        if (data) {
          this.emp_first_name = data.emp_first_name;
          this.emp_last_name = data.emp_last_name;
          this.emp_other_name = data.emp_other_name;
          this.emp_qualification = data.emp_qualification;
          this.emp_location = data.location.location_name;
          this.emp_account_no = data.emp_account_no;
          this.emp_phone_no = data.emp_phone_no;
          this.emp_bank_id_val = data.emp_bank_id;
          this.emp_state_id_val = data.emp_state_id;
          this.emp_lga_id = data.emp_lga_id;
          this.emp_marital_status = data.emp_marital_status;
          this.emp_spouse_name = data.emp_spouse_name;
          this.emp_spouse_phone_no = data.emp_spouse_phone_no;
          this.emp_next_of_kin_name = data.emp_next_of_kin_name;
          this.emp_next_of_kin_address = data.emp_next_of_kin_address;
          this.emp_next_of_kin_phone_no = data.emp_next_of_kin_phone_no;
          this.emp_ailments = data.emp_ailments;
          this.emp_blood_group = data.emp_blood_group;
          this.emp_genotype = data.emp_genotype;
          this.emp_emergency_name = data.emp_emergency_name;
          this.emp_emergency_contact = data.emp_emergency_contact;
        }
      });
    },
    async getBanks() {
      const url = `${this.ROUTES.bank}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        //let selectedObj = [];
        this.banks = [{ value: null, text: "Please select a leave type" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.bank_id,
            text: datum.bank_name,
          };
          if (datum.bank_id === this.emp_bank_id_val) {
            const val = {
              value: datum.bank_id,
              text: datum.bank_name,
            };
            this.emp_bank_id.push(val);
          }
          this.banks.push(dat);
        });
      });
    },
    async getStates() {
      const url = `${this.ROUTES.state}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        this.states = [{ value: null, text: "Please select a State" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.s_id,
            text: datum.s_name,
          };
          if (datum.s_id === this.emp_state_id_val) {
            const val = {
              value: datum.s_id,
              text: datum.s_name,
            };
            this.emp_state_id.push(val);
          }
          this.states.push(dat);
          //console.log("EMP; "+this.emp_state_id);
        });
      });
    },
    async updateEmployee() {
      this.submitted = true;
      let employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.employee}/update-employee/${employeeID}`;
      const data = {
        emp_first_name: this.emp_first_name,
        emp_last_name: this.emp_last_name,
        emp_other_name: this.emp_other_name,
        emp_qualification: this.emp_qualification,
        emp_phone_no: this.emp_phone_no,
        emp_account_no: this.emp_account_no,

        emp_bank_id: this.emp_bank_id.value,
        emp_state_id: this.emp_state_id.value,

        emp_lga_id: this.emp_lga_id,
        emp_marital_status: this.emp_marital_status,
        emp_spouse_name: this.emp_spouse_name,
        emp_spouse_phone_no: this.emp_spouse_phone_no,
        emp_next_of_kin_name: this.emp_next_of_kin_name,
        emp_next_of_kin_address: this.emp_next_of_kin_address,
        emp_next_of_kin_phone_no: this.emp_next_of_kin_phone_no,
        emp_ailments: this.emp_ailments,
        emp_blood_group: this.emp_blood_group,
        emp_genotype: this.emp_genotype,
        emp_emergency_name: this.emp_emergency_name,
        emp_emergency_contact: this.emp_emergency_contact,
        emp_contract_end_date: this.emp_contract_end_date,
        emp_hire_date: this.emp_hire_date,
      };
      this.apiPatch(url, data, "Update Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Update");
      this.fetchEmployee();
      this.submitted = false;
      this.fetchEmployee();
    },

    async suspendEmployee() {
      this.submitted = true;
      let employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.employee}/suspend-employee/${employeeID}`;
      const data = {
        emp_suspension_reason: this.emp_suspension_reason,
      };
      this.apiPatch(url, data, "Suspend Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Suspended");
      this.$refs["deactivate-employee"].hide();
      this.fetchEmployee();
      this.submitted = false;
      this.fetchEmployee();
    },
    resetForm() {
      this.emp_suspension_reason = null;


    test() {
      console.log(this.bank);

    },
  },
  data() {
    return {
      title: "Manage Employee",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Employee",
          active: true,
        },
      ],
      submitted: false,
      emp_first_name: null,
      emp_location: null,
      emp_last_name: null,
      emp_other_name: null,
      emp_qualification: null,
      emp_phone_no: null,
      emp_account_no: null,
      emp_bank_id: [],
      emp_bank_id_val: null,
      emp_state_id_val: null,
      emp_state_id: [],

      emp_lga_id: null,
      emp_marital_status: null,
      emp_spouse_name: null,
      emp_spouse_phone_no: null,
      emp_next_of_kin_name: null,
      emp_next_of_kin_address: null,
      emp_next_of_kin_phone_no: null,
      emp_ailments: null,
      emp_blood_group: null,
      emp_genotype: null,
      emp_emergency_name: null,
      emp_emergency_contact: null,

      emp_suspension_reason: null,

      emp_hire_date: null,
      emp_contract_end_date: null,

      maritalStatus: [
        { value: null, text: "select marital Status" },
        { value: 1, text: "Married" },
        { value: 2, text: "Not Married" },
      ],
      bank: null,
      banks: [],
      state: null,
      states: [],
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success mr-3"
        @click="$router.push({ name: 'manage-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Manage Employees
      </b-button>


      <b-button
          class="btn btn-danger"
          @click="$refs['deactivate-employee'].show()"
      >
        <i class="mdi mdi-minus mr-2"></i>
       Deactivate Employee
       </b-button>

      <b-button
        class="btn btn-primary"
        @click="
          $router.push({
            name: 'employee-documents',
            params: { employeeID: $route.params.employeeID },
          })
        "
      >
        <i class="mdi mdi-plus mr-2"></i>
        Manage Documents

      </b-button>
    </div>


    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent>
              <div class="row">
                <div class="col-lg-6">
                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Personal Information</h5>
                  </div>
                  <div class="form-group">
                    <label for=""> First Name </label>
                    <input
                      readonly
                      type="text"
                      class="form-control"
                      v-model="emp_first_name"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Other Name </label>
                    <input
                      readonly
                      type="text"
                      class="form-control"
                      v-model="emp_other_name"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Last Name </label>
                    <input
                      readonly
                      type="text"
                      class="form-control"
                      v-model="emp_last_name"
                    />
                  </div>
                  <div class="form-group">
                    <label for=""> Phone Number </label>
                    <input
                      type="text"
                      required
                      class="form-control"
                      v-model="emp_phone_no"
                    />
                  </div>
                  <div class="form-group">
                    <label for=""> Location </label>
                    <input
                      readonly
                      type="text"
                      class="form-control"
                      v-model="emp_location"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Qualification </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_qualification"
                    />
                  </div>

                  <div class="form-group">
                    <label>State Of Origin</label>
                    <multiselect
                      v-model="emp_state_id"
                      :options="states"
                      :custom-label="locationLabel"
                      :class="{
                        'is-invalid': submitted && $v.emp_state_id.$error,
                      }"
                    ></multiselect>
                  </div>
                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">
                      Bank Information -- For Salary Disbursement
                    </h5>
                  </div>
                  <div class="form-group">
                    <label>Bank</label>
                    <multiselect
                      v-model="emp_bank_id"
                      :options="banks"
                      :custom-label="bankLabel"
                      @select="toggleSelected"
                      :class="{
                        'is-invalid': submitted && $v.emp_bank_id.$error,
                      }"
                    >
                    </multiselect>
                  </div>

                  <div class="form-group">
                    <label for=""> Account Number </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_account_no"
                    />
                  </div>
                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Marital Information</h5>
                  </div>
                  <div class="form-group">
                    <label>Marital Status</label>
                    <b-form-select
                      v-model="emp_marital_status"
                      :options="maritalStatus"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Spouse Name </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_spouse_name"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Spouse Contact (Phone No) </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_spouse_phone_no"
                    />
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Health Information</h5>
                  </div>
                  <div class="form-group">
                    <label for=""> Blood Group </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_blood_group"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Genotype </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_genotype"
                    />
                  </div>

                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Next of Kin Details</h5>
                  </div>
                  <div class="form-group">
                    <label for=""> Next of Kin Name </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_next_of_kin_name"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Next of Kin Address </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_next_of_kin_address"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Next of Kin Phone No </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_next_of_kin_phone_no"
                    />
                  </div>

                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Emergency Contact Details</h5>
                  </div>
                  <div class="form-group">
                    <label for=""> Name </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_emergency_name"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Contact </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="emp_emergency_contact"
                    />
                  </div>

                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Contract Details</h5>
                  </div>
                  <div class="form-group">
                    <label for=""> Hire Date </label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="emp_hire_date"
                    />
                  </div>

                  <div class="form-group">
                    <label for=""> Contract End Date </label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="emp_contract_end_date"
                    />
                  </div>
                </div>
              </div>

              <b-button
                v-if="!submitted"
                type="submit"
                class="btn btn-success btn-block mt-4"
                @click="updateEmployee"
              >
                Update Employee
              </b-button>
              <b-button v-else disabled class="btn btn-success btn-block mt-4">
                Updating...
              </b-button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <b-modal
        ref="deactivate-employee"
        title="Deactivate Employee"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
    >
      <form @submit.prevent="suspendEmployee">
        <div class="form-group">
          <label for="suspensionReason">
            Suspension Reason <span class="text-danger">*</span>
          </label>
          <textarea
              id="suspensionReason"
              type="text"
              v-model="emp_suspension_reason"
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
      </form>
    </b-modal>
  </Layout>
</template>
