<script>
import { FormWizard, TabContent } from "vue-form-wizard";
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "New Employee",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: { Layout, PageHeader, FormWizard, TabContent },
  mounted() {
   // this.refreshTable();
    this.fetchLocations();
    this.fetchPositions();
  },
  methods: {
    resetForm() {
      this.role = null;
      this.department = null;
      this.description = null;
      this.jobRoleID = null;
      this.$v.$reset();
    },
    refreshTable() {
      this.apiGet(this.ROUTES.jobRole, "Get Job Roles Error").then((res) => {
        const { data } = res;
        this.jrs = data;
        this.totalRows = this.jrs.length;
      });
    },
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Location Error").then(
          (res) => {
            this.locations = [
              { value: null, text: "Please select a location" },
            ];
            const { data } = res;
            data.forEach((location) => {
              this.locations.push({
                value: location.location_id,
                text:location.location_name,
              });
            });
          }
      );
    },
    fetchPositions() {
      this.apiGet(this.ROUTES.jobRole, "Get Position Error").then(
          (res) => {
            this.positions = [
              { value: null, text: "Please select a position" },
            ];
            const { data } = res;
            data.forEach((position) => {
              this.positions.push({
                value: position.job_role_id,
                text:position.job_role,
              });
            });
          }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectJR(jr) {
      jr = jr[0];
      this.jobRoleID = jr.job_role_id;
      this.role = jr.job_role;
      this.description = jr.description;
      this.department = jr.jb_department_id;
      this.$refs["update-jr"].show();
      this.$refs["jr-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Job Role");
      } else {
        const data = {
          job_role: this.role,
          department_id: this.department,
          description: this.description,
        };
        this.apiPost(this.ROUTES.jobRole, data, "Add Job Role Error").then(
            (res) => {
              this.apiResponseHandler(`${res.data}`, "New Job Role Added");
              this.refreshTable();
              this.$v.$reset();
              this.$refs["add-jr"].hide();
            }
        );
      }
    },
    submitUpdate() {
      this.submitted = false;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Job Role");
      } else {
        const url = `${this.ROUTES.jobRole}/${this.jobRoleID}`;
        const data = {
          job_role: this.role,
          department_id: this.department,
          description: this.description,
        };
        this.apiPatch(url, data, "Update Job Role Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-jr"].hide();
        });
      }
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
      locations: [{ value: null, text: "Please select a location" }],
      positions: [{ value: null, text: "Please select a position" }],
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
          @click="$refs['add-payment-definition'].show()"
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
            <form-wizard color="#556ee6">
              <tab-content icon="mdi mdi-account-circle">
                <div class="row">
                  <div class="col-6">

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName">Employee ID</label>
                      <div class="col-md-9">
                        <input
                            id="employeeNumber"
                            type="text"
                            class="form-control"
                            name="employeeNumber"
                            placeholder="Employee Number"
                        />
                      </div>
                    </div>



                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName">Other Name</label>
                      <div class="col-md-9">
                        <input
                            id="otherName"
                            type="text"
                            class="form-control"
                            name="otherName"
                            placeholder="Other Name"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName">Personal Email</label>
                      <div class="col-md-9">
                        <input
                            id="personalEmail"
                            type="email"
                            class="form-control"
                            name="personalEmail"
                            placeholder="Personal Email"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName">Official Email</label>
                      <div class="col-md-9">
                        <input
                            id="officialEmail"
                            type="email"
                            class="form-control"
                            name="officialEmail"
                            placeholder="Official Email"
                        />
                      </div>
                    </div>

                  </div>

                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName">First name</label>
                      <div class="col-md-9">
                        <input
                            id="firstName"
                            type="text"
                            class="form-control"
                            name="firstName"
                            placeholder="First Name"
                        />
                      </div>
                    </div>
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="lastName">Last name</label>
                      <div class="col-md-9">
                        <input
                            id="lastName"
                            type="text"
                            class="form-control"
                            name="lastName"
                            placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="otherName">Telephone</label>
                      <div class="col-md-9">
                        <input
                            id="telephone"
                            type="text"
                            class="form-control"
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
                      <label class="col-md-3 col-form-label" for="firstName">Position</label>
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
                      <label class="col-md-3 col-form-label" for="otherName">Bank</label>
                      <div class="col-md-9">
                        <select class="form-control">
                          <option>Select</option>
                          <option>Large select</option>
                          <option>Small select</option>
                        </select>
                      </div>
                    </div>





                  </div>

                  <div class="col-6">
                    <div class="form-group row mb-3">
                      <label class="col-md-3 col-form-label" for="firstName">Location</label>
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
                      <label class="col-md-3 col-form-label" for="lastName">NUBAN</label>
                      <div class="col-md-9">
                        <input
                            id="nuban"
                            type="text"
                            class="form-control"
                            name="nuban"
                            placeholder="Last Name"
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

                      <p class="w-75 mb-2 mx-auto">
                        Quisque nec turpis at urna dictum luctus. Suspendisse convallis dignissim eros at volutpat. In egestas mattis dui. Aliquam
                        mattis dictum aliquet.
                      </p>

                      <div class="mb-3">
                        <div class="custom-control custom-checkbox">
                          <input id="customCheck1" type="checkbox" class="custom-control-input" />
                          <label
                              class="custom-control-label"
                              for="customCheck1"
                          >I agree with the Terms and Conditions</label>
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
