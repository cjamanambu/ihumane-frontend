<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import GenerateJournalReportForm from "./components/generate-journal-report-form";
export default {
  page: {
    title: "Payroll Journal Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    GenerateJournalReportForm,
  },
  mounted() {
    this.refreshTable();
  },
  data() {
    return {
      title: "Payroll Journal Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Payroll Journal Report",
          active: true,
        },
      ],
      generating: false,
      generated: false,
      journals: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 50,
      pageOptions: [10, 25, 50, 100, 200],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "1%" } },
        { key: "j_acc_code", label: "Acc", sortable: true },
        { key: "j_date", label: "Trans Date", sortable: true },
        { key: "j_ref_code", label: "Reference", sortable: true },
        { key: "j_d_c", label: "D/C", sortable: true },
        { key: "j_desc", label: "Description", sortable: true },
        { key: "j_amount", label: "Other Amt", sortable: true },
        { key: "j_t0", label: "T0", sortable: true },
        { key: "j_t1", label: "T1", sortable: true },
        { key: "j_t2", label: "T2", sortable: true },
        { key: "j_t3", label: "T3", sortable: true },
        { key: "j_t4", label: "T4", sortable: true },
        { key: "j_t5", label: "T5", sortable: true },
        { key: "j_t6", label: "T6", sortable: true },
        { key: "j_t7", label: "T7", sortable: true },
        { key: "j_name", label: "Staff Name", sortable: true },
      ],
      journalDetail: null,
    };
  },
  methods: {
    processReport(value) {
      let { location, period, journals } = value;
      if (location && period) {
        location = location.value;
        this.journals = journals;
        this.totalRows = journals.length;
        this.journalDetail = journals[0];
        this.generated = true;
        this.$router.push({
          name: "journal-report",
          query: {
            period,
            location,
          },
        });
      }
    },
    refreshTable() {
      this.generating = true;
      const { location, period } = this.$route.query;
      if (location && period) {
        this.generated = true;
        const url = `${this.ROUTES.payrollJournal}/get-journal`;
        const data = {
          j_month: period.split("-")[1],
          j_year: period.split("-")[0],
          j_location: location,
        };
        this.apiPost(url, data, "Get Journal Error")
          .then((res) => {
            const { data } = res;
            this.journals = [];
            if (data) {
              data.forEach((journal, index) => {
                this.journals.push({
                  sn: ++index,
                  ...journal,
                });
              });
              this.totalRows = this.journals.length;
              this.journalDetail = this.journals[0];
              this.generating = false;
              this.generated = true;
            }
          })
          .catch(() => {
            this.generating = false;
            this.generated = true;
          });
      } else {
        this.generating = false;
        this.generated = false;
      }
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-lg-5">
        <GenerateJournalReportForm @generated="processReport" />
      </div>
      <div class="col-lg-7">
        <div class="card" v-if="generated">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Report Details</h5>
              </div>
            </div>
            <div class="row" v-if="journalDetail">
              <div class="col-md-6">
                <div class="d-flex justify-content-between">
                  <strong>BOOK</strong>
                  <span>NATIONAL PAY</span>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>CURRENCY</strong>
                  <span>2NG</span>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>REFERENCE</strong>
                  <span>{{ journalDetail.j_ref_code }}</span>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>PERIOD</strong>
                  <span
                    >{{
                      (parseInt(journalDetail.j_date.split("-")[1]) - 1)
                        | getMonth
                    }}
                    {{ journalDetail.j_date.split("-")[2] }}</span
                  >
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>DATE</strong>
                  <span>{{ journalDetail.j_date }}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex justify-content-between">
                  <strong>USERID</strong>
                  <span>T1</span>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>JOURNAL TYPE</strong>
                  <span>JV</span>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <strong>COUNTRY CODE</strong>
                  <span>2NG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!generated" class="alert alert-info">
      Please generate journal report to view breakdown for a period and location
      below
    </div>
    <div v-else class="row mt-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Report Breakdown</h5>
              </div>
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
            <div class="table-responsive mb-0">
              <b-table
                ref="dept-table"
                bordered
                selectable
                hover
                :items="journals"
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
              >
                <template #cell()="row">
                  <span class="text-nowrap">
                    {{ row.value }}
                  </span>
                </template>
                <template #cell(j_amount)="row">
                  <p class="text-nowrap text-right mb-0">
                    {{ apiValueHandler(row.value.toFixed(2)) }}
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
