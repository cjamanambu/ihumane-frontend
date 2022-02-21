<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
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
  },
  methods: {
    selectPD(pd) {
      pd = pd[0];
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
      this.paymentDefinitions = [];
      this.apiGet(
        this.ROUTES.paymentDefinition,
        "Get Payment Definitions Error"
      ).then((res) => {
        const { data } = res;
        this.paymentDefinitions = data;
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
          pd_payment_taxable: this.taxable,
          pd_desc: "null",
          pd_basic: this.basic,
          pd_tie_number: "null",
          pd_pr_gross: this.pdPrGross,
          pd_percentage: this.pdPercentage,
          pd_value: this.pdValue,
          pd_amount: parseFloat(this.pdAmount),
          pd_tax: parseInt(this.pdTax),
        };
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
          pd_payment_taxable: this.taxable,
          pd_desc: "null",
          pd_basic: this.basic,
          pd_tie_number: "null",
          pd_pr_gross: this.pdPrGross,
          pd_percentage: parseInt(this.pdPercentage),
          pd_value: parseInt(this.pdValue),
          pd_amount: parseFloat(this.pdAmount),
          pd_tax: parseInt(this.pdTax),
        };
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
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
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
      sortBy: "pd_id",
      sortDesc: false,
      fields: [
        { key: "pd_id", label: "ID", sortable: true },
        { key: "pd_payment_code", label: "Payment Code", sortable: false },
        { key: "pd_payment_name", label: "Name", sortable: true },
        { key: "pd_payment_type", label: "Type", sortable: false },
        { key: "pd_payment_variant", label: "Variant", sortable: false },
        { key: "pd_payment_taxable", label: "Taxable", sortable: false },
        { key: "pd_desc", label: "Description", sortable: false },
        { key: "pd_basic", label: "Basic", sortable: false },
        { key: "pd_tie_number", label: "Tie Number", sortable: false },
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
        { text: "TAXABLE", value: 1 },
        { text: "NONTAXABLE", value: 0 },
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
        { text: "BASIC", value: 1 },
        { text: "NONBASIC", value: 0 },
      ],

      tie: null,
      pdID: null,
      pdPrGross: 0,
      pdValue: 1,
      pdValues: [
        { text: "Flat", value: 1 },
        { text: "Computed", value: 2 },
      ],
      pdTaxes: [
        { text: "Tax", value: 1 },
        { text: "Not Tax", value: 0 },
      ],
      pdTax: 0,
      pdAmount: 1,
      pdAmounts: [
        { text: "Of Gross", value: 1 },
        { text: "Of Basic", value: 2 },
      ],
      pdPercentage: 0,
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
                @row-selected="selectPD"
              >
                <template #cell(pd_payment_type)="row">
                  <p v-if="row.value === 1">INCOME</p>
                  <p v-else-if="row.value === 2">DEDUCTION</p>
                </template>
                <template #cell(pd_payment_variant)="row">
                  <p v-if="row.value === 1">STANDARD</p>
                  <p v-else-if="row.value === 2">VARIATIONAL</p>
                </template>
                <template #cell(pd_payment_taxable)="row">
                  <p v-if="row.value === 1">TAXABLE</p>
                  <p v-else-if="row.value === 0">NONTAXABLE</p>
                </template>
                <template #cell(pd_desc)="row">
                  <p v-if="row.value === 1">LOAN</p>
                  <p v-else-if="row.value === 2">TAX</p>
                  <p v-else-if="row.value === 3">PENSION</p>
                  <p v-else-if="row.value === 4">HMO</p>
                  <p v-else>---</p>
                </template>
                <template #cell(pd_basic)="row">
                  <p v-if="row.value === '1'">BASIC</p>
                  <p v-else-if="row.value === '0'">NONBASIC</p>
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
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
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
        <div class="d-flex justify-content-between flex-lg-row flex-column">
          <b-form-group>
            <label for="user_type">Payment Type</label><br />
            <b-form-radio-group
              id="user_type"
              v-model="type"
              :options="types"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
          <b-form-group>
            <label for="user_status">Payment Variant</label><br />
            <b-form-radio-group
              id="user_status"
              v-model="variant"
              :options="variants"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
        </div>
        <div class="d-flex justify-content-between flex-lg-row flex-column">
          <b-form-group>
            <label for="user_type">Payment Taxable</label><br />
            <b-form-radio-group
              id="user_type"
              v-model="taxable"
              :options="taxables"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
          <b-form-group>
            <label for="user_status">Basic</label><br />
            <b-form-radio-group
              id="user_status"
              v-model="basic"
              :options="basics"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
        </div>
        <div class="form-group">
          <div class="row">
            <div class="col-12">
              <label>
                Percentage of Gross <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="pdPrGross"
                class="form-control"
                min="0"
                :class="{
                  'is-invalid': submitted && $v.pdPrGross.$error,
                }"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="row">
            <div class="col-6">
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
            <div class="col-6">
              <b-form-group>
                <label>Percentage of</label><br />
                <b-form-radio-group
                  id="user_type"
                  v-model="pdAmount"
                  :options="pdAmounts"
                  button-variant="outline-success"
                  buttons
                />
              </b-form-group>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="row">
            <div class="col-6">
              <label> Percentage % <span class="text-danger">*</span> </label>
              <input
                type="number"
                step="0.01"
                v-model="pdPercentage"
                class="form-control"
                min="0"
              />
            </div>

            <div class="col-6">
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
      ref="edit-payment-definition"
      title="Update Payment Definition"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
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
        <div class="d-flex justify-content-between flex-lg-row flex-column">
          <b-form-group>
            <label for="user_type">Payment Type</label><br />
            <b-form-radio-group
              id="user_type"
              v-model="type"
              :options="types"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
          <b-form-group>
            <label for="user_status">Payment Variant</label><br />
            <b-form-radio-group
              id="user_status"
              v-model="variant"
              :options="variants"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
        </div>
        <div class="d-flex justify-content-between flex-lg-row flex-column">
          <b-form-group>
            <label for="user_type">Payment Taxable</label><br />
            <b-form-radio-group
              id="user_type"
              v-model="taxable"
              :options="taxables"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
          <b-form-group>
            <label for="user_status">Basic</label><br />
            <b-form-radio-group
              id="user_status"
              v-model="basic"
              :options="basics"
              button-variant="outline-success"
              buttons
            />
          </b-form-group>
        </div>
        <!--        <b-form-group>-->
        <!--          <label for="user_status">Description</label><br />-->
        <!--          <b-form-radio-group-->
        <!--            id="user_status"-->
        <!--            v-model="description"-->
        <!--            :options="descriptions"-->
        <!--            button-variant="outline-success"-->
        <!--            buttons-->
        <!--          />-->
        <!--        </b-form-group>-->
        <!--        <div class="form-group">-->
        <!--          <label for="token">Tie Number</label>-->
        <!--          <input id="token" type="text" v-model="tie" class="form-control" />-->
        <!--        </div>-->

        <div class="form-group">
          <div class="row">
            <div class="col-12">
              <label>
                Percentage of Gross <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                v-model="pdPrGross"
                class="form-control"
                min="0"
                :class="{
                  'is-invalid': submitted && $v.pdPrGross.$error,
                }"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="row">
            <div class="col-6">
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
            <div class="col-6">
              <b-form-group>
                <label>Percentage of</label><br />
                <b-form-radio-group
                  id="user_type"
                  v-model="pdAmount"
                  :options="pdAmounts"
                  button-variant="outline-success"
                  buttons
                />
              </b-form-group>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="row">
            <div class="col-6">
              <label> Percentage % <span class="text-danger">*</span> </label>
              <input
                type="number"
                step="0.01"
                v-model="pdPercentage"
                class="form-control"
                min="0"
              />
            </div>

            <div class="col-6">
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
