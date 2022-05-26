<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
export default {
  page: {
    title: "Payroll Journal Code",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
    this.fetchLocations();
  },
  validations: {
    pj_code: { required },
    pj_journal_item: { required },
    pj_location: { required },
  },
  data() {
    return {
      submitting: false,
      title: "Journal Codes",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Journal Codes",
          active: true,
        },
      ],
      payrollJournals: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "5%" } },
        { key: "pj_code", label: "Journal Code", sortable: true },
        { key: "pj_journal_item", label: "Journal Item", sortable: true },
        "location",
      ],
      pj_code: null,
      pj_journal_item: null,
      pj_location: null,
      pj_id: null,
      locations: [{ value: null, text: "Please select a location" }],
      submitted: false,
    };
  },

  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.payrollJournal, "Get Payroll Journal Error").then(
        (res) => {
          const { data } = res;
          data.forEach((pj, index) => {
            this.payrollJournals[index] = { sn: ++index, ...pj };
          });
          this.totalRows = this.payrollJournals.length;
        }
      );
    },

    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.locations = [{ value: null, text: "Please select a location" }];
        const { data } = res;
        data.forEach((location) => {
          this.locations.push({
            value: location.location_id,
            text: location.location_name,
          });
        });
      });
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.pj_id = null;
      this.pj_code = null;
      this.pj_location = null;
      this.pj_journal_item = null;
      this.$v.$reset();
    },
    selectCode(code) {
      code = code[0];
      this.pj_id = code.pj_id;
      this.pj_code = code.pj_code;
      this.pj_location = code.pj_location;
      this.pj_journal_item = code.pj_journal_item;
      this.$refs["update-code"].show();
      this.$refs["code-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Code");
      } else {
        const data = {
          pj_code: this.pj_code,
          pj_journal_item: this.pj_journal_item,
          pj_location: this.pj_location,
        };
        this.apiPost(
          this.ROUTES.payrollJournal,
          data,
          "Add Journal Code Error"
        ).then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Journal Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-code"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Code");
      } else {
        const data = {
          pj_id: this.pj_id,
          pj_code: this.pj_code,
          pj_journal_item: this.pj_journal_item,
          pj_location: this.pj_location,
        };

        this.apiPatch(
          this.ROUTES.payrollJournal,
          data,
          "Update Code Error"
        ).then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
        });
      }
      this.refreshTable();
      this.$v.$reset();
      this.$refs["update-code"].hide();
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-code'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Journal Code
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
                ref="code-table"
                bordered
                selectable
                hover
                :items="payrollJournals"
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
                @row-selected="selectCode"
              >
                <template #cell(location)="row">
                  <p class="mb-0">
                    {{ row.item.location.location_name }}
                  </p>
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
      ref="add-code"
      title="Add Journal Code"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name"> Code <span class="text-danger">*</span> </label>
          <input
            id="name"
            type="text"
            v-model="pj_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pj_code.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="bank_code">
            Journal Item <span class="text-danger">*</span>
          </label>
          <input
            id="bank_code"
            type="text"
            v-model="pj_journal_item"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pj_journal_item.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
          <b-form-select
            id="location"
            v-model="pj_location"
            :options="locations"
            :class="{
              'is-invalid': submitted && $v.pj_location.$error,
            }"
          />
          <small
            class="form-text text-muted manage"
            @click="$router.push('/locations')"
          >
            Manage Locations
          </small>
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
      ref="update-code"
      title="Update Code"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name"> Code <span class="text-danger">*</span> </label>
          <input
            id="pj_code"
            type="text"
            v-model="pj_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pj_code.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="bank_code">
            Journal Item <span class="text-danger">*</span>
          </label>
          <input
            id="pj_journal_item"
            type="text"
            v-model="pj_journal_item"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pj_journal_item.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label> Location <span class="text-danger">*</span> </label>
          <b-form-select
            id="location"
            v-model="pj_location"
            :options="locations"
            :class="{
              'is-invalid': submitted && $v.pj_location.$error,
            }"
          />
          <small
            class="form-text text-muted manage"
            @click="$router.push('/locations')"
            style="cursor: pointer"
          >
            Manage Locations
          </small>
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
