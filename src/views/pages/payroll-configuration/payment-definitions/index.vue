<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import payrollConfigService from "@/services/payroll-config.service";

export default {
  mixins: [payrollConfigService],
  page: {
    title: "Payment Definitions",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.getPaymentDefinitions().then((res) => {
      const { data } = res;
      this.paymentDefinitions = data;
      this.totalRows = this.paymentDefinitions.length;
    });
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
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
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-user'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Payment Definition
      </b-button>
    </div>
    <div class="row">
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
                ref="user-table"
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
                @row-selected="selectUser"
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
  </Layout>
</template>
