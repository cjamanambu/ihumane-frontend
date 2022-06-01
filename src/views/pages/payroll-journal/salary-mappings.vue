<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import NewSalaryMappingForm from "./components/new-salary-mapping-form";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 1 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Salary Mappings",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    NewSalaryMappingForm,
  },
  mounted() {
    this.refreshTable();
  },
  data() {
    return {
      title: "Salary Mappings",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Mappings",
          active: true,
        },
      ],
      mappings: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "5%" } },
        { key: "location", label: "Location (T6)", sortable: true },
        { key: "smm_month", label: "Month", sortable: true },
        { key: "smm_year", label: "Year", sortable: true },
        { key: "smm_ref_code", label: "Ref Code", sortable: true },
        {
          key: "smm_total",
          label: "No. Rounds",
          sortable: true,
          thStyle: { width: "10%" },
        },
        { key: "smm_posted", label: "Status", sortable: true },
      ],
    };
  },
  methods: {
    refreshTable() {
      let url = `${this.ROUTES.payrollJournal}/salary-mappings`;
      this.apiGet(url, "Get Salary Mappings Error").then(async (res) => {
        const { data } = res;
        console.log({ data });
        data.forEach((mapping, index) => {
          this.mappings[index] = { sn: ++index, ...mapping };
        });
        this.totalRows = this.mappings.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectMapping(mapping) {
      mapping = mapping[0];
      const masterId = mapping.smm_id;
      this.$router.push({
        name: "salary-mapping-detail",
        params: { masterId },
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <NewSalaryMappingForm @uploaded="refreshTable" />
    <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
    <div v-else class="row mt-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">All Salary Mappings</h5>
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
                :items="mappings"
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
                @row-selected="selectMapping"
              >
                <template #cell(smm_posted)="row">
                  <span v-if="row.value === 0"> PENDING </span>
                  <span v-else-if="row.value === 1"> PROCESSED </span>
                </template>
                <template #cell(smm_month)="row">
                  {{ (parseInt(row.value) - 1) | getMonth }}
                </template>
                <template #cell(location)="row">
                  <span>
                    {{ row.value.location_name }} - {{ row.value.l_t6_code }}
                  </span>
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
