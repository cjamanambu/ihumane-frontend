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
    await this.fetchEmployee();
    await this.getStates();
    await this.getBanks();
    await this.getJobRoles();
    await this.getLocalGovernmentAreasByStateId();
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
    stateOfOriginLabel({ text }) {
      return `${text}`;
    },
    lGALabel({ text }) {
      return `${text}`;
    },
    async fetchEmployee() {
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
          this.job_role_id = data.emp_job_role_id;
          this.gender = data.emp_sex;
          this.birth_date = new Date(data.emp_dob).toISOString().slice(0, 10);
          this.emp_contract_end_date = new Date(data.emp_contract_end_date)
            .toISOString()
            .slice(0, 10);
          this.emp_hire_date = new Date(data.emp_hire_date)
            .toISOString()
            .slice(0, 10);
        }
      });
    },
    async getJobRoles() {
      this.apiGet(this.ROUTES.jobRole, "Get Job Roles Error").then((res) => {
        const { data } = res;
        data.forEach(async (datum) => {
          const dat = {
            value: datum.job_role_id,
            text: datum.job_role,
          };
          if (datum.job_role_id === this.job_role_id) {
            const val = {
              value: datum.job_role_id,
              text: datum.job_role,
            };
            this.job_role.push(val);
          }
          this.job_roles.push(dat);
        });

        //this.jrs = data;
      });
    },
    async getBanks() {
      const url = `${this.ROUTES.bank}`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        this.banks = [{ value: null, text: "Please select from the list" }];
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
        });
      });
    },
     getLocalGovernmentAreasByStateId() {
      let stateId = this.emp_state_id.value;
      const url = `${this.ROUTES.localGovernment}/${stateId}`;
       this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        this.lgas = [{ value: null, text: "Please select LGA" }];
        data.forEach( (datum) => {
          const dat = {
            value: datum.lg_id,
            text: datum.lg_name,
          };
          if (datum.lg_id === this.emp_lga_id) {
            const val = {
              value: datum.lg_id,
              text: datum.lg_name,
            };
            this.lga.push(val);
          }
          this.lgas.push(dat);
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

        emp_bank_id: this.emp_bank_id[0].value,
        //emp_state_id: this.emp_state_id.value,
        //emp_job_role_id:this.job_role[0].value,
        emp_lga_id: this.lga[0].value,
        emp_religion: this.religion,

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
        emp_dob: this.birth_date,

        emp_sex: this.gender,
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
    },

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
      job_role: [],
      job_roles: [],
      job_role_id: null,

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
      emp_bvn:null,
      emp_suspension_reason: null,
      emp_office_email: null,
      emp_personal_email: null,
      emp_hire_date: null,
      emp_contract_end_date: null,

      maritalStatus: [
        { value: null, text: "select marital Status" },
        { value: 1, text: "Married" },
        { value: 2, text: "Not Married" },
      ],
      gender_options: [
        { value: null, text: "Please select gender" },
        { value: "1", text: "Male" },
        { value: "2", text: "Female" },
      ],
      gender: null,
      religion_options: [
        { value: null, text: "Please select religion" },
        { value: "1", text: "Christianity" },
        { value: "2", text: "Islam" },
        { value: "3", text: "Hinduism" },
        { value: "3", text: "Buddhism" },
      ],
      religion: null,
      bank: null,
      banks: [],
      state: null,
      states: [],
      lgas: [],
      jrs: [],
      lga: [],
      stateId: null,
      birth_date: null,
      selectedStateId: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">  <!--@click="$router.push({ name: 'manage-employees' })"-->
                  <div class="d-flex" style="cursor: pointer;" @click="$router.push({name: 'employee-documents',
              params: { employeeID: $route.params.employeeID },})">
                    <div class="avatar-sm me-3 mr-1">
                        <span class="avatar-title bg-light rounded-circle text-primary font-size-24">
                            <i class="ri-upload-cloud-2-fill"></i>
                        </span>
                    </div>
                    <div class="flex-1 align-self-center overflow-hidden">
                      <h5>Upload Documents</h5>
                      <p>Upload employee documents</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex mt-4 mt-md-0" style="cursor: pointer;" @click="
                      $router.push({
                        name: 'employee-work-experience',
                        params: { employeeID: $route.params.employeeID },
                      })
                    ">
                    <div class="avatar-sm me-3">
                        <span class="avatar-title bg-light rounded-circle text-primary font-size-24">
                            <i class="ri-heart-add-fill"></i>
                        </span>
                    </div>
                    <div class="flex-1 align-self-center overflow-hidden" >
                      <h5>Work Experience</h5>
                      <p class="text-muted mb-0">Mange employee work experience log.</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex mt-4 mt-md-0" style="cursor:pointer;"  @click="
                      $router.push({
                        name: 'employee-education',
                        params: { employeeID: $route.params.employeeID },
                      })
                    ">
                    <div class="avatar-sm me-3">
                        <span class="avatar-title bg-light rounded-circle text-primary font-size-24">
                            <i class="ri-book-2-fill"></i>
                        </span>
                    </div>
                    <div class="flex-1 align-self-center overflow-hidden">
                      <h5>Education</h5>
                      <p class="text-muted mb-0">Employee education background log</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 col-3">
                <div class="tab-content" id="v-pills-tabContent">
                  <div class="tab-pane fade show active" id="product-1" role="tabpanel">
                    <div class="product-img">
                      <img src="https://i.pravatar.cc/300" alt="img-1" class="img-fluid mx-auto d-block" data-zoom="assets/images/product/img-1.png">
                    </div>
                  </div>
                </div>
                <div class="row text-center mt-2">
                  <div class="col-sm-6">
                    <div class="d-grid">
                      <button type="button" @click="$refs['deactivate-employee'].show()" class="btn btn-danger waves-effect waves-light mt-2">
                        <i class="mdi mdi-cancel me-2"></i> Deactivate
                      </button>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="d-grid">
                      <button type="button" @click="$refs['update-employee-profile'].show()"  class="btn btn-light waves-effect  mt-2 waves-light">
                        <i class="mdi mdi-pencil me-2"></i> Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-8 ml-2">
                <div class="mt-4 mt-xl-3">
                  <a href="#" class="text-primary">{{ emp_location }}</a>
                  <h5 class="mt-1 mb-3">{{ emp_first_name }} {{emp_last_name}} {{emp_other_name}}</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Hire Date: </span>{{ emp_hire_date }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Birth Date: </span>{{ birth_date }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Office Email: </span>{{ emp_office_email }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Personal Email: </span>{{ emp_personal_email }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Mobile No.: </span>{{ emp_phone_no }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Qualification: </span>{{ emp_qualification }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">State: </span>{{ emp_state_id_val }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">LGA: </span>{{ emp_lga_id }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Marital Status: </span>officeemail</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Ailment: </span>{{ emp_ailments }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Gender: </span>{{ gender }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Religion: </span>{{ religion }}</span></h5>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Department: </span>{{ department }}</span>
                      </h5>
                    </div>
                    <div class="col-md-6">
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Grade Level: </span>{{ grade }}</span></h5>
                    </div>
                  </div>
                  <hr class="my-4">

                  <div class="row">
                    <div class="col-md-6">
                      <div>
                        <h5 class="font-size-14 text-uppercase mt-3"> Health Information</h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Blood Group: </span>{{ emp_blood_group }}</span></h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Geno-type: </span>{{ emp_genotype }}</span></h5>

                         <h5 class="font-size-14 text-uppercase mt-3"> Emergency Contact Details</h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Name: </span>{{ emp_emergency_name }}</span></h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Contact: </span>{{ emp_emergency_contact }}</span></h5>

                        <h5 class="font-size-14 text-uppercase mt-3"> Contract Details</h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Hire Date: </span>{{ emp_hire_date }}</span></h5>
                          <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">End Date: </span>{{ emp_contract_end_date }}</span></h5>

                        <h5 class="font-size-14 text-uppercase mt-3">Marital Information:</h5>
                        <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Marital Status: </span>{{ maritalStatus }}</span></h5>
                        <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Spouse Name: </span>{{ emp_spouse_name }}</span></h5>
                        <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Contact No.: </span>{{ emp_spouse_phone_no }}</span></h5>

                      </div>
                    </div>

                    <div class="col-md-6">
                      <h5 class="font-size-14 text-uppercase mt-3">Next of Kin:</h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Name: </span>{{ emp_next_of_kin_name }}</span></h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Address: </span>{{ emp_next_of_kin_address }}</span></h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Phone No.: </span>{{ emp_next_of_kin_phone_no }}</span></h5>

                      <h5 class="font-size-14 text-uppercase mt-3">Bank Information:</h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Account Name: </span></span></h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Account No.: </span>personal</span></h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">BVN.: </span>personal</span></h5>
                      <h5 class="mt-2"> <span class="text-success font-size-12 ms-2"> <span class="text-muted">Bank.: </span>personal</span></h5>

                    </div>

                  </div>
                </div>
              </div>
            </div>
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

    <b-modal
      ref="update-employee-profile"
      title="Edit Profile"
      hide-footer
      centered
      title-class="font-18"
      size="xl"
      @hidden="resetForm"
    >
      <div class="modal-dialog modal-xl">
        <form @submit.prevent>
          <div class="row">
            <div class="col-lg-6">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Personal Information</h5>
              </div>
              <div class="form-group">
                <label for=""> First Name </label>
                <input
                  type="text"
                  class="form-control"
                  v-model="emp_first_name"
                  placeholder="First Name"
                />
              </div>

              <div class="form-group">
                <label for=""> Other Name </label>
                <input
                  type="text"
                  class="form-control"
                  v-model="emp_other_name"
                  placeholder="Other Name"
                />
              </div>

              <div class="form-group">
                <label for=""> Last Name </label>
                <input
                  type="text"
                  class="form-control"
                  v-model="emp_last_name"
                  placeholder="Last Name"
                />
              </div>
              <div class="form-group">
                <label for=""> Date of Birth </label>
                <input
                  type="date"
                  class="form-control"
                  v-model="birth_date"
                />
              </div>
              <div class="form-group">
                <label for=""> Phone Number </label>
                <input
                  type="text"
                  required
                  class="form-control"
                  v-model="emp_phone_no"
                  placeholder="Phone Number"
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
                <label>Gender</label>
                <b-select
                  v-model="gender"
                  :options="gender_options"
                  :class="{
                        'is-invalid': submitted && $v.gender.$error,
                      }"
                ></b-select>
              </div>
              <div class="form-group">
                <label>Religion</label>
                <b-select
                  v-model="religion"
                  :options="religion_options"
                  :class="{
                        'is-invalid': submitted && $v.religion.$error,
                      }"
                ></b-select>
              </div>
              <div class="form-group">
                <label>Job Role</label>
                <multiselect
                  v-model="job_role"
                  :options="job_roles"
                  :custom-label="locationLabel"
                  :class="{
                        'is-invalid': submitted && $v.job_role.$error,
                      }"
                ></multiselect>
              </div>
              <div class="form-group">
                <label>State Of Origin</label>
                <multiselect
                  v-model="emp_state_id"
                  :options="states"
                  :custom-label="stateOfOriginLabel"
                  @input="getLocalGovernmentAreasByStateId"
                  :class="{
                        'is-invalid': submitted && $v.emp_state_id.$error,
                      }"
                ></multiselect>
              </div>
              <div class="form-group">
                <label>LGA</label>
                <multiselect
                  v-model="lga"
                  :options="lgas"
                  :custom-label="lGALabel"
                  :class="{
                        'is-invalid': submitted && $v.emp_state_id.$error,
                      }"
                ></multiselect>
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
                  placeholder="Account Number"
                />
              </div>
              <div class="form-group">
                <label for=""> BVN </label>
                <input
                  type="text"
                  class="form-control"
                  v-model="emp_bvn"
                  placeholder="BVN"
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
    </b-modal>
  </Layout>
</template>
