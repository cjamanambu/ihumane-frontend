<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import JsonExcel from "vue-json-excel";
export default {
  page: {
    title: "Employee Report",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    JsonExcel,
  },
  async mounted() {
    this.refreshTable();
  },
  methods: {
    refreshTable() {
      this.type = this.$route.params.type;
      if (this.type === "all") {
        this.status = "All Employees";
      } else if (this.type === 1) {
        this.status = "Active Employees";
      } else if (this.type === 0) {
        this.status = "Inactive Employees";
      }
      let data = {
        type: this.$route.params.type,
      };
      const url = `${this.ROUTES.employee}/get-employee-report`;
      this.apiPost(url, data, "Generate Employee Report").then((res) => {
        const { data } = res;
        data.forEach((employee, index) => {
          let employeeObj = {
            sn: ++index,
            emp_unique_id: employee.emp_unique_id,
            emp_first_name: employee.emp_first_name,
            emp_last_name: employee.emp_last_name,
            emp_office_email: employee.emp_office_email,
            emp_personal_email: employee.emp_personal_email,
            emp_phone_no: employee.emp_phone_no,
            sector: employee.sector,
            location: employee.location.l_t6_code,
          };
          employee.sector
            ? (employeeObj.sector = employee.sector.d_t3_code)
            : null;
          employee.location
            ? (employeeObj.location = employee.location.l_t6_code)
            : null;
          this.employees.push(employeeObj);
        });
        this.filtered = this.employees;
        this.totalRows = this.employees.length;
        this.fields.forEach((field) => {
          let key = field.key;
          if (key === "sn") {
            this.jsonFields["S/N"] = key;
          } else if (key === "emp_unique_id") {
            this.jsonFields["T7 NUMBER"] = key;
          } else if (key === "emp_first_name") {
            this.jsonFields["FIRST NAME"] = key;
          } else if (key === "emp_last_name") {
            this.jsonFields["LAST NAME"] = key;
          } else if (key === "emp_office_email") {
            this.jsonFields["OFFICIAL EMAIL"] = key;
          } else if (key === "emp_personal_email") {
            this.jsonFields["PERSONAL EMAIL"] = key;
          } else if (key === "emp_phone_no") {
            this.jsonFields["PHONE NUMBER"] = key;
          } else if (key === "sector") {
            this.jsonFields["SECTOR"] = key;
          } else if (key === "location") {
            this.jsonFields["LOCATION"] = key;
          }
        });
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.filtered = filteredItems;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "Employee Report",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Employee Report",
          active: true,
        },
      ],
      employees: [],
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
          label: "T7 Code (Unique ID)",
          sortable: true,
        },
        { key: "emp_first_name", label: "First Name", sortable: true },
        { key: "emp_last_name", label: "Last Name", sortable: true },
        { key: "emp_office_email", label: "Official Email", sortable: true },
        { key: "emp_personal_email", label: "Personal Email", sortable: true },
        { key: "emp_phone_no", label: "Phone", sortable: true },
        {
          key: "sector",
          label: "T3 Code (Sector)",
          sortable: true,
        },
        {
          key: "location",
          label: "T6 Code (Location)",
          sortable: true,
        },
      ],
      jsonFields: {},
      filtered: [],
      status: null,
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
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0">
                Employee Report ({{ status }})
                {{ new Date().toDateString() }}
              </h5>
              <span class="font-size-12 text-success">
                <JsonExcel
                  style="cursor: pointer"
                  :data="filtered"
                  :fields="jsonFields"
                  :name="`Employee_Report(${status}_${new Date().toDateString()}).xls`"
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
            <div class="table-responsive mb-0" v-if="employees.length">
              <b-table
                ref="donor-table"
                bordered
                hover
                small
                :items="employees"
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
              </b-table>
            </div>
            <div v-else>
              <p class="text-center my-5">
                Populating report table, please wait...
              </p>
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
