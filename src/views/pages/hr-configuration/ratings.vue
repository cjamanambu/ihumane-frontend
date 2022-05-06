<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Ratings",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  validations: {
    name: { required },
    description: { required },
    rating_period: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.rating, "Get Ratings Error").then((res) => {
        const { data } = res;
        //console.log(data);
        this.ratings = data;
        this.totalRows = this.ratings.length;
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.ratingID = row.rating_id;
      this.name = row.rating_name;
      this.description = row.rating_desc;
      this.$refs["edit-rating"].show();
      this.$refs["rating-table"].clearSelected();
    },
    resetForm() {
      this.ratingID = null;
      this.name = null;
      this.description = null;
      this.$v.$reset();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Rating");
      } else {
        const data = {
          rating_name: this.name,
          rating_desc: this.description,
          rating_period:this.rating_period
        };
        const url = `${this.ROUTES.rating}/add-rating`;
        this.apiPost(url, data, "Add Rating Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Rating Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-rating"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Rating");
      } else {
        const data = {
          rating_name: this.name,
          rating_desc: this.description,
          rating_period: this.rating_period
        };
        const url = `${this.ROUTES.rating}/update-rating/${this.ratingID}`;
        this.apiPatch(url, data, "Update Rating Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["edit-rating"].hide();
        });
      }
    },
  },
  data() {
    return {
      title: "Ratings",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Ratings",
          active: true,
        },
      ],
      ratings: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "rating_id",
      sortDesc: false,
      fields: [
        { key: "rating_id", label: "ID", sortable: true },
        { key: "rating_name", label: "Rating", sortable: true },
        { key: "rating_time_period", label: "Period", sortable: true },
        { key: "rating_desc", label: "Description", sortable: true },
      ],
      submitted: false,
      ratingID: null,
      name: null,
      description: 'Description',
      rating_period:null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-rating'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Rating
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
                ref="rating-table"
                bordered
                selectable
                hover
                :items="ratings"
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
                <template #cell(rating_time_period)="row">
                  <span> {{ row.value === 1 ? 'Beginning Year' : row.value === 2 ? 'Mid-Year' : 'End of Year' }} </span>
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
      ref="add-rating"
      title="Add Rating"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name"> Rating Name<span class="text-danger">*</span> </label>
          <input
            id="name"
            type="text"
            v-model="name"
            class="form-control"
            placeholder="Rating Name"
            :class="{
              'is-invalid': submitted && $v.name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="min">
            Description <span class="text-danger">*</span>
          </label>
          <textarea
            id="description"
            v-model="description"
            class="form-control"
            placeholder="Description"
            :class="{
              'is-invalid': submitted && $v.description.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="min">
            Time Period <span class="text-danger">*</span>
          </label>
          <select name="rating_period" v-model="rating_period" id="rating_period" class="form-control"
                  :class="{
              'is-invalid': submitted && $v.rating_period.$error,
            }">
            <option value="1">Beginning of Year</option>
            <option value="2">Mid-Year</option>
            <option value="3">End of Year</option>
          </select>
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
      ref="edit-rating"
      title="Edit Rating"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name"> Rating Name <span class="text-danger">*</span> </label>
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
            Description <span class="text-danger">*</span>
          </label>
          <textarea
            id="min"
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
