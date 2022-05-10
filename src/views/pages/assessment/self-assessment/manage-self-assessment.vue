<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Manage Self Assessment",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
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
      const url = `${this.ROUTES.selfAssessment}/get-all-self-assessments`;
      this.apiGet(url, "Could not retrieve self assessments Error").then((res) => {
        const { data } = res;
        //console.log(data);
        data.forEach((assess, index) => {
          this.assessments[index] = { sn: ++index,
            emp: `${assess.employee?.emp_first_name} ${assess.employee?.emp_last_name}  - ${assess.employee?.emp_unique_id}`,
            year: `${ assess.goal?.gs_year } `,
            //start_date: `${ new Date(assess.goal?.gs_from).toDateString() } `,
            gs_period: `${ new Date(assess.goal?.gs_from).toDateString() } - ${ new Date(assess.goal?.gs_to).toDateString() } `,
            //end_date: `${ new Date(assess.goal?.gs_to).toDateString() } `,
            empId: assess.employee.emp_id,
            gsId: assess.goal.gs_id,
            masterId: assess.sam_id,
            supervisor: `${assess.supervisor?.emp_first_name} ${assess.supervisor?.emp_last_name} - ${assess.supervisor?.emp_unique_id}`,
          };
        });
        this.totalRows = this.assessments.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.employeeId = row.empId;
      this.selectedYear = row.year;
      //console.log(row);
      //this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "self-assessment-backoffice-breakdown",
        params: { year: this.selectedYear, employee: this.employeeId },
      });
    },
  },
  data() {
    return {
      title: "Manage Self Assessments",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Self Assessments",
          active: true,
        },
      ],
      applications: [],
      assessments: [],
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
        { key: "emp", label: "Employee", sortable: true },
        { key: "gs_period", label: "Goal Setting Period", sortable: true },
        {
          key: "year",
          label: "Year",
          sortable: true,
        },
        { key: "supervisor", label: "Supervisor", sortable: true },
      ],
      leaveAppID: null,
      employeeId: null,
      selectedYear: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else class="row d-flex justify-content-end">
      <div class=" mb-3">
        <b-button
          class="btn btn-secondary"
          @click="$router.go(-1)"
        >
          <i class="mdi mdi-step-backward mr-2"></i>
          Go Back
        </b-button>
      </div>
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mt-4">
              <div class="col-sm-12 col-md-6">
                <p><strong>Note: </strong> List of all approved self-assessments.</p>
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
                ref="donor-table"
                bordered
                selectable
                hover
                :items="assessments"
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
