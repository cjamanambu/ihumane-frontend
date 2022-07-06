<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import Multiselect from "vue-multiselect";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("ONBOARD_EMPLOYEE")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Edit Employee",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, Multiselect },
  mounted() {
    //let employeeId = this.$route.params.employeeID;
    this.fetchEmployee();
    this.getStates();
    this.getBanks();
    this.getJobRoles();
    this.getLocations();
    this.getPensionProviders();
    this.getLocalGovernmentAreas();
    this.getSectors();
    this.getEmployees();
    this.getOperationUnits();
    this.getReportingEntities();
    this.getFunctionalArea();
  },
  validations: {
    location: { required },
    position: { required },
    bank: { required },
    employee_number: { required },
    first_name: { required },
    last_name: { required },

    // emp_ailments: { required },
    //emp_blood_group: { required },
    telephone: { required },
    account_number: { required },
  },
  methods: {
    getEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        const { data } = res;
        //console.log( data );
        data.forEach((employee) => {
          const emp = {
            value: employee.emp_id,
            text: `${employee.emp_unique_id} ${employee.emp_first_name} ${employee.emp_last_name}`,
          };
          this.employees.push(emp);
        });
      });
    },
    getLocations() {
      const url = `${this.ROUTES.location}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.locations = [{ value: null, text: "Please select location" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.location_id,
            text: datum.location_name,
          };
          if (parseInt(datum.location_id) === parseInt(this.location_id)) {
            const val = {
              value: datum.location_id,
              text: datum.location_name,
            };
            this.location.push(val);
          }
          this.locations.push(dat);
        });
      });
    },
    getOperationUnits() {
      const url = `${this.ROUTES.employee}/get-d-codes/d4`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.d4_list = [{ value: null, text: "Please select D4" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.ou_id,
            text: datum.ou_name,
          };
          if (parseInt(datum.ou_id) === parseInt(this.d4_id)) {
            const val = {
              value: datum.ou_id,
              text: datum.ou_name,
            };
            this.selected_d4.push(val);
          }
          this.d4_list.push(dat);
        });
      });
    },
    getReportingEntities() {
      const url = `${this.ROUTES.employee}/get-d-codes/d5`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.d5_list = [{ value: null, text: "Please select D5" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.re_id,
            text: datum.re_name,
          };
          if (parseInt(datum.re_id) === parseInt(this.d5_id)) {
            const val = {
              value: datum.re_id,
              text: datum.re_name,
            };
            this.selected_d5.push(val);
          }
          this.d5_list.push(dat);
        });
      });
    },
    getFunctionalArea() {
      const url = `${this.ROUTES.employee}/get-d-codes/d6`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.d6_list = [{ value: null, text: "Please select D6" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.fa_id,
            text: datum.fa_name,
          };
          if (parseInt(datum.fa_id) === parseInt(this.d6_id)) {
            const val = {
              value: datum.fa_id,
              text: datum.fa_name,
            };
            this.selected_d6.push(val);
          }
          this.d6_list.push(dat);
        });
      });
    },
    async updateEmployee() {
      this.submitted = true;
      let employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.employee}/update-employee-backoffice/${employeeID}`;
      const data = {
        emp_first_name: this.emp_first_name,
        emp_last_name: this.emp_last_name,
        emp_other_name: this.emp_other_name,
        emp_personal_email: this.emp_personal_email,
        emp_office_email: this.emp_office_email,
        emp_qualification: this.emp_qualification,
        emp_phone_no: this.emp_phone_no,
        emp_account_no: this.emp_account_no,

        emp_state_id: this.state.value,
        emp_lga_id: this.lga.value,
        emp_bank_id: this.emp_bank_id.value,
        emp_pension_id: this.pensionProvider.value,
        emp_religion: this.religion,
        emp_nhf: this.emp_nhf,
        emp_location_id: this.location.value,
        emp_job_role_id: this.job_role.value,

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
        emp_bvn: this.emp_bvn,
        emp_sex: this.gender,

        emp_pension: this.emp_pension,
        emp_pension_no: this.emp_pension_no,
        emp_paye_no: this.emp_paye,
        emp_nin: this.emp_nin,
        emp_department_id: this.sector.value,

        emp_d4: this.selected_d4.value,
        emp_d5: this.selected_d5.value,
        emp_d6: this.selected_d6.value,
        emp_d7: this.d7,
      };
      //console.log(data)
      this.apiPatch(url, data, "Update Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Update");
      this.fetchEmployee();
      this.submitted = false;
      this.fetchEmployee();
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
    pensionLabel({ text }) {
      return `${text}`;
    },
    stateOfOriginLabel({ text }) {
      return `${text}`;
    },
    lGALabel({ text }) {
      return `${text}`;
    },
    getBanks() {
      const url = `${this.ROUTES.bank}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.banks = [{ value: null, text: "Please select from the list" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.bank_id,
            text: datum.bank_name,
          };
          if (parseInt(datum.bank_id) === parseInt(this.emp_bank_id_val)) {
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
    async fetchEmployee() {
      let employeeID = this.$route.params.employeeID;
      const url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        const { data } = res;
        //console.log({ data });
        if (data) {
          //console.log('State ID: '+ data.emp_state_id);
          this.emp_first_name = data.emp_first_name;
          this.emp_last_name = data.emp_last_name;
          this.emp_other_name = data.emp_other_name;
          this.emp_qualification = data.emp_qualification;
          this.emp_location = data.location?.location_name;
          this.location_id = data.location?.location_id;
          this.emp_account_no = data.emp_account_no;
          this.emp_phone_no = data.emp_phone_no;
          this.emp_bank_id_val = data.emp_bank_id;
          this.emp_state_id = data.emp_state_id;
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
          this.emp_t7 = data.emp_unique_id;
          this.emp_account_status = data.emp_status;
          this.emp_bvn = data.emp_bvn;
          this.religion = data.emp_religion;
          this.emp_pension = data.emp_pension;
          this.emp_pension_no = data.emp_pension_no;
          this.pension_provider_id = data.emp_pension_id;
          this.emp_paye = data.emp_paye_no;
          this.emp_passport = data.emp_passport;
          this.emp_sector = data.sector?.department_id;
          this.emp_sector_text = data.sector?.department_name;
          this.d4_id = data.emp_d4;
          this.d5_id = data.emp_d5;
          this.d6_id = data.emp_d6;
          this.d7 = data.emp_d7;
          //console.log("D4 Selected: "+this.selected_d4)
          switch (parseInt(data.emp_religion)) {
            case 1:
              this.religion_text = "Christianity";
              break;
            case 2:
              this.religion_text = "Islam";
              break;
            case 3:
              this.religion_text = "Hinduism";
              break;
            case 4:
              this.religion_text = "Buddhism";
              break;
          }
          this.emp_personal_email = data.emp_personal_email;
          this.emp_office_email = data.emp_office_email;
          this.bank_text = data.bank?.bank_name;
          this.state_text = data.state?.s_name;
          this.pension_provider_text = data.pension?.provider_name;
          this.emp_nhf = data.emp_nhf;
          this.job_role_text = data.jobrole?.job_role;
          this.lga_text = data.lga?.lg_name;
          this.birth_date = new Date(data.emp_dob).toISOString().slice(0, 10);
          this.emp_contract_end_date = new Date(data.emp_contract_end_date)
            .toISOString()
            .slice(0, 10);
          this.emp_hire_date = new Date(data.emp_hire_date)
            .toISOString()
            .slice(0, 10);
          this.emp_nin = data.emp_nin;
        }
      });
    },
    getSectors() {
      this.apiGet(this.ROUTES.department, "Get Job Roles Error").then((res) => {
        const { data } = res;
        //console.log({data});
        data.departments.forEach(async (datum) => {
          const dat = {
            value: datum.department_id,
            text: `${datum.d_t3_code} - ${datum.department_name}`,
          };
          if (parseInt(datum.department_id) === parseInt(this.emp_sector)) {
            const val = {
              value: datum.department_id,
              text: `${datum.d_t3_code} - ${datum.department_name}`,
            };
            this.sector.push(val);
          }
          this.sectors.push(dat);
        });
      });
    },
    getJobRoles() {
      this.apiGet(this.ROUTES.jobRole, "Get Job Roles Error").then((res) => {
        const { data } = res;
        //console.log({data});
        data.forEach(async (datum) => {
          const dat = {
            value: datum.job_role_id,
            text: datum.job_role,
          };
          if (parseInt(datum.job_role_id) === parseInt(this.job_role_id)) {
            const val = {
              value: datum.job_role_id,
              text: datum.job_role,
            };
            this.job_role.push(val);
          }
          this.job_roles.push(dat);
        });
      });
    },
    getPensionProviders() {
      this.apiGet(
        this.ROUTES.pensionProvider,
        "Get Pension providers Error"
      ).then((res) => {
        const { data } = res;
        //console.log(data);
        data.forEach(async (datum) => {
          const dat = {
            value: datum.pension_provider_id,
            text: datum.provider_name,
          };
          if (
            parseInt(datum.pension_provider_id) ===
            parseInt(this.pension_provider_id)
          ) {
            const val = {
              value: datum.pension_provider_id,
              text: datum.provider_name,
            };
            this.pensionProvider.push(val);
          }
          this.pensionProviders.push(dat);
        });

        //this.jrs = data;
      });
    },
    getStates() {
      const url = `${this.ROUTES.state}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        this.states = [{ value: null, text: "Please select a State" }];
        data.forEach(async (datum) => {
          const dat = {
            value: datum.s_id,
            text: datum.s_name,
          };
          if (parseInt(datum.s_id) === parseInt(this.emp_state_id)) {
            const val = {
              value: datum.s_id,
              text: datum.s_name,
            };
            this.state.push(val);
          }
          this.states.push(dat);
        });
      });
    },
    getLocalGovernmentAreas() {
      const url = `${this.ROUTES.localGovernment}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        this.lgas = [{ value: null, text: "Please select LGA" }];
        data.forEach((datum) => {
          const dat = {
            value: datum.lg_id,
            text: datum.lg_name,
          };
          if (parseInt(datum.lg_id) === parseInt(this.emp_lga_id)) {
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
    getLocalGovernmentAreasByStateId() {
      let stateId = this.emp_state_id.value;
      const url = `${this.ROUTES.localGovernment}/${stateId}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        this.lgas = [{ value: null, text: "Please select LGA" }];
        data.forEach((datum) => {
          const dat = {
            value: datum.lg_id,
            text: datum.lg_name,
          };
          if (parseInt(datum.lg_id) === parseInt(this.emp_lga_id)) {
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
    onComplete: function () {
      this.submitNew();
    },
  },
  data() {
    return {
      submitting: false,
      title: "Edit Employee",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Edit Employee",
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

      state: [],
      states: [],

      d7: null,
      d4_list: [],
      d4_id: null,
      selected_d4: [],

      d5_list: [],
      d5_id: null,
      selected_d5: [],

      d6_list: [],
      d6_id: null,
      selected_d6: [],

      state_id: null,

      job_role: [],
      job_roles: [],

      job_role_id: null,
      bank_text: null,
      lga_text: null,
      state_text: null,
      job_role_text: null,
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
      emp_bvn: null,
      emp_suspension_reason: null,
      emp_office_email: null,
      emp_personal_email: null,
      emp_hire_date: null,
      emp_contract_end_date: null,
      emp_grade_level: null,
      emp_passport: null,
      emp_t7: null,
      emp_account_status: null,
      locations: [],
      location: [],
      location_id: null,

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
        { value: "4", text: "Buddhism" },
      ],
      pension_options: [
        { value: null, text: "Pensionable?" },
        { value: "1", text: "Yes" },
        { value: "2", text: "No" },
      ],
      religion: null,
      religion_text: null,
      emp_pension: null,
      emp_pension_no: null,
      emp_paye: null,
      bank: null,
      banks: [],
      emp_sector: null,
      emp_sector_text: null,
      sectors: [],
      sector: [],
      employees: [],
      selectedEmployee: [],

      pensionProviders: [],
      pensionProvider: [],
      pension_provider_id: null,
      lgas: [],
      jrs: [],
      lga: [],
      stateId: null,
      birth_date: null,
      selectedStateId: null,
      selectedPensionProvider: null,
      emp_nhf: null,
      pension_provider_text: null,
      emp_nin: null,
      employeeId: null,
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
            <h4 class="card-title">Edit Employee</h4>
              <form @submit.prevent="updateEmployee">
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
                      <label for=""> Personal Email </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_personal_email"
                        placeholder="Personal Email"
                      />
                    </div>
                    <div class="form-group">
                      <label for=""> Office Email </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_office_email"
                        placeholder="Office Email"
                      />
                    </div>
                    <div class="form-group">
                      <label for=""> Date of Birth </label>
                      <input type="date" class="form-control" v-model="birth_date" />
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
                      <label>Location</label>
                      <multiselect
                        v-model="location"
                        :options="locations"
                        :custom-label="stateOfOriginLabel"
                      ></multiselect>
                    </div>

                    <div class="form-group">
                      <label for=""> Qualification </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_qualification"
                        placeholder="Qualification"
                      />
                    </div>
                    <div class="form-group">
                      <label>Gender</label>
                      <b-select v-model="gender" :options="gender_options"></b-select>
                    </div>
                    <div class="form-group">
                      <label>Religion</label>
                      <b-select
                        v-model="religion"
                        :options="religion_options"
                      ></b-select>
                    </div>
                    <div class="form-group">
                      <label>Job Role</label>
                      <multiselect
                        v-model="job_role"
                        :options="job_roles"
                        :custom-label="locationLabel"
                      ></multiselect>
                    </div>
                    <div class="form-group">
                      <label>Sector</label>
                      <multiselect
                        v-model="sector"
                        :options="sectors"
                        :custom-label="locationLabel"
                      ></multiselect>
                    </div>
                    <div class="form-group">
                      <label>State Of Origin</label>
                      <multiselect
                        v-model="state"
                        :options="states"
                        :custom-label="stateOfOriginLabel"
                        @input="getLocalGovernmentAreasByStateId"
                      ></multiselect>
                    </div>
                    <div class="form-group">
                      <label>LGA</label>
                      <multiselect
                        v-model="lga"
                        :options="lgas"
                        :custom-label="lGALabel"
                      ></multiselect>
                    </div>
                    <div class="form-group">
                      <label for=""> NIN </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_nin"
                        placeholder="NIN"
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
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Pension Information</h5>
                    </div>
                    <div class="form-group">
                      <label>Pension Provider</label>
                      <multiselect
                        v-model="pensionProvider"
                        :options="pensionProviders"
                        :custom-label="pensionLabel"
                      ></multiselect>
                    </div>

                    <div class="form-group">
                      <label for=""> Pension No. </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_pension_no"
                        placeholder="Pension No."
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> PAYE No.</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_paye"
                        placeholder="PAYE"
                      />
                    </div>
                    <div class="form-group">
                      <label for=""> NHF</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_nhf"
                        placeholder="NHF"
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
                        placeholder="Blood Group"
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> Genotype </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_genotype"
                        placeholder="Geno-type"
                      />
                    </div>
                    <div class="form-group">
                      <label for=""> Ailment </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_ailments"
                        placeholder="Ailment"
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
                        placeholder="Full Name"
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> Next of Kin Address </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_next_of_kin_address"
                        placeholder="Address"
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> Next of Kin Phone No </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_next_of_kin_phone_no"
                        placeholder="Phone Number"
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
                        placeholder="Full Name"
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> Contact </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="emp_emergency_contact"
                        placeholder="Contact No."
                      />
                    </div>

                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">Contract Details</h5>
                    </div>
                    <div class="form-group">
                      <label for=""> Hire Date </label>
                      <input type="date" class="form-control" v-model="emp_hire_date" />
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
                    <div class="p-3 bg-light mb-4">
                      <h5 class="font-size-14 mb-0">
                        D Codes
                      </h5>
                    </div>
                    <div class="form-group">
                      <label for=""> D7 </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="d7"
                        placeholder="D7"
                      />
                    </div>

                    <div class="form-group">
                      <label for=""> D4 </label>
                      <multiselect
                        v-model="selected_d4"
                        :options="d4_list"
                        :custom-label="bankLabel"
                      >
                      </multiselect>
                    </div>
                    <div class="form-group">
                      <label for=""> D5 </label>
                      <multiselect
                        v-model="selected_d5"
                        :options="d5_list"
                        :custom-label="bankLabel"
                      >
                      </multiselect>

                    </div>

                    <div class="form-group">
                      <label>D6</label>
                      <multiselect
                        v-model="selected_d6"
                        :options="d6_list"
                        :custom-label="bankLabel"
                      >
                      </multiselect>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-12 d-flex justify-content-center">
                    <b-button
                      v-if="!submitted"
                      type="submit"
                      class="btn btn-success btn-lg mt-4 d-flex justify-content-center"
                      @click="updateEmployee"
                    >
                      Save Changes
                    </b-button>
                    <b-button v-else disabled class="btn btn-success btn-block mt-4">
                      Saving changes...
                    </b-button>
                  </div>
                </div>
              </form>
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
  </Layout>
</template>
