<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Salary Mapping Details",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.fetchMapping();
  },
  data() {
    return {
      title: "Salary Mapping Details",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Mapping Details",
          active: true,
        },
      ],
      master: null,
      location: null,
      processing: false,
      detail: [],
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
        { key: "t7", label: "T7", sortable: true },
        { key: "name", label: "Employee Name", sortable: true },
        { key: "sector", label: "Sector", sortable: true },
        { key: "jobTitle", label: "Job Title", sortable: true },
        { key: "t1", label: "T1", sortable: true },
        { key: "t2s", label: "T2 - Salary", sortable: true },
        { key: "allocation", label: "% Allocation", sortable: true },
        { key: "t2b", label: "T2 - Benefit", sortable: true },
      ],
      fetching: false,
    };
  },
  methods: {
    fetchMapping() {
      this.fetching = true;
      const { masterId } = this.$route.params;
      const url = `${this.ROUTES.payrollJournal}/get-salary-mapping-detail/${masterId}`;
      this.apiGet(url, "Get Salary Mapping Detail Error")
        .then(async (res) => {
          const { data } = res;
          if (data) {
            const { detailData, masterData } = data;
            this.master = masterData;
            this.detail = [];
            detailData.forEach((data, index) => {
              this.detail[index] = { sn: ++index, ...data };
            });
            this.totalRows = this.detail.length;
            await this.fetchLocation(masterData.smm_location);
            this.fetching = false;
          }
        })
        .catch(() => {
          this.fetching = false;
        });
    },
    fetchLocation(locationId) {
      const url = `${this.ROUTES.location}/${locationId}`;
      this.apiGet(url, "Get Location Error").then((res) => {
        const { data } = res;
        if (data) {
          this.location = data;
        }
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    processJournal() {
      this.processing = true;
      const { masterId } = this.$route.params;
      const url = `${this.ROUTES.payrollJournal}/process-salary-mapping/${masterId}`;
      this.apiGet(url, "Process Salary Mapping Error")
        .then((res) => {
          const { data } = res;
          if (data) {
            this.apiResponseHandler(data, "Action Successful");
            this.processing = false;
            this.fetchMapping();
          }
        })
        .catch(() => {
          this.processing = false;
        });
    },
    viewJournalReport() {
      const period = `${this.master.smm_year}-${this.master.smm_month}`;
      const location = this.location.location_id;
      this.$router.push({
        name: "journal-report",
        query: { period, location },
      });
    },
  },
};
</script>

<style>
.jp:hover {
  cursor: not-allowed;
}
.cursor-pointer {
  cursor: pointer;
}
</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push('/salary-mappings')"
      >
        <i class="mdi mdi-plus mr-2"></i>
        All Mappings
      </b-button>
    </div>
    <b-spinner type="grow" v-if="fetching" class="m-2" variant="success" />
    <div v-else>
      <div class="row">
        <div class="col-lg-4">
          <div class="card" v-if="location && master">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <div class="d-inline mb-0">
                  <h5 class="font-size-14 mb-0">Mapping Details</h5>
                </div>
              </div>
              <div class="d-flex justify-content-between">
                <strong>Location</strong>
                <span>
                  {{ location.location_name }} ({{ location.l_t6_code }})
                </span>
              </div>
              <div class="d-flex justify-content-between mt-3">
                <strong> Month </strong>
                <span> {{ (parseInt(master.smm_month) - 1) | getMonth }} </span>
              </div>
              <div class="d-flex justify-content-between mt-3">
                <strong> Year </strong>
                <span> {{ master.smm_year }} </span>
              </div>
              <div class="d-flex justify-content-between mt-3">
                <strong> Ref Code </strong>
                <span> {{ master.smm_ref_code }} </span>
              </div>
              <div class="d-flex justify-content-between mt-3">
                <strong> Uploaded </strong>
                <span> {{ new Date(master.createdAt).toDateString() }} </span>
              </div>

              <div class="mt-4">
                <button
                  v-if="master.smm_posted"
                  disabled
                  class="btn btn-success w-100 mr-3 jp"
                >
                  Journal Processed
                </button>
                <button
                  v-else-if="!processing"
                  @click="processJournal"
                  class="btn btn-success w-100 mr-3"
                >
                  Process Journal
                </button>
                <button v-else disabled class="btn btn-success w-100 mr-3">
                  Processing Journal...
                </button>
              </div>
              <hr v-if="master.smm_posted" />
              <div
                v-if="master.smm_posted"
                class="d-flex justify-content-between mt-3"
              >
                <strong> Actions </strong>
                <span>
                  <span class="mr-2 cursor-pointer text-danger">
                    Undo Processing
                  </span>
                  <strong>|</strong>
                  <span
                    @click="viewJournalReport"
                    class="ml-2 cursor-pointer text-primary"
                  >
                    View Journal Report
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <div class="d-inline mb-0">
                  <h5 class="font-size-14 mb-0">Mapping Journal</h5>
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
                  :items="detail"
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
                  <template #cell(smm_posted)="row">
                    <span v-if="row.value === 0"> PENDING </span>
                    <span v-else-if="row.value === 1"> PROCESSED </span>
                  </template>
                  <template #cell(smm_month)="row">
                    {{ (parseInt(row.value) - 1) | getMonth }}
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
    </div>
  </Layout>
</template>
