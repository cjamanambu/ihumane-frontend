<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import GenerateJournalReportForm from "./components/generate-journal-report-form";
import JsonExcel from "vue-json-excel";

export default {
  page: {
    title: "Payroll Journal Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    GenerateJournalReportForm,
    JsonExcel,
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
      filtered: [],
      jsonFields: {},
    };
  },
  methods: {
    processReport(value) {
      let { location, period, journals } = value;
      if (location && period) {
        location = location.value;
        this.journals = journals;
        this.filtered = this.journals;
        this.totalRows = journals.length;
        this.fields.forEach((field) => {
          let key = field.key;
          if (key === "sn") {
            this.jsonFields["S/N"] = key;
          } else if (key === "j_acc_code") {
            this.jsonFields["ACC"] = key;
          } else if (key === "j_date") {
            this.jsonFields["TRANS DATE"] = key;
          } else if (key === "j_ref_code") {
            this.jsonFields["REFERENCE"] = key;
          } else if (key === "j_d_c") {
            this.jsonFields["D/C"] = key;
          } else if (key === "j_desc") {
            this.jsonFields["DESCRIPTION"] = key;
          } else if (key === "j_amount") {
            this.jsonFields["OTHER AMT"] = key;
          } else if (key === "j_t0") {
            this.jsonFields["T0"] = key;
          } else if (key === "j_t1") {
            this.jsonFields["T1"] = key;
          } else if (key === "j_t2") {
            this.jsonFields["T2"] = key;
          } else if (key === "j_t3") {
            this.jsonFields["T3"] = key;
          } else if (key === "j_t4") {
            this.jsonFields["T4"] = key;
          } else if (key === "j_t5") {
            this.jsonFields["T5"] = key;
          } else if (key === "j_t6") {
            this.jsonFields["T6"] = key;
          } else if (key === "j_t7") {
            this.jsonFields["T7"] = key;
          } else if (key === "j_name") {
            this.jsonFields["STAFF NAME"] = key;
          }
        });
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
            console.log({ data });
            this.journals = [];
            if (data) {
              data.forEach((journal, index) => {
                this.journals.push({
                  sn: ++index,
                  j_acc_code: journal.j_acc_code,
                  j_date: journal.j_date,
                  j_ref_code: journal.j_ref_code,
                  j_d_c: journal.j_d_c,
                  j_desc: journal.j_desc,
                  j_amount: this.apiValueHandler(journal.j_amount.toFixed(2)),
                  j_t0: journal.j_t0,
                  j_t1: journal.j_t1,
                  j_t2: journal.j_t2,
                  j_t3: journal.j_t3,
                  j_t4: journal.j_t4,
                  j_t5: journal.j_t5,
                  j_t6: journal.j_t6,
                  j_t7: journal.j_t7,
                  j_name: journal.j_name,
                });
              });
              this.filtered = this.journals;
              this.totalRows = this.journals.length;
              this.fields.forEach((field) => {
                let key = field.key;
                if (key === "sn") {
                  this.jsonFields["S/N"] = key;
                } else if (key === "j_acc_code") {
                  this.jsonFields["ACC"] = key;
                } else if (key === "j_date") {
                  this.jsonFields["TRANS DATE"] = key;
                } else if (key === "j_ref_code") {
                  this.jsonFields["REFERENCE"] = key;
                } else if (key === "j_d_c") {
                  this.jsonFields["D/C"] = key;
                } else if (key === "j_desc") {
                  this.jsonFields["DESCRIPTION"] = key;
                } else if (key === "j_amount") {
                  this.jsonFields["OTHER AMT"] = key;
                } else if (key === "j_t0") {
                  this.jsonFields["T0"] = key;
                } else if (key === "j_t1") {
                  this.jsonFields["T1"] = key;
                } else if (key === "j_t2") {
                  this.jsonFields["T2"] = key;
                } else if (key === "j_t3") {
                  this.jsonFields["T3"] = key;
                } else if (key === "j_t4") {
                  this.jsonFields["T4"] = key;
                } else if (key === "j_t5") {
                  this.jsonFields["T5"] = key;
                } else if (key === "j_t6") {
                  this.jsonFields["T6"] = key;
                } else if (key === "j_t7") {
                  this.jsonFields["T7"] = key;
                } else if (key === "j_name") {
                  this.jsonFields["STAFF NAME"] = key;
                }
              });

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
      this.filtered = filteredItems;
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
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Report Breakdown</h5>
              </div>
              <span class="font-size-12 text-success">
                <JsonExcel
                  style="cursor: pointer"
                  :data="filtered"
                  :fields="jsonFields"
                  :name="`Journal_Report_${journalDetail.j_ref_code}.xls`"
                >
                  Export to Excel
                </JsonExcel>
              </span>
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
                    {{ row.value }}
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
