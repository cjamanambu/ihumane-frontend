<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Manage Employees ",
    meta: [{ name: "description", content: appConfig.description }],
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
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        const { data } = res;
        console.log(data)
        data.forEach((employee, index) => {
          this.employees[index] = { sn: ++index, ...employee };
        });
        this.totalRows = this.employees.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.employeeID = row.emp_id;
      this.$router.push({
        name: "manage-employee",
        params: { employeeID: this.employeeID },
      });
    },
  },
  data() {
    return {
      title: "Manage Employees ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Employees ",
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
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
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
      employeeID: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'new-employee' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        New Employee
      </b-button>
    </div>
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
                select-mode="single"
                @row-selected="selectRow"
              >
                <template #cell(name)="row">
                  <span>
                    {{ row.item.emp_first_name }}
                    {{ row.item.emp_last_name }}
                  </span> <br>
                  <small>{{ row.item.emp_unique_id }}</small>
                </template>
                <template #cell(email)="row">
                  <p class="mb-0">
                    {{ row.item.emp_office_email }}
                  </p>
                  <small>{{ row.item.emp_personal_email }}</small>
                </template>
                <template #cell(sector)="row">
                  <p class="mb-0">
                    {{ row.value.d_t3_code }}
                  </p>
                  <small>{{ row.value.department_name }}</small>
                </template>
                <template #cell(location)="row">
                  <p class="mb-0">
                    {{ row.value.l_t6_code }}
                  </p>
                  <small>{{ row.value.location_name }}</small>
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
