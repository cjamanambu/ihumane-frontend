<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "HMOs",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {},
  validations: {
    name: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.hmo, "Get HMOs Error").then((res) => {
        const { data } = res;
        this.hmos = data;
        this.totalRows = this.hmos.length;
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid HMO");
      } else {
        const data = {
          hmo_name: this.name,
        };
        this.apiPost(this.ROUTES.hmo, data, "New HMO Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New HMO Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-hmo"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid HMO");
      } else {
        const data = {
          hmo_name: this.name,
        };
        const url = `${this.ROUTES.hmo}/${this.hmoID}`;
        this.apiPatch(url, data, "Update HMO Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-hmo"].hide();
        });
      }
    },
    resetForm() {
      this.name = null;
      this.$v.$reset();
    },
    selectRow(hmo) {
      hmo = hmo[0];
      this.hmoID = hmo.hmo_id;
      this.name = hmo.hmo_name;
      this.$refs["update-hmo"].show();
      this.$refs["hmo-table"].clearSelected();
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "HMOs",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "HMOs",
          active: true,
        },
      ],
      submitted: false,
      hmos: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "pension_provider_id",
      sortDesc: false,
      fields: [
        { key: "hmo_id", label: "ID", sortable: true },
        { key: "hmo_name", label: "Pension Provider", sortable: true },
      ],
      name: null,
      hmoID: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-hmo'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add HMO
      </b-button>
    </div>
    <div v-if="this.apiBusy">
      <b-spinner type="grow" class="m-2" variant="success" />
    </div>
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
                    />
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0">
              <b-table
                ref="hmo-table"
                bordered
                selectable
                hover
                :items="hmos"
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
      ref="add-hmo"
      title="Add HMO"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name">
            HMO Name <span class="text-danger">*</span>
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
      ref="update-hmo"
      title="Update HMO"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            HMO Name <span class="text-danger">*</span>
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
