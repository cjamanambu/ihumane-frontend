<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
//import {required} from "vuelidate/lib/validators";
import { VueEditor } from "vue2-editor";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Manage Queries ",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    VueEditor,
  },
  mounted() {
    this.getQueryDetails();
    this.getQueryReplies();
  },
  computed:{
    ...authComputed
  },
  methods: {
    getQueryDetails() {
      let queryId = this.$route.params.qId;
      const url = `${this.ROUTES.queries}/${queryId}`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        this.query = data.query;
      });
    },
    getQueryReplies() {
      let queryId = this.$route.params.qId;
      const url = `${this.ROUTES.queryReply}/${queryId}`;
      this.apiGet(url, "Get Employees Error").then((res) => {
        const { data } = res;
        this.replies = data.replies;
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
    authorizingAsLabel ({ text }) {
      return `${text}`
    },
    submitData(){
      this.submitted = true;
      /*this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Entry");
      } else {*/

      const data = {
        employee:this.getEmployee.emp_id,
        reply_source:2,
        reply:this.body,
        query_id:parseInt(this.$route.params.queryId)
      };
      //console.log({data})

      this.apiPost(this.ROUTES.queryReply, data, "Reply Error").then((res) => {
        this.apiResponseHandler(`${res.data}`, "Reply");
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
      this.employeeID = row.emp_id;
      this.$router.push({
        name: "manage-queries-view",
        params: { employeeID: this.employeeID },
      });
    },
  },
  data() {
    return {
      title: "Query Details ",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Query Details ",
          active: true,
        },
      ],
      employees: [],
      types: [
        {
          value:"1",
          text:"Warning",
        },
        {
          value:"2",
          text:"Query",
        },
      ],
      query:null,
      replies: [],
      queries: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      posted_on:null,
      audience:null,
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
      subject:null,
      selectedTarget:null,
      attachment:null,
      body:null,
      persons:[],

    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <div class="btn-group">
        <b-button
          class="btn btn-secondary mr-1"
          @click="$router.push({ name: 'view-queries' })"
        >
          <i class="mdi mdi-skip-backward mr-2"></i>
          Go Back
        </b-button>
        <b-button
          class="btn btn-success"
          @click="$refs['post-announcement'].show()"
        >
          <i class="mdi mdi-reply mr-2"></i>
          Reply Query
        </b-button>
      </div>

    </div>
    <scale-loader v-if="apiBusy" />
    <div v-else class="row">
      <div class="col-8">
        <div class="card">
          <div class="card-body">
            <img
              style="width: 30%"
              :src="require('@/assets/images/irc-logo.png')"
              class="mr-4"
            />
            <h6 class="text-uppercase"><small for="" class="text-info">Subject: </small> <br>{{query.q_subject}}</h6>
            <h6 class="text-uppercase"><small class="text-info">Body:</small></h6>
            <div v-html="query.q_body">
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header bg-dark">
            <h5 class="text-white text-uppercase"> Replies</h5>
          </div>
          <div class="card-body">
            <div v-for="reply in replies" :key="reply.qr_id">
              <h6 class=""><small for="" class="text-info text-uppercase">Name: </small> <br>{{reply.employee.emp_first_name}} {{reply.employee.emp_last_name}} ({{reply.employee.emp_unique_id}}) <small><i>{{new Date(reply.createdAt).toDateString()}}</i></small></h6>
              <div v-html="reply.qr_reply"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card">
          <div class="card-body">
            <h5 class="text-uppercase mb-3">Other Information</h5>
            <h6 class=""><small for="" class="text-info text-uppercase">Queried By: </small> <br>{{query.issuer.emp_first_name}} {{query.issuer.emp_last_name}} ({{query.issuer.emp_unique_id}})</h6>
            <h6 class=""><small for="" class="text-info text-uppercase">Employee: </small> <br>{{query.offender.emp_first_name}} {{query.offender.emp_last_name}} ({{query.offender.emp_unique_id}})</h6>
            <h6 class=""><small for="" class="text-info text-uppercase">Date: </small> <br>{{new Date(query.createdAt).toDateString()}} </h6>
            <h6 class=""><small for="" class="text-info text-uppercase">Type of Query: </small>
              <br><span>{{ query.q_query_type == 1 ? 'Warning' : 'Query'}}</span>
            </h6>
            <h6 class=""><small for="" class="text-info text-uppercase">Read?: </small>
              <br>{{ query.q_is_seen == 1 ? 'Read' : 'Unread' }}
            </h6>
            <h6 class=""><small for="" class="text-info text-uppercase">Attachment: </small></h6>
            <a href="" class="btn btn-primary btn-sm">Download</a>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      ref="post-announcement"
      title="Reply Query"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
      class="modal-lg"
    >
      <form @submit.prevent="submitData">
        <div class="form-group">
          <label for="">Attachment</label>
          <b-form-file
            v-model="attachment"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
        </div>
        <div class="form-group">
          <label for="body">
            Content <span class="text-danger">*</span>
          </label>
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



  </Layout>
</template>
