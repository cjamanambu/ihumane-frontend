<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Donors",
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
    code: { required },
    description: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.donor, "Get Donors Error").then((res) => {
        const { data } = res;
        data.forEach((donor, index) => {
          this.donors[index] = { sn: ++index, ...donor };
        });
        this.totalRows = this.donors.length;
      });
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      this.donorID = row.donor_id;
      this.code = row.donor_code;
      this.description = row.donor_description;
      this.$refs["edit-donor"].show();
      this.$refs["donor-table"].clearSelected();
    },
    resetForm() {
      this.code = null;
      this.description = null;
      this.$v.$reset();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Donor");
      } else {
        const data = {
          donor_code: this.code,
          donor_description: this.description,
        };
        const url = `${this.ROUTES.donor}/add-donor`;
        this.apiPost(url, data, "Add Donor Error").then((res) => {
          this.apiResponseHandler(
            `${res.data.donor_code} has been added successfully`,
            "New Donor Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-donor"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Donor");
      } else {
        const data = {
          donor_code: this.code,
          donor_description: this.description,
        };
        const url = `${this.ROUTES.donor}/update-donor/${this.donorID}`;
        this.apiPatch(url, data, "Update Donor Error").then(() => {
          this.apiResponseHandler(
            `Donor has been updated successfully`,
            "Update Successful"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["edit-donor"].hide();
        });
      }
    },
  },
  data() {
    return {
      title: "Donors",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Donors",
          active: true,
        },
      ],
      donors: [],
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
        { key: "donor_code", label: "Donor Code", sortable: true },
        {
          key: "donor_description",
          label: "Description",
          sortable: true,
        },
      ],
      submitted: false,
      donorID: null,
      code: null,
      description: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-donor'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Donor
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
                :items="donors"
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
      ref="add-donor"
      title="Add Donor"
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
    <b-modal
      ref="edit-donor"
      title="Edit Donor"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
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
