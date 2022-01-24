<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
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
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$refs['add-grant-chart'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Grant Chart
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mt-4">
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_length" class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Show&nbsp;
                    <b-form-select
                      v-model="perPage"
                      size="sm"
                      :options="pageOptions"
                    ></b-form-select
                    >&nbsp;entries
                  </label>
                </div>
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div
                  id="tickets-table_filter"
                  class="dataTables_filter text-md-right"
                >
                  <label class="d-inline-flex align-items-center">
                    Search:
                    <b-form-input
                      v-model="filter"
                      type="search"
                      placeholder="Search..."
                      class="form-control form-control-sm ml-2"
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0">
              <b-table
                ref="gc-table"
                bordered
                selectable
                hover
                :items="grantCharts"
                :fields="fields"
                responsive="sm"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="onFiltered"
                show-empty
                select-mode="single"
                @row-selected="selectRow"
              >
                <template #cell(Location)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.location_name }}
                  </p>
                  <small>{{ row.value.l_t6_code }}</small>
                </template>
                <template #cell(Department)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.department_name }}
                  </p>
                  <small>{{ row.value.d_t3_code }}</small>
                </template>
                <template #cell(donor)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.donor_code }}
                  </p>
                  <small>{{ row.value.donor_description }}</small>
                </template>
                <template #cell(gc_amount)="row">
                  &#8358;
                  {{
                    parseFloat(row.value).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  }}
                </template>
              </b-table>
            </div>
            <div class="row">
              <div class="col">
                <div
                  class="dataTables_paginate paging_simple_numbers float-right"
                >
                  <ul class="pagination pagination-rounded mb-0">
                    <!-- pagination -->
                    <b-pagination
                      v-model="currentPage"
                      :total-rows="totalRows"
                      :per-page="perPage"
                    ></b-pagination>
                  </ul>
                </div>
              </div>
            </div>
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
