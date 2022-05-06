<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Self Assessment",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.getOpenGoalSetting();
    this.getSelfAssessmentMaster();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Self Assessment",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Self Assessment",
          href: "/self-assessment",
          active: true,
        },
      ],
      openGoalActivity: null,
      openGoalActivityYear: null,

      assessments: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      posted_on: null,
      audience: null,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        {
          key: "target",
          label: "Goal Setting Period",
          sortable: true,
        },
        { key: "year", label: "Goal Setting Year", sortable: true },
        { key: "type_of_activity", label: "Activity Type", sortable: true },
        { key: "officer", label: "Supervisor", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
          key: "date_published",
          label: "Date",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    getSelfAssessmentMaster() {
      const empId = this.getEmployee.emp_id;
      const supervisor = this.getEmployee.supervisor;
      const officer = `${supervisor.emp_first_name} ${supervisor.emp_last_name} - ${supervisor.emp_unique_id}`;
      console.log("employee", this.getEmployee);
      const url = `${this.ROUTES.selfAssessment}/get-self-assessment-master/${empId}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        console.log(data.emp);

        data.emp.map((ass, index) => {
          let activity = null;
          switch (parseInt(ass.goal.gs_activity)) {
            case 1:
              activity = "Beginning of Year";
              break;
            case 2:
              activity = "Mid-Year";
              break;
            case 3:
              activity = "End of Year";
              break;
          }
          let localData = {
            sn: ++index,
            target: `${new Date(ass.goal.gs_from).toDateString()} - ${new Date(
              ass.goal.gs_to
            ).toDateString()}`,
            status: parseInt(ass.sam_status) === 1 ? "Approved" : "Pending",
            type_of_activity: activity,
            year: ass.goal.gs_year,
            date_published: new Date(ass.createdAt).toDateString(),
            officer:
              parseInt(ass.sam_status) === 1
                ? `${ass.supervisor?.emp_first_name} ${ass.supervisor?.emp_last_name} - ${ass.supervisor?.emp_unique_id}`
                : officer,
            ...ass,
          };
          this.assessments.push(localData);
        });
      });
    },
    getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityYear = data[0].gs_year;
        }
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectEmployee(employee) {
      //console.log(employee);
      let gsPeriod = employee[0].goal.gs_activity;
      let gsId = employee[0].goal.gs_id;
      employee = employee[0];
      this.employeeId = employee.sam_emp_id;
      if (parseInt(gsPeriod) === 1) {
        this.$router.push({
          name: "assessment-details",
          params: {
            empid: this.employeeId,
            gsId: gsId,
          },
        });
      } else if (parseInt(gsPeriod) === 2) {
        this.$router.push({
          name: "assess-mid-year-details",
          params: {
            empid: this.employeeId,
            gsId: 2,
          },
        });
      } else {
        this.$router.push({
          name: "assess-end-year-details",
          params: {
            empid: this.employeeId,
          },
        });
      }
    },
  },
};
</script>
<style>
.back {
  cursor: pointer;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">Beginning of Year</h4>
              </div>
              <div>
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 1"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'beginning-of-year' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">Mid Year Checking</h4>
              </div>
              <div class="text-secondary">
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 2"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'mid-year-checking' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mb-2">
                  Goal setting for year
                  <strong>{{ openGoalActivityYear }}</strong>
                </p>
                <h4 class="mb-0">End of Year</h4>
              </div>
              <div class="text-secondary">
                <span
                  class="badge badge-primary badge-pill"
                  v-if="openGoalActivity === 3"
                >
                  open
                </span>
                <span class="badge badge-pill badge-warning" v-else>
                  closed
                </span>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-3">
            <div
              class="d-flex align-items-center text-success d-inline-flex"
              style="cursor: pointer"
              @click="$router.push({ name: 'end-of-year-assessment' })"
            >
              <span class="mr-2">View more</span>
              <i class="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h6 class="text-uppercase">
              Previously Submitted Self-assessments
            </h6>
          </div>
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
                @row-selected="selectEmployee"
              >
                <template #cell(status)="row">
                  <p class="mb-0">
                    <span
                      class="badge badge-primary badge-pill"
                      v-if="row.item.status === 'Approved'"
                    >
                      Approved
                    </span>

                    <span
                      class="badge badge-warning badge-pill"
                      v-if="row.item.status === 'Pending'"
                    >
                      Pending
                    </span>
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
