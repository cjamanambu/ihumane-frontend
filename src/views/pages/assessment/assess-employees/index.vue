<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Assess Employees",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },

  async mounted() {
    await this.getOpenGoalSetting();
    this.refreshTable();
  },
  validations: {
    start: { required },
    end: { required },
    duration: { required },
  },
  data() {
    return {
      title: "Assess Employees",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Assess Employees",
          href: "/assess-employees",
          active: true,
        },
      ],
      activeGoalId:null,
      openGoalActivity:null,
      openGoalActivityId:null,
      employees: [],
      supervisor_assessments: [],
      employeeId: null,
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
        {
          key: "emp_unique_id",
          label: "T7 Number (Unique ID)",
          sortable: true,
        },
        { key: "name", label: "Employee", sortable: true },
        { key: "emp_office_email", label: "Email", sortable: true },
        { key: "emp_phone_no", label: "Phone", sortable: true },
      ],
      sup_fields: [
        { key: "sn", label: "S/n", sortable: true },
        {
          key: "target",
          label: "Goal",
          sortable: true,
        },
        { key: "officer", label: "Employee", sortable: true },
        { key: "year", label: "Year", sortable: true },
        { key: "type_of_activity", label: "Activity Type", sortable: true },

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
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectEmployee(employee) {
      let gsId = employee[0].sam_gs_id
      employee = employee[0].employee;
      this.employeeId = employee.emp_id;

      if(parseInt(gsId) === 1){
        this.$router.push({
          name: "assess-employee",
          params: {
            empid: this.employeeId,
          },
        });
      }else if(parseInt(gsId) === 2){
        this.$router.push({
          name: "mid-year-assess-employee",
          params: {
            empid: this.employeeId,
            gsId:2
          },
        });
      }

    },
    async getOpenGoalSetting() {
      const url = `${this.ROUTES.goalSetting}/get-open-goal-setting`;
      await this.apiGet(url).then((res) => {
        const { data } = res;
        if (data.length > 0) {

          this.activeGoalId = parseInt(data[0].gs_id);
          this.openGoalActivity = parseInt(data[0].gs_activity);
          this.openGoalActivityId = parseInt(data[0].gs_id);
          this.openGoalActivityFrom = data[0].gs_from;
          this.openGoalActivityTo = data[0].gs_to;
          this.openGoalActivityYear = data[0].gs_year;
          this.checkOpenGoal = 1;

        }
      });
    },
    refreshTable() {
      const url = `${this.ROUTES.employee}/get-supervisor-employees/${this.getEmployee.emp_id}`;
      this.apiGet(url).then((res) => {
        const { data } = res;
        //console.log(data);
        /*if (data) {
          data.forEach((employee, index) => {
            this.employees[index] = { sn: ++index, ...employee };
          });
          this.totalRows = this.employees.length;
        }*/

        //supervisor
        data.forEach((ass, index)=>{
          let activity = null;
          switch(parseInt(ass.goal.gs_activity)){
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
          let supData = {
            sn:++index,
            target:`${new Date(ass.goal.gs_from).toDateString()} - ${ new Date(ass.goal.gs_to).toDateString()}`,
            status: parseInt(ass.sam_status) === 1 ? 'Approved' : 'Pending',
            type_of_activity:activity,
            gsId:ass.sam_gs_id,
            year:ass.goal.gs_year,
            date_published:new Date(ass.createdAt).toDateString(),
            officer:`${ass.employee.emp_first_name} ${ass.employee.emp_last_name} - ${ass.employee.emp_unique_id}`,
            ...ass}
          this.supervisor_assessments.push(supData);
        })

      });
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
    <div v-else class="row">
      <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="text-uppercase">Supervisor</h6>
            </div>
            <div class="card-body">
              <div class="row mt-4">
                <div class="col-sm-12 col-md-6">
                  <div id="tickets-table_length-supervisor" class="dataTables_length">
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
                    id="tickets-table_filter-supervisor"
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
                  :items="supervisor_assessments"
                  :fields="sup_fields"
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
