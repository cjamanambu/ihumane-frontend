<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Employee Leave Accrual",
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
      const url = `${this.ROUTES.leaveAccrual}/employee-leave-accruals`;
      this.apiGet(url, "Get Leave Accrual Error").then((res) => {
        const { data } = res;

        data.leave_types.forEach((l_type)=>{
          let field = {
            key:`key_${l_type.leave_type_id}`,
            label:l_type.leave_name,
            sortable:true
          };
          this.fields.push(field);
           this.newFields.push(field);
        })
        this.accruals = data.accruals;
        const data_holder = [];
        this.accruals.forEach((leave)=>{
          let keyV = `key_${leave.leave_type.leave_type_id}`;
          let val = leave.lea_rate;
          data_holder.push({
            [keyV]:val,
            t7:leave.employee.emp_unique_id,
            t6:leave.employee.location.location_name,
            employee_details:`${leave.employee.emp_first_name} ${leave.employee.emp_last_name}`,
            t3:leave.employee.JobRole.Department.department_name,
            ...leave
          });
        });
        this.accruals = data_holder;

      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.leaveAppID = row.leapp_id;
      this.$router.push({
        name: "leave-application-details",
        params: { leaveAppID: this.leaveAppID },
      });
    },
  },
  data() {
    return {
      title: " Employee Leave Accrual",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: " Employee Leave Accrual",
          active: true,
        },
      ],
      leave_types: [],
      emp_leave_types: [],
      accruals: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      newFields:[],
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        { key: "t7", label: "T7", sortable: true },
        { key: "employee_details", label: "Name", sortable: true },
        { key: "t6", label: "T6", sortable: true },
        { key: "t3", label: "T3", sortable: true },
      ],
      leaveAppID: null,
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
                :items="accruals"
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
