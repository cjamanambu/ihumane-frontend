<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: " Queries ",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed:{
    ...authComputed,
  },
  mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      const url = `${this.ROUTES.queries}/employee/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        data.list.forEach((query, index) => {
          this.queries[index] = {
            sn: ++index, subject:query.q_subject,
            employee:`${query.offender.emp_first_name} ${query.offender.emp_last_name}`,
            emp_id:query.q_queried,
            query_id:query.q_id,
            type:`${query.q_query_type == 1 ? 'Warning' : 'Query'}`,
            queried_by:`${query.issuer.emp_first_name} ${query.issuer.emp_last_name}`,
            summary:`${query.q_body.replace( /(<([^>]+)>)/ig, '').length > 50 ? query.q_body.replace( /(<([^>]+)>)/ig, '').substr(0,47) : query.q_body.replace( /(<([^>]+)>)/ig, '')}`,
            date:`${new Date(query.createdAt).toDateString()}`,
            ...query };
        });
        this.totalRows = this.queries.length;
      });
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.queryId = row.query_id;
      this.$router.push({
        name: "read-query",
        params: { qId: this.queryId },
      });
    },
  },
  data() {
    return {
      title: " Queries ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: " Queries ",
          active: true,
        },
      ],
      employees: [],
      types: [
        {
          value:"1",
          text:"Warning",
        },
        {
          value:"2",
          text:"Query",
        },
      ],
      queries: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      posted_on:null,
      audience:null,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        {
          key: "subject",
          label: "Subject",
          sortable: true,
        },
        { key: "employee", label: "Employee", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "queried_by", label: "Queried By", sortable: true },
        {
          key: "date",
          label: "Date",
          sortable: true,
        },
      ],
      employeeID: null,
      queryId: null,
      subject:null,
      selectedTarget:null,
      attachment:null,
      body:null,
      persons:[],

    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
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
                ref="donor-table"
                bordered
                selectable
                hover
                :items="queries"
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
