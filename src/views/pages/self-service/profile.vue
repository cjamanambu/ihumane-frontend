<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";


export default {
  page: {
    title: "Profile",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },

  async mounted() {

    await this.getStates()
    await this.fetchEmployee()
   await this.getBanks()

   },

  data() {
    return {
      title: "Profile",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Profile",
          href: "/profile",
          active: true
        },

      ],

      submitted: false,
      emp_first_name: null,
      emp_location: null,
      emp_last_name: null,
      emp_other_name: null,
      emp_qualification: null,
      emp_account_no: null,
      emp_bank_id: null,
      emp_state_id: null,
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
      maritalStatus: [ { value: null, text: "select marital Status" },
        { value: 1, text: "Married"},
        {value: 2, text: "Not Married", }
       ],
      banks: [ ],
      states: [ ]
    };
  },
  methods: {

   async fetchEmployee(){
      const url = `${this.ROUTES.employee}/get-employee/${this.getEmployee.emp_id}`
       this.apiGet(url).then((res) => {
        const { data } = res;
        if (data) {
          this.emp_first_name = data.emp_first_name,
           this.emp_last_name = data.emp_last_name,
              this.emp_other_name=data.emp_other_name,
              this.emp_qualification=data.emp_qualification,
              this.emp_location =data.location.location_name,
              this.emp_account_no=data.emp_account_no,
              this.emp_bank_id=data.emp_bank_id,
              this.emp_state_id=data.emp_state_id,
              this.emp_lga_id=data.emp_lga_id,
              this.emp_marital_status=data.emp_marital_status,
              this.emp_spouse_name=data.emp_spouse_name,
              this.emp_spouse_phone_no=data.emp_spouse_phone_no,
              this.emp_next_of_kin_name=data.emp_next_of_kin_name,
              this.emp_next_of_kin_address=data.emp_next_of_kin_address,
              this.emp_next_of_kin_phone_no=data.emp_next_of_kin_phone_no,
              this.emp_ailments=data.emp_ailments,
              this.emp_blood_group=data.emp_blood_group,
              this.emp_genotype=data.emp_genotype,
              this.emp_emergency_name=data.emp_emergency_name,
              this.emp_emergency_contact=data.emp_emergency_contact

        }
      });
    },

    async updateEmployee(){
      this.submitted = true
      const url = `${this.ROUTES.employee}/update-employee/${this.getEmployee.emp_id}`
      const data = {
        emp_first_name: this.emp_first_name,
        emp_last_name: this.emp_last_name,
        emp_other_name: this.emp_other_name,
        emp_qualification: this.emp_qualification,
        emp_account_no: this.emp_account_no,
        emp_bank_id: this.emp_bank_id,
        emp_state_id: this.emp_state_id,
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
        emp_emergency_contact: this.emp_emergency_contact
      };

      this.apiPatch(url, data, "Update Employee Error").then();
      this.apiResponseHandler("Process Complete", "Employee Update");
     await this.fetchEmployee().then()
      this.submitted = false


    },

    async getBanks(){
      const url = `${this.ROUTES.bank}`
      await this.apiGet(url).then((res) => {
        const { data } = res;
        this.banks = [{ value: null, text: "Please select a leave type" }]
        data.forEach(async (datum)=>{
          const dat = {
            value: datum.bank_id,
            text: datum.bank_name
          }
        this.banks.push(dat)
        })
      });
    },

    async getStates(){
      const url = `${this.ROUTES.state}`
      await this.apiGet(url).then((res) => {
        const { data } = res;
        this.banks = [{ value: null, text: "Please select a State" }]
        data.forEach(async (datum)=>{
          const dat = {
            value: datum.s_id,
            text: datum.s_name
          }
          this.states.push(dat)
        })
      });
    }





  },
};
</script>
<style>
.back {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">

      <div class="col-12">
        <div class="card">
          <div class="card-body">
<!--            <div class="p-3 bg-light mb-4">-->

<!--              <h5 class="font-size-14 mb-0" >-->
<!--                Profile Update-->
<!--              </h5>-->
<!--            </div>-->
            <form @submit.prevent="updateEmployee">
              <div class="row">


                <div class="col-lg-6">
                  <div class="p-3 bg-light mb-4">

                    <h5 class="font-size-14 mb-0" >
                      Personal Information
                    </h5>
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
                    <b-form-select

                        v-model="emp_state_id"
                        :options="states"
                    />
                  </div>
                  <div class="p-3 bg-light mb-4">

                    <h5 class="font-size-14 mb-0" >
                      Bank Information -- For Salary Disbursement
                    </h5>
                  </div>
                  <div class="form-group">
                    <label>Bank</label>
                    <b-form-select

                        v-model="emp_bank_id"
                        :options="banks"
                    />
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

                    <h5 class="font-size-14 mb-0" >
                      Marital Information
                    </h5>
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

                    <h5 class="font-size-14 mb-0" >
                      Health Information
                    </h5>
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

                    <h5 class="font-size-14 mb-0" >
                      Next of Kin Details
                    </h5>
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

                    <h5 class="font-size-14 mb-0" >
                     Emergency Contact Details
                    </h5>
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
                </div>
              </div>

              <b-button
                  v-if="!submitted"
                  type="submit"
                  class="btn btn-success btn-block mt-4"
              >
                Update Profile
              </b-button>
              <b-button v-else disabled class="btn btn-success btn-block mt-4">
                Updating...
              </b-button>
            </form>

          </div>
        </div>

      </div>


    </div>
  </Layout>
</template>
