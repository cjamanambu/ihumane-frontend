<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import { VueEditor } from "vue2-editor";
import Multiselect from "vue-multiselect";
import { authComputed } from "@/state/helpers";
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
    title: "Manage Queries ",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    VueEditor,
    Multiselect,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.refreshTable();
    this.fetchEmployees();
  },
  validations: {
    organization: { required },
    role: { required },
    start_date: { required },
    end_date: { required },
    employeeID: { required },
  },
  methods: {
    refreshTable() {
      const url = `${this.ROUTES.queries}/`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        data.list.forEach((query, index) => {
          this.queries[index] = {
            sn: ++index,
            subject: query.q_subject,
            employee: `${query.offender.emp_first_name} ${query.offender.emp_last_name}`,
            emp_id: query.q_queried,
            query_id: query.q_id,
            type: `${query.q_query_type == 1 ? "Warning" : "Query"}`,
            queried_by: `${query.issuer.emp_first_name} ${query.issuer.emp_last_name}`,
            summary: `${
              query.q_body.replace(/(<([^>]+)>)/gi, "").length > 50
                ? query.q_body.replace(/(<([^>]+)>)/gi, "").substr(0, 47)
                : query.q_body.replace(/(<([^>]+)>)/gi, "")
            }`,
            date: `${new Date(query.createdAt).toDateString()}`,
            ...query,
          };
        });
        this.totalRows = this.queries.length;
      });
    },
    fetchEmployees() {
      this.apiGet(this.ROUTES.employee, "Get Employees Error").then((res) => {
        this.officials = [
          {
            value: null,
            text: "Please choose persons",
            disabled: true,
          },
        ];
        const { data } = res;
        //console.log(data);

        data.forEach((employee) => {
          this.employees.push({
            value: employee.emp_id,
            text: `${employee.emp_first_name} ${employee.emp_last_name} (${employee.emp_unique_id})`,
            disabled: false,
          });
        });
      });
    },
    authorizingAsLabel({ text }) {
      return `${text}`;
    },
    submitData() {
      this.submitted = true;
      /*this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Entry");
      } else {*/

      const data = {
        queried_by: this.getEmployee.emp_id,
        subject: this.subject,
        query_type: parseInt(this.selectedTarget),
        body: this.body,
        employee: this.persons,
      };
      //console.log({data})

      this.apiPost(this.ROUTES.queries, data, "New Query Error").then((res) => {
        this.apiResponseHandler(`${res.data}`, "Query");
        this.refreshTable();
        this.$v.$reset();
        this.$refs["post-announcement"].hide();
      });
      // }
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.queryId = row.query_id;
      this.$router.push({
        name: "manage-queries-view",
        params: { queryId: this.queryId },
      });
    },
  },
  data() {
    return {
      title: "Manage Queries ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Manage Queries ",
          active: true,
        },
      ],
      employees: [],
      types: [
        {
          value: "1",
          text: "Warning",
        },
        {
          value: "2",
          text: "Query",
        },
      ],
      queries: [],
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
          key: "subject",
          label: "Subject",
          sortable: true,
        },
        { key: "employee", label: "Employee", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "queried_by", label: "Queried By", sortable: true },
        {
          key: "date",
          label: "Date",
          sortable: true,
        },
      ],
      employeeID: null,
      queryId: null,
      subject: null,
      selectedTarget: null,
      attachment: null,
      body: null,
      persons: [],
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
        @click="$refs['post-announcement'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        New Query
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
                :items="queries"
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
      ref="post-announcement"
      title="New Query"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
      class="modal-lg"
    >
      <form @submit.prevent="submitData">
        <div class="form-group">
          <label for="role"> Subject <span class="text-danger">*</span> </label>
          <input
            id="subject"
            type="text"
            v-model="subject"
            class="form-control"
            placeholder="Subject"
            :class="{
              'is-invalid': submitted && $v.subject.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="types">Type</label>
          <b-form-select
            v-model="selectedTarget"
            :options="types"
          ></b-form-select>
        </div>
        <b-form-group>
          <label for="">Employee(s)</label>
          <multiselect
            v-model="persons"
            :options="employees"
            :custom-label="authorizingAsLabel"
            :multiple="true"
            :class="{
              'is-invalid': submitted && $v.person.$error,
            }"
          ></multiselect>
        </b-form-group>
        <div class="form-group">
          <label for="">Attachment</label>
          <b-form-file
            v-model="attachment"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
        </div>
        <div class="form-group">
          <label for="body"> Content <span class="text-danger">*</span> </label>
          <vue-editor v-model="body"></vue-editor>
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
      ref="view-announcement"
      title=" Announcement Details"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
      class="modal-lg"
    >
      <form @submit.prevent="submitData">
        <div class="form-group">
          <label for="role"> Title <span class="text-danger">*</span> </label>
          <input
            id="title"
            type="text"
            v-model="subject"
            class="form-control"
            placeholder="Title"
            readonly
            :class="{
              'is-invalid': submitted && $v.subject.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="target">Date</label>
          <input
            id="posted_on"
            type="text"
            v-model="posted_on"
            class="form-control"
            placeholder="Date Posted"
            readonly
            :class="{
              'is-invalid': submitted && $v.posted_on.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="audience">To</label>
          <input
            id="audience"
            type="text"
            v-model="audience"
            class="form-control"
            placeholder="Date Posted"
            readonly
            :class="{
              'is-invalid': submitted && $v.audience.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="body"> Content <span class="text-danger">*</span> </label>
          <div v-html="body" style="border: 1px solid #ccc; padding: 5px"></div>
        </div>
        <div class="form-group">
          <label for="">Attachment</label> <br />
          <a href="">Download attachment || No Attachment</a>
        </div>
      </form>
    </b-modal>
  </Layout>
</template>
