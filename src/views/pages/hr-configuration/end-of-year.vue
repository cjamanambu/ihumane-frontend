<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Appraisal Questions (End Of Year)",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
    this.getCurrentYear();

  },
  validations: {
    gs_from:{ required },
   gs_to: { required },
    gs_year: { required },
    gs_activity: { required }



  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.endOfYear, "Get Questions Error").then(
        (res) => {
          const { data } = res;
          this.eya_questions = data;
          this.totalRows = this.eya_questions.length;
        }
      );
    },

    getCurrentYear() {
      const url = `${this.ROUTES.goalSetting}/get-open-end-Year`
      this.apiGet(url, "Get current year error").then(
          (res) => {
            const { data } = res;
            this.eya_year = data[0].eya_year;
          }
      );
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.eya_question = null
      this.$v.$reset();
    },
    selectQuestion(question) {
      question = question[0];
      this.eya_id = question.eya_id
      this.eya_question = question.eya_question
      this.$refs["update-question"].show();
      this.$refs["question-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Type");
      } else {
        const data = {

          gs_from: this.gs_from,
          gs_to: this.gs_to,
          gs_year: this.gs_year,
          gs_activity: String(this.gs_activity)

        };
        const url = `${this.ROUTES.goalSetting}/add-goal-setting`
        this.apiPost(url, data, "Add goal setting error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "New Goal Setting added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-goal-setting"].hide();
          }
        );
      }
    },

    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Type");
      } else {
        const data = {

          gs_from: this.gs_from,
          gs_to: this.gs_to,
          gs_year: this.gs_year,
          gs_activity: this.gs_activity,
          gs_status: this.gs_status

        };
        const url = `${this.ROUTES.goalSetting}/close-goal-setting/${this.gs_id}`
        this.apiPatch(url, data, "Close Goal Setting Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Close Goal Setting");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-goal-setting"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Appraisal Questions",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Appraisal Questions",
          active: true,
        },
      ],

      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "eya_id",
      sortDesc: true,
      fields: [
        { key: "eya_id", label: "SN", sortable: true },
        { key: "eya_question", label: "Question", sortable: true },
        { key: "eya_year", label: "Year", sortable: true }

      ],
      eya_gs_id: null,
      eya_questions: [],
      eya_question: null,
      eya_year: null,
       submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-question'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add New Questions
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
                ref="goal-setting-table"
                bordered
                selectable
                hover
                :items="eya_questions"
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
                @row-selected="selectQuestion"
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
      ref="add-question"
      title="Add New Questions"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="eya_question">
            Question <span class="text-danger">*</span>
          </label>
          <b-form-textarea
              id="eya_question"
              type="date"
              v-model="eya_question"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.gs_from.$error,
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
      ref="update-question"
      title="Update Question"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="eya_question">
            Question <span class="text-danger">*</span>
          </label>
          <b-form-textarea
              id="eya_question"
              type="date"
              v-model="eya_question"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.gs_from.$error,
            }"
          />
        </div>


  <b-button
      v-if="!submitting"
      class="btn btn-success btn-block mt-4"
      type="submit"
  >
   Update
  </b-button>
  <b-button
      v-else
      disabled
      class="btn btn-success btn-block mt-4"
      type="submit"
  >
    Updating...
  </b-button>


      </form>
    </b-modal>
  </Layout>
</template>
