<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Location Allowances",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  watch: {
    amount: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.amount = result));
    },
  },
  mounted() {
    this.refreshTable();
    this.fetchLocations();
    this.fetchPaymentDefinitions();
  },
  validations: {
    amount: { required },
    location: { required },
    paymentDef: { required },
  },
  methods: {
    resetForm() {
      this.amount = null;
      this.location = null;
      this.paymentDef = null;
      this.$v.$reset();
    },
    refreshTable() {
      this.apiGet(
        this.ROUTES.locationAllowance,
        "Get Location Allowances Error"
      ).then((res) => {
        const { data } = res;
        this.locationAllowances = data;
        this.totalRows = this.locationAllowances.length;
      });
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
    fetchPaymentDefinitions() {
      this.apiGet(
        this.ROUTES.paymentDefinition,
        "Get Payment Definitions Error"
      ).then((res) => {
        this.paymentDefs = [
          { value: null, text: "Please select a payment definition" },
        ];
        const { data } = res;
        data.forEach((payment) => {
          this.paymentDefs.push({
            value: payment.pd_id,
            text: payment.pd_payment_name,
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
      this.laID = row.la_id;
      this.location = row.la_location_id;
      this.paymentDef = row.la_payment_id;
      this.amount = row.la_amount;
      this.$refs["edit-la"].show();
      this.$refs["la-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Location Allowance");
      } else {
        this.amount = parseFloat(this.amount.replace(/,/g, ""));
        const data = {
          la_payment_id: this.paymentDef,
          la_location_id: this.location,
          la_amount: this.amount,
        };
        const url = `${this.ROUTES.locationAllowance}/add-location-allowance`;
        this.apiPost(url, data, "Add Location Allowance Error").then((res) => {
          this.apiResponseHandler(
            `${parseFloat(res.data.la_amount).toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })} added as location allowance`,
            "New Location Allowance Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-la"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Location Allowance");
      } else {
        this.amount = parseFloat(this.amount.replace(/,/g, ""));
        const data = {
          la_payment_id: this.paymentDef,
          la_location_id: this.location,
          la_amount: this.amount,
        };
        const url = `${this.ROUTES.locationAllowance}/update-location-allowance/${this.laID}`;
        this.apiPatch(url, data, "Update Location Allowance Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Update Successful");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["edit-la"].hide();
          }
        );
      }
    },
  },
  data() {
    return {
      title: "Location Allowances",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Location Allowances",
          active: true,
        },
      ],
      locationAllowances: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "la_id",
      sortDesc: false,
      fields: [
        { key: "la_id", label: "ID", sortable: true },
        { key: "Location", label: "Location", sortable: true },
        {
          key: "PaymentDefinition",
          label: "Payment Definition",
          sortable: true,
        },
        { key: "la_amount", label: "Amount", sortable: true },
      ],
      submitted: false,
      paymentDef: null,
      paymentDefs: [
        { value: null, text: "Please select a payment definition" },
      ],
      location: null,
      locations: [{ value: null, text: "Please select a location" }],
      amount: null,
      laID: null,
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
      <b-button class="btn btn-success" @click="$refs['add-la'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Location Allowance
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
                ref="la-table"
                bordered
                selectable
                hover
                :items="locationAllowances"
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
                <template #cell(PaymentDefinition)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.pd_payment_name }}
                  </p>
                  <small>{{ row.value.pd_payment_code }}</small>
                </template>
                <template #cell(Location)="row">
                  <p class="mb-n1 text-uppercase">
                    {{ row.value.location_name }}
                  </p>
                  <small>{{ row.value.l_t6_code }}</small>
                </template>
                <template #cell(la_amount)="row">
                  <p>
                    &#8358;
                    {{
                      parseFloat(row.value).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })
                    }}
                  </p>
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
      ref="add-la"
      title="Add Location Allowance"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
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
        <div class="form-group">
          <label> Payment Definition <span class="text-danger">*</span> </label>
          <b-form-select
            id="payment"
            v-model="paymentDef"
            :options="paymentDefs"
            :class="{
              'is-invalid': submitted && $v.paymentDef.$error,
            }"
          />
          <small
            class="form-text text-muted manage"
            @click="$router.push('/payment-definitions')"
          >
            Manage Payment Definitions
          </small>
        </div>
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
      ref="edit-la"
      title="Edit Location Allowance"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
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
        <div class="form-group">
          <label> Payment Definition <span class="text-danger">*</span> </label>
          <b-form-select
            id="payment"
            v-model="paymentDef"
            :options="paymentDefs"
            :class="{
              'is-invalid': submitted && $v.paymentDef.$error,
            }"
          />
          <small
            class="form-text text-muted manage"
            @click="$router.push('/payment-definitions')"
          >
            Manage Payment Definitions
          </small>
        </div>
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
