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
      permissions.includes("PAYROLL_CONFIG") &&
      permissions.includes("PAYMENT_DEFINITION")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Payment Definitions",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    code: { required },
    name: { required },
    pdPrGross: { required },
  },
  methods: {
    selectPD(pd) {
      this.pdID = pd.pd_id;
      this.code = pd.pd_payment_code;
      this.name = pd.pd_payment_name;
      this.type = pd.pd_payment_type;
      this.variant = pd.pd_payment_variant;
      this.description = pd.pd_desc;
      this.basic = pd.pd_basic;
      this.pdPercentage = pd.pd_percentage;
      this.pdValue = pd.pd_value;
      this.pdAmount = pd.pd_amount;
      this.pdPrGross = pd.pd_pr_gross;
      this.sum = pd.pd_total_gross;
      this.sumII = pd.pd_total_gross_ii;
      this.tie_number = pd.pd_tie_number;
      this.tax = pd.pd_tax;
      this.taxable = pd.pd_payment_taxable;
      this.welfare = pd.pd_welfare || 0;
      this.pd_employee = pd.pd_employee;
      this.$refs["edit-payment-definition"].show();
      this.$refs["pd-table"].clearSelected();
    },
    resetForm() {
      this.code = null;
      this.name = null;
      this.type = 1;
      this.variant = 1;
      this.description = 1;
      this.basic = 1;
      this.tie = null;
      this.$v.$reset();
    },
    refreshTable() {
      this.apiGet(
        this.ROUTES.paymentDefinition,
        "Get Payment Definitions Error"
      ).then((res) => {
        const { data } = res;
        data.forEach((paymentDefinition, index) => {
          this.paymentDefinitions[index] = {
            sn: ++index,
            ...paymentDefinition,
          };
        });
        this.totalRows = this.paymentDefinitions.length;
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Payment Definition");
      } else {
        const data = {
          pd_payment_code: this.code,
          pd_payment_name: this.name,
          pd_payment_type: this.type,
          pd_payment_variant: this.variant,
          pd_desc: "null",
          pd_tie_number: this.tie_number,
          pd_pr_gross: this.pdPrGross,
          pd_value: this.pdValue,
          pd_percentage: this.pdPercentage,
          pd_total_gross: this.sum,
          pd_total_gross_ii: this.sumII,
          pd_employee: this.pd_employee,
        };
        this.type === 1
          ? (data.pd_payment_taxable = this.taxable)
          : (data.pd_payment_taxable = 0);
        this.type === 1 ? (data.pd_basic = this.basic) : (data.pd_basic = 0);
        this.type === 2 ? (data.pd_tax = this.pdTax) : (data.pd_tax = 0);
        this.type === 2
          ? (data.pd_welfare = this.welfare)
          : (data.pd_welfare = 0);
        this.pdValue === 2
          ? (data.pd_amount = this.pdAmount)
          : (data.pd_amount = 0);
        const url = `${this.ROUTES.paymentDefinition}/add-payment-definition`;
        this.apiPost(url, data, "Add Payment Definition Error").then((res) => {
          this.apiResponseHandler(
            `${res.data.pd_payment_name} has been added successfully`,
            "New Payment Definition Added"
          );
          this.$v.$reset();
          this.$refs["add-payment-definition"].hide();
          this.refreshTable();
        });
      }
    },
    async submitUpdate() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Payment Definition");
      } else {
        const data = {
          pd_payment_code: this.code,
          pd_payment_name: this.name,
          pd_payment_type: this.type,
          pd_payment_variant: this.variant,
          pd_desc: "null",
          pd_tie_number: this.tie_number,
          pd_pr_gross: this.pdPrGross,
          pd_value: this.pdValue,
          pd_percentage: this.pdPercentage,
          pd_total_gross: this.sum,
          pd_total_gross_ii: this.sumII,
          pd_employee: this.pd_employee,
        };
        this.type === 1
          ? (data.pd_payment_taxable = this.taxable)
          : (data.pd_payment_taxable = 0);
        this.type === 1 ? (data.pd_basic = this.basic) : (data.pd_basic = 0);
        this.type === 2 ? (data.pd_tax = this.pdTax) : (data.pd_tax = 0);
        this.type === 2
          ? (data.pd_welfare = this.welfare)
          : (data.pd_welfare = 0);
        this.pdValue === 2
          ? (data.pd_amount = this.pdAmount)
          : (data.pd_amount = 0);
        const url = `${this.ROUTES.paymentDefinition}/update-payment-definition/${this.pdID}`;
        await this.apiPatch(url, data, "Update Payment Definition Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Update Successful");
            this.$v.$reset();
            this.$refs["edit-payment-definition"].hide();
            this.refreshTable();
          }
        );
      }
    },

    async submitDelete() {
      this.submitted = true;
      const data = {
        pd_id: this.pdID,
      };
      const url = `${this.ROUTES.paymentDefinition}/delete-payment-definition`;
      await this.apiPost(url, data, "Delete Payment Definition Error").then(
        (res) => {
          this.apiResponseHandler(`${res.data}`, "Delete Successful");
          this.$v.$reset();
          this.$refs["delete-payment-definition"].hide();
          this.refreshTable();
        }
      );
    },

    deletePD(pd) {
      this.pdID = pd.pd_id;
      this.code = pd.pd_payment_code;
      this.name = pd.pd_payment_name;
      this.$refs["delete-payment-definition"].show();
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      submitting: false,
      title: "Payment Definitions",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Payment Definitions",
          active: true,
        },
      ],
      paymentDefinitions: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        {
          key: "sn",
          label: "S/n",
          sortable: true,
          thStyle: { width: "5%" },
        },
        {
          key: "pd_payment_code",
          label: "Payment Code",
          sortable: false,
          thClass: "text-nowrap",
        },
        {
          key: "pd_payment_name",
          label: "Name",
          sortable: true,
        },
        { key: "pd_payment_type", label: "Type", sortable: true },
        { key: "pd_payment_variant", label: "Variant", sortable: true },
        { key: "pd_payment_taxable", label: "Taxable?", sortable: true },
        { key: "pd_basic", label: "Basic?", sortable: true },
        { key: "pd_tax", label: "Tax?", sortable: true },
        { key: "pd_welfare", label: "Welfare?", sortable: true },
        {
          key: "pd_value",
          label: "Payment Value",
          sortable: true,
          thClass: "text-nowrap",
        },
        { key: "pd_amount", label: "% Of", sortable: true },
        { key: "pd_percentage", label: "% Value", sortable: true },
        {
          key: "pd_total_gross",
          label: "Sum up to Gross I?",
          sortable: true,
          thClass: "text-nowrap",
        },
        {
          key: "pd_total_gross_ii",
          label: "Sum up to Gross II?",
          sortable: true,
          thClass: "text-nowrap",
        },
        "action",
      ],
      submitted: false,
      code: null,
      name: null,
      type: 1,
      types: [
        { text: "INCOME", value: 1 },
        { text: "DEDUCTION", value: 2 },
      ],
      variant: 1,
      variants: [
        { text: "STANDARD", value: 1 },
        { text: "VARIATIONAL", value: 2 },
      ],
      taxable: 1,
      taxables: [
        { text: "YES", value: 1 },
        { text: "NO", value: 2 },
      ],
      description: 1,
      descriptions: [
        { text: "LOAN", value: 1 },
        { text: "TAX", value: 2 },
        { text: "PENSION", value: 3 },
        { text: "HMO", value: 4 },
      ],
      basic: 1,
      basics: [
        { text: "YES", value: 1 },
        { text: "NO", value: 0 },
      ],

      tie: null,
      pdID: null,
      pdPrGross: 0,
      pdValue: 1,
      pdValues: [
        { text: "FLAT", value: 1 },
        { text: "COMPUTED", value: 2 },
      ],
      pdTax: 0,
      pdTaxes: [
        { text: "YES", value: 1 },
        { text: "NO", value: 0 },
      ],
      welfare: 0,
      welfares: [
        { text: "YES", value: 1 },
        { text: "NO", value: 0 },
      ],
      pdAmount: 1,
      pdAmounts: [
        { text: "Adjusted GROSS I", value: 1 },
        { text: "Adjusted GROSS II", value: 5 },
        { text: "Adjusted BASIC", value: 2 },
        { text: "Full GROSS", value: 3 },
      ],
      sum: 1,
      sums: [
        { text: "YES", value: 1 },
        { text: "NO", value: 0 },
      ],
      sumII: 1,
      sumsII: [
        { text: "YES", value: 1 },
        { text: "NO", value: 0 },
      ],

      pd_employee: 1,
      pd_employees: [
        { text: "EMPLOYEE", value: 1 },
        { text: "EMPLOYER", value: 2 },
      ],

      tie_number: 0,
      tie_numbers: [
        { text: "NONE", value: 0 },
        { text: "TAX", value: 1 },
        { text: "PENSION", value: 2 },
        { text: "NHF", value: 3 },
      ],
      sumIIDisabled: false,
      pdPercentage: 0,
    };
  },
};
</script>

