<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import { authComputed } from "@/state/helpers";
import store from "@/state/store";
//import html2pdf from 'html2pdf.js';

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Announcements ",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    ...authComputed,
    //VueHtml2pdf,
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
      const url = `${this.ROUTES.announcement}/employee/${this.getEmployee.emp_id}`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        //console.log(data.announcements);
        data.announcements.forEach((announcement, index) => {
          this.announcements[index] = {
            sn: ++index,
            a_title: announcement.a_title,
            posted_by: `${announcement.author.emp_first_name} ${announcement.author.emp_last_name}`,
            target: `${announcement.a_target == 1 ? "Everyone" : "Specific"}`,
            body: announcement.a_body,
            summary: `${
              announcement.a_body.replace(/(<([^>]+)>)/gi, "").length > 50
                ? announcement.a_body.replace(/(<([^>]+)>)/gi, "").substr(0, 47)
                : announcement.a_body.replace(/(<([^>]+)>)/gi, "")
            }`,
            date_published: `${new Date(
              announcement.createdAt
            ).toDateString()}`,
            ...announcement,
          };
        });
        this.totalRows = this.employees.length;
      });
    },
    async print() {
      // Pass the element id here html2pdf
      //var element = document.getElementById('printArea');
      //html2pdf(element);
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
        author: 4,
        title: this.subject,
        target: parseInt(this.selectedTarget),
        body: this.body,
        persons: this.persons,
      };
      //console.log({data})

      this.apiPost(
        this.ROUTES.announcement,
        data,
        "Post announcement Error"
      ).then((res) => {
        this.apiResponseHandler(`${res.data}`, "Publish Announcement");
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
      this.subject = row.a_title;
      this.author = row.posted_by;
      this.audience = row.target == 1 ? "Everyone" : "Specific";
      this.body = row.body;
      this.posted_on = row.date_published;
      this.$refs["view-announcement"].show();
      this.$refs["view-announcement"].clearSelected();
    },
  },
  data() {
    return {
      title: " Announcements ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: " Announcements ",
          active: true,
        },
      ],
      employees: [],
      target: [
        {
          value: "1",
          text: "Everyone",
        },
        {
          value: "2",
          text: "Specific",
        },
      ],
      announcements: [],
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
          key: "a_title",
          label: "Title",
          sortable: true,
        },
        { key: "posted_by", label: "Published By", sortable: true },
        { key: "target", label: "To", sortable: true },
        { key: "summary", label: "Body", sortable: true },
        {
          key: "date_published",
          label: "Date",
          sortable: true,
        },
      ],
      employeeID: null,
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
                :items="announcements"
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
      ref="view-announcement"
      title=" Announcement Details"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
      class="modal-lg"
    >
      <button
        class="btn btn-primary btn-sm float-right"
        type="button"
        @click="print"
      >
        <i class="mdi mdi-printer"></i> Print
      </button>
      <form @submit.prevent="" id="printArea">
        <img
          style="width: 30%"
          :src="require('@/assets/images/irc-logo.png')"
          class="mr-4"
        />
        <h6 class="">
          <small for="" class="text-info text-uppercase">Title: </small>
          <br /><span v-html="subject"></span>
        </h6>
        <h6 class="">
          <small for="" class="text-info text-uppercase">Date: </small>
          <br /><span v-html="posted_on"></span>
        </h6>
        <h6 class="">
          <small for="" class="text-info text-uppercase">Audience: </small>
          <br /><span v-html="audience"></span>
        </h6>
        <h6 class="">
          <small for="" class="text-info text-uppercase">Content: </small>
        </h6>
        <div v-html="body"></div>
        <h6 class="">
          <small for="" class="text-info text-uppercase">Attachment: </small>
        </h6>
        <a href="">Download attachment || No Attachment</a> <br />
      </form>
    </b-modal>
  </Layout>
</template>
