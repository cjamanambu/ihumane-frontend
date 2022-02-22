<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Emolument Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      this.period = this.$route.params.period;
      this.period = this.period.split("-");
      let data = {
        pym_month: parseFloat(this.period[0]),
        pym_year: parseFloat(this.period[1]),
      };
      const url = `${this.ROUTES.salary}/pull-emolument`;
      this.apiPost(url, data, "Generate Emolument Report").then((res) => {
        const { data } = res;
        console.log({ data });
        data.forEach((emolument, index) => {
          this.emoluments[index] = { sn: ++index, ...emolument };
        });
        this.totalRows = this.emoluments.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "Emolument Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Emolument Report",
          active: true,
        },
      ],
      period: null,
      emoluments: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        { key: "employeeName", label: "Employee", sortable: true },
        { key: "employeeUniqueId", label: "T7 Number", sortable: true },
        { key: "location", label: "Location (T6)", sortable: true },
        { key: "sector", label: "Sector (T3)", sortable: true },
        {
          key: "income",
          label: "Entitlements",
          sortable: true,
          thStyle: { width: "20%" },
        },
        {
          key: "deduction",
          label: "Deductions",
          sortable: true,
          thStyle: { width: "20%" },
        },
        { key: "netSalary", label: "Net Salary", sortable: true },
      ],
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$router.push('/reports')">
        <i class="mdi mdi-plus mr-2"></i>
        Reports
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0" v-if="period">
                Emolument Report For Payroll Period:
                {{ (parseInt(period[0]) - 1) | getMonth }}
                {{ period[1] }}
              </h5>
            </div>
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
            <div class="table-responsive mb-0" v-if="emoluments.length">
              <b-table
                ref="emolument-table"
                bordered
                hover
                :items="emoluments"
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
              >
                <template #cell(income)="row">
                  <div
                    class="d-flex justify-content-between"
                    v-for="(income, index) in row.item.incomes"
                    :key="index"
                  >
                    <small>{{ income.paymentName }}</small>
                    <small class="text-muted">
                      {{ parseFloat(income.amount).toLocaleString() }}
                    </small>
                  </div>
                  <strong
                    class="d-flex justify-content-between mt-1 text-success"
                  >
                    <span>Total</span>
                    <span>
                      {{ parseFloat(row.item.grossSalary).toLocaleString() }}
                    </span>
                  </strong>
                </template>
                <template #cell(deduction)="row">
                  <div
                    class="d-flex justify-content-between"
                    v-for="(deduction, index) in row.item.deductions"
                    :key="index"
                  >
                    <small>{{ deduction.paymentName }}</small>
                    <small class="text-muted">
                      {{ parseFloat(deduction.amount).toLocaleString() }}
                    </small>
                  </div>
                  <strong
                    class="d-flex justify-content-between mt-1 text-danger"
                  >
                    <span>Total</span>
                    <span>
                      {{ parseFloat(row.item.totalDeduction).toLocaleString() }}
                    </span>
                  </strong>
                </template>
                <template #cell(netSalary)="row">
                  <p class="mb-0">
                    {{ row.value.toLocaleString() }}
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
  </Layout>
</template>
