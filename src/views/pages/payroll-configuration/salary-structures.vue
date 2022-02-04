<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Salary Structures",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
    this.fetchSalaryGrades();
  },
  methods: {
    refreshTable() {
      this.apiGet(
        this.ROUTES.salaryStructure,
        "Get Salary Structures Error"
      ).then((res) => {
        console.log({ res });
        const { data } = res;
        data.forEach((salaryStructure, index) => {
          this.salaryStructures[index] = { sn: ++index, ...salaryStructure };
        });
        this.totalRows = this.salaryStructures.length;
      });
    },
    fetchSalaryGrades() {
      this.apiGet(this.ROUTES.salaryGrade, "Get Salary Grades Error").then(
        (res) => {
          console.log({ res });
          this.salaryGrades = [
            {
              value: null,
              text: "Please select a salary grade",
              disable: true,
            },
          ];
          const { data } = res;
          data.forEach((salaryGrade) => {
            this.salaryGrades.push({
              value: salaryGrade.sg_id,
              text: salaryGrade.sg_name,
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
  },
  data() {
    return {
      title: "Salary Structures",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Salary Structures",
          active: true,
        },
      ],
      salaryStructures: [],
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
          key: "ss_empid",
          label: "Employee ID",
          sortable: true,
        },
        { key: "ss_pd", label: "Payment Definition", sortable: true },
        { key: "ss_amount", label: "Amount", sortable: true },
      ],
      salaryGrade: null,
      salaryGrades: [
        { value: null, text: "Please select a salary grade", disable: true },
      ],
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
        @click="$refs['add-salary-structure'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Salary Structure
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
                ref="user-table"
                bordered
                selectable
                hover
                :items="salaryStructures"
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
    <b-modal
      ref="add-salary-structure"
      title="Add Salary Structure"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="code">
            Donor Code <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            type="text"
            v-model="code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.code.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="desc">
            Donor Description <span class="text-danger">*</span>
          </label>
          <textarea
            id="desc"
            type="text"
            v-model="description"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.description.$error,
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
