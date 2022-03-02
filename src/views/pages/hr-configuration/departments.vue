<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from 'vue-multiselect';
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Sector",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  mounted() {
    this.refreshTable();
    this.getEmployees();
  },

  validations: {
    name: { required },
    t3_code: { required },
  },
  methods: {
    employeeLabel ({ text }) {
      return `${text}`
    },
    refreshTable() {
      this.apiGet(this.ROUTES.department, "Get Departments Error").then(
        (res) => {
          const { data } = res;
          this.depts = data.departments;
          this.sectorLeads = data.sectorsLeads;
          this.totalRows = this.depts.length;
          this.depts.forEach((dep, index) => {
            this.depts[index] = { sn: ++index, ...dep };
          });
          this.depts.forEach((depart) => {
            this.sectorLeads.forEach((lead) => {
              if (depart.d_sector_lead_id === parseFloat(lead.emp_id)) {
                depart["leader"] = `${lead.emp_first_name} ${
                  lead.emp_last_name !== null ? lead.emp_last_name : ""
                } ${lead.emp_other_name !== null ? lead.emp_other_name : ""} (${lead.emp_unique_id})`;
              }
            });
          });
        }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.name = null;
      this.t3_code = null;
      this.$v.$reset();
    },
    selectDept(dept) {
      dept = dept[0];
      console.log({ dept });
      this.deptID = dept.department_id;
      this.name = dept.department_name;
      this.t3_code = dept.d_t3_code;
      this.sector_lead = dept.d_sector_lead_id;
      this.$refs["update-dept"].show();
      this.$refs["dept-table"].clearSelected();
    },
    getEmployees() {
      const url = `${this.ROUTES.employee}`;
      this.apiGet(url, "Couldn't get employees").then((res) => {
        this.employee_list = [
          { value: null, text: "Please select sector lead" },
        ];
        const { data } = res;
        data.forEach((emp) => {
          this.employee_list.push({
            value: emp.emp_id,
            text: `${emp.emp_first_name} ${emp.emp_last_name} ${
              emp.emp_other_name !== null ? emp.emp_other_name : ""
            } (${emp.emp_unique_id})`,
          });
        });
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Department");
      } else {
        const data = {
          department_name: this.name,
          t3_code: this.t3_code,
          sector_lead: this.sector_lead.value,
        };
        this.apiPost(this.ROUTES.department, data, "Add Department Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "New Department Added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-dept"].hide();
          }
        );
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Department");
      } else {
        const data = {
          department_name: this.name,
          t3_code: this.t3_code,
          sector_lead: this.sector_lead.value,
        };
        const url = `${this.ROUTES.department}/${this.deptID}`;
        this.apiPatch(url, data, "Update Department Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-dept"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Sectors",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Sectors",
          active: true,
        },
      ],
      depts: [],
      sectorLeads: [],
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
        { key: "department_name", label: "Sector Name", sortable: true },
        { key: "d_t3_code", label: "T3 Code", sortable: true },
        { key: "leader", label: "Sector Lead", sortable: true },
      ],
      name: null,
      t3_code: null,
      deptID: null,
      sector_lead: null,
      employee_list: [{ value: null, text: "Please select a sector lead" }],
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-dept'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Sector
      </b-button>
    </div>
    <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
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
                ref="dept-table"
                bordered
                selectable
                hover
                :items="depts"
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
                @row-selected="selectDept"
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
    <b-modal
      ref="add-dept"
      title="Add Sector"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name">
            Sector Name <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            T3 Code <span class="text-danger">*</span>
          </label>
          <input
            id="t3_code"
            type="text"
            v-model="t3_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            Sector Lead <span class="text-danger">*</span>
          </label>
          <multiselect
                  v-model="sector_lead"
                  :options="employee_list"
                  :custom-label="employeeLabel"
                  :class="{
                      'is-invalid': submitted && $v.employee_list.$error,
                    }"
          ></multiselect>
        </div>
        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>
    <b-modal
      ref="update-dept"
      title="Update Sector"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            Sector Name <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            type="text"
            v-model="name"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            T3 Code <span class="text-danger">*</span>
          </label>
          <input
            id="t3_code"
            type="text"
            v-model="t3_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.t3_code.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="t3_code">
            Sector Lead <span class="text-danger">*</span>
          </label>
          <multiselect
                  v-model="sector_lead"
                  :options="employee_list"
                  :custom-label="employeeLabel"
                  :class="{
                      'is-invalid': submitted && $v.employee_list.$error,
                    }"
          ></multiselect>
        </div>
        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submit
        </b-button>
        <b-button
          v-else
          disabled
          class="btn btn-success btn-block mt-4"
          type="submit"
        >
          Submitting...
        </b-button>
      </form>
    </b-modal>
  </Layout>
</template>