<style>
.ff-wrapper {
  position: relative;
}
.ff-header {
  display: inline-block;
  background-color: #ffffff;
  margin-left: 2em;
  padding-left: 0.5em;
  padding-right: 0.5em;
  position: absolute;
}
.ff-content {
  border: 1px solid #ced4da;
  border-radius: 10px;
  padding: 2em 2em 1em 2em;
}
</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$refs['add-payment-definition'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Payment Definition
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
                ref="pd-table"
                bordered
                selectable
                hover
                :items="paymentDefinitions"
                :fields="fields"
                responsive="lg"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :filter="filter"
                :filter-included-fields="filterOn"
                @filtered="onFiltered"
                show-empty
              >
                <template #cell(pd_payment_name)="row">
                  <p class="text-nowrap">{{ row.value }}</p>
                </template>
                <template #cell(pd_payment_type)="row">
                  <p class="text-nowrap" v-if="row.value === 1">INCOME</p>
                  <p class="text-nowrap" v-else-if="row.value === 2">
                    DEDUCTION
                  </p>
                </template>
                <template #cell(pd_payment_variant)="row">
                  <p class="text-nowrap" v-if="row.value === 1">STANDARD</p>
                  <p class="text-nowrap" v-else-if="row.value === 2">
                    VARIATIONAL
                  </p>
                </template>
                <template #cell(pd_payment_taxable)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>
                <template #cell(pd_basic)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>
                <template #cell(pd_tax)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>
                <template #cell(pd_welfare)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>
                <template #cell(pd_value)="row">
                  <p v-if="row.value === 1">FLAT</p>
                  <p v-else>COMPUTED</p>
                </template>
                <template #cell(pd_amount)="row">
                  <p class="mb-0 text-nowrap" v-if="row.value === 1">
                    Adjusted GROSS I
                  </p>
                  <p class="mb-0 text-nowrap" v-else-if="row.value === 2">
                    Adjusted BASIC
                  </p>
                  <p class="mb-0 text-nowrap" v-else-if="row.value === 3">
                    Full GROSS
                  </p>
                  <p class="mb-0 text-nowrap" v-else-if="row.value === 5">
                    Adjusted GROSS II
                  </p>
                  <p class="mb-0" v-else>-</p>
                </template>
                <template #cell(pd_percentage)="row">
                  <p>{{ row.value }} %</p>
                </template>
                <template #cell(pd_total_gross)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>
                <template #cell(pd_total_gross_ii)="row">
                  <p v-if="row.value === 1">YES</p>
                  <p v-else>NO</p>
                </template>

                <template #cell(action)="row">
                  <div class="btn-group">
                    <b-button
                      style="margin: 10px"
                      variant="primary"
                      size="sm"
                      @click="selectPD(row.item)"
                    >
                      <i class="dripicons-document-edit"></i
                    ></b-button>
                    <b-button
                      style="margin: 10px"
                      variant="danger"
                      size="sm"
                      @click="deletePD(row.item)"
                    >
                      <i class="dripicons-trash"></i
                    ></b-button>
                  </div>
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
      ref="add-payment-definition"
      title="Add Payment Definition"
      hide-footer
      centered
      title-class="font-18"
      size="lg"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="ff-wrapper mt-3">
          <h5 class="ff-header" style="bottom: 86%">Payment Information</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label for="username">
                    Payment Code <span class="text-danger">*</span>
                  </label>
                  <input
                    id="username"
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
                  <label for="fullname">
                    Payment Name <span class="text-danger">*</span>
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    v-model="name"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.name.$error,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 90%">Payment Category</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-12">
                <b-form-group>
                  <label for="user_type">Category</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="pd_employee"
                    :options="pd_employees"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
            </div>
          </div>
        </div>

        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 90%">Payment Type</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-6">
                <b-form-group>
                  <label for="user_type">Type</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="type"
                    :options="types"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6">
                <b-form-group>
                  <label for="user_status">Variant</label><br />
                  <b-form-radio-group
                    id="user_status"
                    v-model="variant"
                    :options="variants"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 1">
                <b-form-group>
                  <label for="user_type">Taxable?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="taxable"
                    :options="taxables"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 1">
                <b-form-group>
                  <label for="user_status">Basic?</label><br />
                  <b-form-radio-group
                    id="user_status"
                    v-model="basic"
                    :options="basics"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Tax?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="pdTax"
                    :options="pdTaxes"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Welfare?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="welfare"
                    :options="welfares"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>

              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Tie Number?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="tie_number"
                    :options="tie_numbers"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 87% !important">
            Apportionment
          </h5>
          <div class="ff-content">
            <div class="form-group">
              <div class="row">
                <div class="col-lg-6">
                  <label> % of Gross <span class="text-danger">*</span> </label>
                  <input
                    type="number"
                    v-model="pdPrGross"
                    class="form-control"
                    min="0"
                    max="100"
                    :class="{
                      'is-invalid': submitted && $v.pdPrGross.$error,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 92.3% !important">Value</h5>
          <div class="ff-content">
            <div class="form-group">
              <div class="row">
                <div class="col-lg-6">
                  <b-form-group>
                    <label>Payment Value</label><br />
                    <b-form-radio-group
                      id="payment_value"
                      v-model="pdValue"
                      :options="pdValues"
                      button-variant="outline-success"
                      buttons
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6" v-if="pdValue === 2">
                  <b-form-group>
                    <label>% of</label><br />
                    <b-form-radio-group
                      id="user_type"
                      v-model="pdAmount"
                      :options="pdAmounts"
                      button-variant="outline-success"
                      buttons
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6" v-if="pdValue === 2">
                  <b-form-group>
                    <label> % Value <span class="text-danger">*</span> </label>
                    <input
                      type="number"
                      v-model="pdPercentage"
                      class="form-control"
                      min="0"
                      max="100"
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6">
                  <div class="row">
                    <div class="col-lg-6">
                      <b-form-group>
                        <label>Sum up to Gross I?</label><br />
                        <b-form-radio-group
                          id="user_type"
                          v-model="sum"
                          :options="sums"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                    <div class="col-lg-6">
                      <b-form-group>
                        <label>Sum up to Gross II?</label><br />
                        <b-form-radio-group
                          id="user_type"
                          v-model="sumII"
                          :options="sumsII"
                          :disabled="sumIIDisabled"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-5"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-5"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>
    <b-modal
      ref="edit-payment-definition"
      title="Update Payment Definition"
      hide-footer
      centered
      title-class="font-18"
      size="lg"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="ff-wrapper mt-3">
          <h5 class="ff-header" style="bottom: 86%">Payment Information</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label for="username">
                    Payment Code <span class="text-danger">*</span>
                  </label>
                  <input
                    id="username"
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
                  <label for="fullname">
                    Payment Name <span class="text-danger">*</span>
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    v-model="name"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.name.$error,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 90%">Payment Category</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-12">
                <b-form-group>
                  <label for="user_type">Category</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="pd_employee"
                    :options="pd_employees"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 90%">Payment Type</h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-6">
                <b-form-group>
                  <label for="user_type">Type</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="type"
                    :options="types"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6">
                <b-form-group>
                  <label for="user_status">Variant</label><br />
                  <b-form-radio-group
                    id="user_status"
                    v-model="variant"
                    :options="variants"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 1">
                <b-form-group>
                  <label for="user_type">Taxable?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="taxable"
                    :options="taxables"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 1">
                <b-form-group>
                  <label for="user_status">Basic?</label><br />
                  <b-form-radio-group
                    id="user_status"
                    v-model="basic"
                    :options="basics"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Tax?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="pdTax"
                    :options="pdTaxes"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Welfare?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="welfare"
                    :options="welfares"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
              <div class="col-lg-6" v-if="type === 2">
                <b-form-group>
                  <label>Tie Number?</label><br />
                  <b-form-radio-group
                    id="user_type"
                    v-model="tie_number"
                    :options="tie_numbers"
                    button-variant="outline-success"
                    buttons
                  />
                </b-form-group>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 87% !important">
            Apportionment
          </h5>
          <div class="ff-content">
            <div class="form-group">
              <div class="row">
                <div class="col-lg-6">
                  <label> % of Gross <span class="text-danger">*</span> </label>
                  <input
                    type="number"
                    v-model="pdPrGross"
                    class="form-control"
                    min="0"
                    max="100"
                    :class="{
                      'is-invalid': submitted && $v.pdPrGross.$error,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ff-wrapper mt-5">
          <h5 class="ff-header" style="bottom: 92.3% !important">Value</h5>
          <div class="ff-content">
            <div class="form-group">
              <div class="row">
                <div class="col-lg-6">
                  <b-form-group>
                    <label>Payment Value</label><br />
                    <b-form-radio-group
                      id="payment_value"
                      v-model="pdValue"
                      :options="pdValues"
                      button-variant="outline-success"
                      buttons
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6" v-if="pdValue === 2">
                  <b-form-group>
                    <label>% of</label><br />
                    <b-form-radio-group
                      id="user_type"
                      v-model="pdAmount"
                      :options="pdAmounts"
                      button-variant="outline-success"
                      buttons
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6" v-if="pdValue === 2">
                  <b-form-group>
                    <label> % Value <span class="text-danger">*</span> </label>
                    <input
                      type="number"
                      v-model="pdPercentage"
                      class="form-control"
                      min="0"
                      max="100"
                    />
                  </b-form-group>
                </div>
                <div class="col-lg-6">
                  <div class="row">
                    <div class="col-lg-6">
                      <b-form-group>
                        <label>Sum up to Gross I?</label><br />
                        <b-form-radio-group
                          id="user_type"
                          v-model="sum"
                          :options="sums"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                    <div class="col-lg-6">
                      <b-form-group>
                        <label>Sum up to Gross II?</label><br />
                        <b-form-radio-group
                          id="user_type"
                          v-model="sumII"
                          :options="sumsII"
                          :disabled="sumIIDisabled"
                          button-variant="outline-success"
                          buttons
                        />
                      </b-form-group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-5"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-5"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>

    <b-modal
      ref="delete-payment-definition"
      title="Delete Payment Definition"
      hide-footer
      centered
      title-class="font-18"
      size="lg"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitDelete">
        <div class="ff-wrapper mt-3">
          <h5 class="ff-header" style="bottom: 86%">
            Are you Sure You want to Delete {{ name }} ?
          </h5>
          <div class="ff-content">
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label for="username">
                    Payment Code <span class="text-danger">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    v-model="code"
                    disabled
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.code.$error,
                    }"
                  />
                </div>
              </div>
              <div class="col-lg-6">
                <div class="form-group">
                  <label for="fullname">
                    Payment Name <span class="text-danger">*</span>
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    disabled
                    v-model="name"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.name.$error,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <b-button
          v-if="!submitting"
          class="btn btn-danger btn-block mt-5"
          type="submit"
        >
          Delete
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-danger btn-block mt-5"
          type="submit"
        >
          Deleting...
        </b-button>
      </form>
    </b-modal>
  </Layout>
</template>
