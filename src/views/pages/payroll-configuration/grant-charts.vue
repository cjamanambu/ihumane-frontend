<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("PAYROLL_CONFIG")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Grant Charts",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  watch: {
    amount: function (newVal) {
      const result = newVal
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.amount = result));
    },
  },
  mounted() {
    this.refreshTable();
    this.fetchLocations();
    this.fetchDepartments();
    this.fetchDonors();
  },
  validations: {
    code: { required },
    location: { required },
    department: { required },
    donor: { required },
    expense: { required },
    description: { required },
    amount: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.grantChart, "Get Grant Charts Error").then(
        (res) => {
          const { data } = res;
          this.generateChart(data);
          this.grantCharts = data;
          this.totalRows = this.grantCharts.length;
        }
      );
    },
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
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
    fetchDepartments() {
      this.apiGet(this.ROUTES.department, "Get Departments Error").then(
        (res) => {
          this.departments = [
            { value: null, text: "Please select a department" },
          ];
          const { data } = res;
          data.forEach((department) => {
            this.departments.push({
              value: department.department_id,
              text: department.department_name,
            });
          });
        }
      );
    },
    fetchDonors() {
      this.apiGet(this.ROUTES.donor, "Get Donors Error").then((res) => {
        this.donors = [{ value: null, text: "Please select a donor" }];
        const { data } = res;
        data.forEach((donor) => {
          this.donors.push({
            value: donor.donor_id,
            text: donor.donor_code,
          });
        });
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.gcID = row.gc_id;
      this.code = row.gc_account_code;
      this.location = row.gc_location_id;
      this.department = row.gc_department_id;
      this.donor = row.gc_donor_id;
      this.expense = row.gc_expense;
      this.description = row.gc_description;
      this.amount = row.gc_amount;
      this.$refs["edit-grant-chart"].show();
      this.$refs["gc-table"].clearSelected();
    },
    resetForm() {
      this.gcID = null;
      this.code = null;
      this.location = null;
      this.department = null;
      this.donor = null;
      this.expense = null;
      this.description = null;
      this.amount = null;
      this.$v.$reset();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Grant Chart");
      } else {
        const data = {
          gc_location_id: this.location,
          gc_department_id: this.department,
          gc_expense: this.expense,
          gc_account_code: this.code,
          gc_description: this.description,
          gc_amount: parseFloat(this.amount.replace(/,/g, "")),
          gc_donor_id: this.donor,
        };
        const url = `${this.ROUTES.grantChart}/add-grant-chart`;
        this.apiPost(url, data, "Add Grant Chart Error").then((res) => {
          this.apiResponseHandler(
            `${res.data.gc_account_code} has been added successfully`,
            "New Grant Chart Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-grant-chart"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Grant Chart");
      } else {
        const data = {
          gc_location_id: this.location,
          gc_department_id: this.department,
          gc_expense: this.expense,
          gc_account_code: this.code,
          gc_description: this.description,
          gc_amount: parseFloat(this.amount.replace(/,/g, "")),
          gc_donor_id: this.donor,
        };
        const url = `${this.ROUTES.grantChart}/update-grant-chart/${this.gcID}`;
        this.apiPatch(url, data, "Update Grant Chart Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["edit-grant-chart"].hide();
        });
      }
    },
    generateChart(data) {
      this.donors_ = {};
      data.forEach((expense) => {
        let code = expense.donor.donor_code;
        if (code in this.donors_) {
          this.donors_[code].push(expense);
        } else {
          this.donors_[code] = [];
          this.donors_[code].push(expense);
        }
        console.log(this.donors_);
      });
    },
  },
  data() {
    return {
      title: "Grant Charts",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Grant Charts",
          active: true,
        },
      ],
      grantCharts: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "gc_id",
      sortDesc: false,
      fields: [
        { key: "gc_id", label: "ID", sortable: true },
        { key: "gc_account_code", label: "Account Code", sortable: true },
        { key: "Location", label: "Location", sortable: true },
        { key: "Department", label: "Department", sortable: true },
        { key: "donor", label: "Donor", sortable: true },
        { key: "gc_expense", label: "Expense", sortable: true },
        { key: "gc_description", label: "Description", sortable: true },
        { key: "gc_amount", label: "Amount", sortable: true },
      ],
      submitted: false,
      gcID: null,
      code: null,
      location: null,
      locations: [{ value: null, text: "Please select a location" }],
      department: null,
      departments: [{ value: null, text: "Please select a department" }],
      donor: null,
      donors: [{ value: null, text: "Please select a donor" }],
      donors_: {},
      expense: null,
      description: null,
      amount: null,
    };
  },
};
</script>
<style>
.manage:hover {
  cursor: pointer;
}
.update-mtr {
  transition: 0.5s ease;
}
.update-mtr:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div class="d-flex">
        <b-card
          header-class="bg-transparent border-success"
          class="border border-success d-inline-block mr-4"
        >
          <template v-slot:header>
            <h5 class="my-0 text-success">
              <i class="mdi mdi-file-percent-outline mr-3"></i>Donors
            </h5>
          </template>
          <h5 class="card-title mt-0">{{ donors.length }} donors</h5>
          <p
            class="card-text update-mtr"
            @click="$router.push({ name: 'donors' })"
          >
            Setup Donor
          </p>
        </b-card>
        <b-card
          header-class="bg-transparent border-success"
          class="border border-success d-inline-block"
        >
          <template v-slot:header>
            <h5 class="my-0 text-success">
              <i class="mdi mdi-file-percent-outline mr-3"></i>Expenses
            </h5>
          </template>
          <h5 class="card-title mt-0">{{ grantCharts.length }} expenses</h5>
          <p
            class="card-text update-mtr"
            @click="$refs['add-grant-chart'].show()"
          >
            Setup Expense
          </p>
        </b-card>
      </div>
      <div class="row">
        <div class="col-12">
          <div>
            <b-table-simple bordered striped hover outlined responsive>
              <b-thead head-variant="dark">
                <b-tr>
                  <b-th colspan="2">Donors</b-th>
                  <b-th colspan="5">Expenses</b-th>
                </b-tr>
                <b-tr>
                  <b-th>Donor Code</b-th>
                  <b-th>Donor Description</b-th>
                  <b-th>Expense Name</b-th>
                  <b-th>Account Code</b-th>
                  <b-th>Expense Description</b-th>
                  <b-th>T3 (Sector)</b-th>
                  <b-th>T6 (Location)</b-th>
                </b-tr>
              </b-thead>
              <b-tbody v-for="(donor, code) in donors_" :key="code">
                <b-tr>
                  <b-th :rowspan="donor.length" variant="secondary">
                    {{ code }}
                  </b-th>
                  <b-th :rowspan="donor.length" variant="secondary">
                    {{ donor[0].donor.donor_description }}
                  </b-th>
                  <b-td>{{ donor[0].gc_expense }}</b-td>
                  <b-td>{{ donor[0].gc_account_code }}</b-td>
                  <b-td>{{ donor[0].gc_description }}</b-td>
                  <b-td>
                    <p class="mb-0">{{ donor[0].Department.d_t3_code }}</p>
                    <small class="text-muted">
                      ({{ donor[0].Department.department_name }})
                    </small>
                  </b-td>
                  <b-td>
                    <p class="mb-0">{{ donor[0].Location.l_t6_code }}</p>
                    <small class="text-muted">
                      ({{ donor[0].Location.location_name }})
                    </small>
                  </b-td>
                </b-tr>
                <b-tr v-for="(d, index) in donor" :key="index">
                  <b-td v-if="donor.length > 1 && ++index < donor.length">
                    {{ donor[index].gc_expense }}
                  </b-td>
                  <b-td v-if="donor.length > 1 && index < donor.length">
                    {{ donor[index].gc_account_code }}
                  </b-td>
                  <b-td v-if="donor.length > 1 && index < donor.length">
                    {{ donor[index].gc_description }}
                  </b-td>
                  <b-td v-if="donor.length > 1 && index < donor.length">
                    <p class="mb-0">{{ donor[index].Department.d_t3_code }}</p>
                    <small class="text-muted">
                      ({{ donor[index].Department.department_name }})
                    </small>
                  </b-td>
                  <b-td v-if="donor.length > 1 && index < donor.length">
                    <p class="mb-0">{{ donor[index].Location.l_t6_code }}</p>
                    <small class="text-muted">
                      ({{ donor[index].Location.location_name }})
                    </small>
                  </b-td>
                </b-tr>
              </b-tbody>
              <b-tfoot foot-variant="dark">
                <b-tr>
                  <b-th>Donor Code</b-th>
                  <b-th>Donor Description</b-th>
                  <b-th>Expense Name</b-th>
                  <b-th>Account Code</b-th>
                  <b-th>Expense Description</b-th>
                  <b-th>T3 (Sector)</b-th>
                  <b-th>T6 (Location)</b-th>
                </b-tr>
                <b-tr>
                  <b-th colspan="2">Donors</b-th>
                  <b-th colspan="5">Expenses</b-th>
                </b-tr>
              </b-tfoot>
            </b-table-simple>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="add-grant-chart"
      title="Add Grant Chart"
      hide-footer
      centered
      size="lg"
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="row">
          <div class="col-lg-6">
            <div class="form-group">
              <label for="code">
                Account Code <span class="text-danger">*</span>
              </label>
              <input
                id="code"
                type="text"
                v-model="code"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.code.$error,
                }"
              />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="location">
                Location <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="location"
                v-model="location"
                :options="locations"
                :class="{
                  'is-invalid': submitted && $v.location.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/locations')"
              >
                Manage Locations
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="department">
                Department <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="department"
                v-model="department"
                :options="departments"
                :class="{
                  'is-invalid': submitted && $v.department.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/departments')"
              >
                Manage Departments
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="donor">
                Donor <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="donor"
                v-model="donor"
                :options="donors"
                :class="{
                  'is-invalid': submitted && $v.donor.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/donors')"
              >
                Manage Donors
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="expense">
                Expense <span class="text-danger">*</span>
              </label>
              <input
                id="expense"
                type="text"
                v-model="expense"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.expense.$error,
                }"
              />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="amount">
                Amount <span class="text-danger">*</span>
              </label>
              <input
                id="amount"
                type="text"
                v-model="amount"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.amount.$error,
                }"
              />
            </div>
          </div>
          <div class="col-12">
            <div class="form-group">
              <label for="description">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                id="description"
                v-model="description"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.description.$error,
                }"
              />
            </div>
          </div>
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
      ref="edit-grant-chart"
      title="Edit Grant Chart"
      hide-footer
      centered
      size="lg"
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="row">
          <div class="col-lg-6">
            <div class="form-group">
              <label for="code">
                Account Code <span class="text-danger">*</span>
              </label>
              <input
                id="code"
                type="text"
                v-model="code"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.code.$error,
                }"
              />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="location">
                Location <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="location"
                v-model="location"
                :options="locations"
                :class="{
                  'is-invalid': submitted && $v.location.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/locations')"
              >
                Manage Locations
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="department">
                Department <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="department"
                v-model="department"
                :options="departments"
                :class="{
                  'is-invalid': submitted && $v.department.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/departments')"
              >
                Manage Departments
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="donor">
                Donor <span class="text-danger">*</span>
              </label>
              <b-form-select
                id="donor"
                v-model="donor"
                :options="donors"
                :class="{
                  'is-invalid': submitted && $v.donor.$error,
                }"
              />
              <small
                class="form-text text-muted manage"
                @click="$router.push('/donors')"
              >
                Manage Donors
              </small>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="expense">
                Expense <span class="text-danger">*</span>
              </label>
              <input
                id="expense"
                type="text"
                v-model="expense"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.expense.$error,
                }"
              />
            </div>
          </div>
          <div class="col-lg-6">
            <div class="form-group">
              <label for="amount">
                Amount <span class="text-danger">*</span>
              </label>
              <input
                id="amount"
                type="text"
                v-model="amount"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.amount.$error,
                }"
              />
            </div>
          </div>
          <div class="col-12">
            <div class="form-group">
              <label for="description">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                id="description"
                v-model="description"
                class="form-control"
                :class="{
                  'is-invalid': submitted && $v.description.$error,
                }"
              />
            </div>
          </div>
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
