<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
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
    title: "Salary Grades",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  watch: {
    min: function (newVal) {
      const result = newVal
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.min = result));
    },
    mid: function (newVal) {
      const result = newVal
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.mid = result));
    },
    max: function (newVal) {
      const result = newVal
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.max = result));
    },
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    name: { required },
    min: { required },
    mid: { required },
    max: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.salaryGrade, "Get Salary Grades Error").then(
        (res) => {
          const { data } = res;
          data.forEach((salaryGrade, index) => {
            this.salaryGrades[index] = { sn: ++index, ...salaryGrade };
          });
          this.totalRows = this.salaryGrades.length;
        }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.sgID = row.sg_id;
      this.name = row.sg_name;
      this.min = row.sg_minimum.toString();
      this.mid = row.sg_midpoint.toString();
      this.max = row.sg_maximum.toString();
      this.$refs["edit-salary-grade"].show();
      this.$refs["sg-table"].clearSelected();
    },
    resetForm() {
      this.name = null;
      this.min = null;
      this.mid = null;
      this.max = null;
      this.$v.$reset();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Salary Grade");
      } else {
        let min = parseFloat(this.min.replace(/,/g, ""));
        let mid = parseFloat(this.mid.replace(/,/g, ""));
        let max = parseFloat(this.max.replace(/,/g, ""));
        if (min < mid && mid < max) {
          const data = {
            sg_name: this.name,
            sg_minimum: min,
            sg_midpoint: mid,
            sg_maximum: max,
          };
          const url = `${this.ROUTES.salaryGrade}/add-salary-grade`;
          this.apiPost(url, data, "Add Salary Grade Error").then((res) => {
            this.apiResponseHandler(`${res.data}`, "New Salary Grade Added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-salary-grade"].hide();
          });
        } else {
          this.apiFormHandler("Midpoint should be between Minimum & Maximum");
        }
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Salary Grade");
      } else {
        let min = parseFloat(this.min.replace(/,/g, ""));
        let mid = parseFloat(this.mid.replace(/,/g, ""));
        let max = parseFloat(this.max.replace(/,/g, ""));
        if (min < mid && mid < max) {
          const data = {
            sg_name: this.name,
            sg_minimum: min,
            sg_midpoint: mid,
            sg_maximum: max,
          };
          const url = `${this.ROUTES.salaryGrade}/update-salary-grade/${this.sgID}`;
          this.apiPatch(url, data, "Add Salary Grade Error").then((res) => {
            this.apiResponseHandler(`${res.data}`, "Salary Grade Updated");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["edit-salary-grade"].hide();
          });
        } else {
          this.apiFormHandler("Midpoint should be between Min & Max");
        }
      }
    },
  },
  data() {
    return {
      title: "Salary Grades",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Grades",
          active: true,
        },
      ],
      salaryGrades: [],
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
        { key: "sg_name", label: "Salary Grade", sortable: true },
        { key: "sg_minimum", label: "Salary Grade Minimum", sortable: true },
        { key: "sg_midpoint", label: "Salary Grade Midpoint", sortable: true },
        { key: "sg_maximum", label: "Salary Grade Maximum", sortable: true },
      ],
      submitted: false,
      sgID: null,
      name: null,
      min: null,
      mid: null,
      max: null,
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
        @click="$refs['add-salary-grade'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Salary Grade
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
                ref="sg-table"
                bordered
                selectable
                hover
                :items="salaryGrades"
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
                <template #cell(sg_minimum)="row">
                  &#8358;
                  {{
                    parseFloat(row.value).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  }}
                </template>
                <template #cell(sg_midpoint)="row">
                  &#8358;
                  {{
                    parseFloat(row.value).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  }}
                </template>
                <template #cell(sg_maximum)="row">
                  &#8358;
                  {{
                    parseFloat(row.value).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })
                  }}
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
    <b-modal
      ref="add-salary-grade"
      title="Add Salary Grade"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name">
            Salary Grade <span class="text-danger">*</span>
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
          <label for="min">
            Salary Grade Minimum <span class="text-danger">*</span>
          </label>
          <input
            id="min"
            type="text"
            v-model="min"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.min.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="mid">
            Salary Grade Midpoint <span class="text-danger">*</span>
          </label>
          <input
            id="mid"
            type="text"
            v-model="mid"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.mid.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="max">
            Salary Grade Maximum <span class="text-danger">*</span>
          </label>
          <input
            id="max"
            type="text"
            v-model="max"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.max.$error,
            }"
          />
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
      ref="edit-salary-grade"
      title="Edit Salary Grade"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            Salary Grade <span class="text-danger">*</span>
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
          <label for="min">
            Salary Grade Minimum <span class="text-danger">*</span>
          </label>
          <input
            id="min"
            type="text"
            v-model="min"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.min.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="mid">
            Salary Grade Midpoint <span class="text-danger">*</span>
          </label>
          <input
            id="mid"
            type="text"
            v-model="mid"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.mid.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="max">
            Salary Grade Maximum <span class="text-danger">*</span>
          </label>
          <input
            id="max"
            type="text"
            v-model="max"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.max.$error,
            }"
          />
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
