<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("HR_CONFIG")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
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
    eya_question: { required },
  },
  methods: {
    addField() {
      this.texts[0].charge--;
      this.texts.push({ id: this.count++, eyaQuestion: null });
      this.count++;
    },
    delField(index) {
      if (index > 0) {
        this.texts.splice(index, 1);
        this.calc();
      }
    },
    refreshTable() {
      this.apiGet(this.ROUTES.endOfYear, "Get Questions Error").then((res) => {
        const { data } = res;
        data.forEach((question, index) => {
          this.eya_questions[index] = { sn: ++index, ...question };
        });
        this.totalRows = this.eya_questions.length;
      });
    },

    getCurrentYear() {
      const url = `${this.ROUTES.goalSetting}/get-open-end-Year`;
      this.apiGet(url, "Get current year error").then((res) => {
        if (res) {
          //console.log(res)
          const { data } = res;
          this.eya_year = data[0].eya_year;
          this.eyaYearStatus = true;
          this.eya_gs_id = data[0].gs_id;
        }
      });
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.eya_question = null;
      this.$v.$reset();
    },
    selectQuestion(question) {
      question = question[0];
      this.eya_id = question.eya_id;
      this.eya_question = question.eya_question;
      this.$refs["update-question"].show();
      this.$refs["question-table"].clearSelected();
    },

    submitNew() {
      const url = `${this.ROUTES.endOfYear}/add-question`;
      this.texts.forEach(async (field) => {
        const data = {
          eya_gs_id: parseInt(this.eya_gs_id),
          eya_question: field.eyaQuestion,
        };
        this.questions.push(data);
      });
      this.apiPost(url, this.questions, "Add Question Error").then(() => {
        this.apiResponseHandler("Process Complete", "Questions Added");
        this.$refs["add-question"].hide();
        this.refreshTable();
      });
    },

    async submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Question");
      } else {
        const data = {
          eya_question: this.eya_question,
        };
        const url = `${this.ROUTES.endOfYear}/update-question/${this.eya_id}`;
        this.apiPatch(url, data, "Update Question Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Question");

          this.$v.$reset();
          this.$refs["update-question"].hide();
          this.eya_questions = null;
          this.refreshTable();
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
      texts: [{ id: 0, eyaQuestion: null }],
      count: 1,
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
        { key: "eya_question", label: "Question", sortable: true },
        { key: "eya_year", label: "Year", sortable: true },
      ],
      eya_gs_id: null,
      eya_questions: [],
      questions: [],
      eya_question: null,
      eya_year: null,
      eyaYearStatus: false,
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div v-if="eyaYearStatus" class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-question'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add New Questions
      </b-button>
    </div>

    <div v-else class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-warning"> No End of Year Activity Set </b-button>
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
                ref="question-table"
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
        <div class="row" v-for="(field, index) in texts" :key="index">
          <div class="col-lg-12">
            <div class="row">
              <div class="col-9">
                <div class="form-group">
                  <label for="eya_question">
                    Question <span class="text-danger">*</span>
                  </label>
                  <b-form-textarea
                    id="eya_question"
                    type="date"
                    v-model="field.eyaQuestion"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.gs_from.$error,
                    }"
                  />
                </div>
              </div>

              <div class="col-3">
                <div class="form-group">
                  <div v-if="field.id > 0" class="form-group">
                    <label style="visibility: hidden">hidden</label>
                    <button
                      type="button"
                      class="btn btn-danger"
                      @click="delField(index)"
                    >
                      DEL
                    </button>
                  </div>
                  <div v-else class="form-group">
                    <label style="visibility: hidden">hidden</label>
                    <button
                      type="button"
                      class="btn btn-success"
                      @click="addField"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              'is-invalid': submitted && $v.eya_question.$error,
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
