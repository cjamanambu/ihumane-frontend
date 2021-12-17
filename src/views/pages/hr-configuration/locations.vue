<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
// @TODO Get the location id and location t6 code when getting locations.
// @TODO Send the state as an object with each location

export default {
  page: {
    title: "Locations",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
    this.fetchStates();
  },
  validations: {
    name: { required },
    states: { required },
    t6_code: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        const { data } = res;
        console.log({ data });
        this.locations = data;
        this.totalRows = this.locations.length;
      });
    },
    fetchStates() {
      this.apiGet(this.ROUTES.state, "Get States Error").then((res) => {
        this.states = [{ value: null, text: "Please select a state" }];
        const { data } = res;
        data.forEach((state) => {
          this.states.push({
            value: state.s_id,
            text: state.s_name,
          });
        });
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Location");
      } else {
        const data = {
          location_name: this.name,
          location_state: this.state,
          location_t6_code: this.t6_code,
        };
        this.apiPost(this.ROUTES.location, data, "New Location Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "New Location Added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-location"].hide();
          }
        );
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Location");
      } else {
        const data = {
          location_name: this.name,
          location_state: this.state,
          location_t6_code: this.t6_code,
        };
        const url = `${this.ROUTES.location}/${this.location_id}`;
        this.apiPatch(url, data, "Update Location Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-location"].hide();
        });
      }
    },
    resetForm() {
      this.name = null;
      this.state = null;
      this.t6_code = null;
      this.$v.$reset();
    },
    selectLocation(location) {
      location = location[0];
      this.locationID = location.location_id;
      this.name = location.location_name;
      this.state = location.l_state_id;
      this.t6_code = location.l_t6_code;
      this.$refs["update-location"].show();
      this.$refs["location-table"].clearSelected();
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "Locations",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Locations",
          active: true,
        },
      ],
      submitted: false,
      locations: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "location_id",
      sortDesc: false,
      fields: [
        { key: "location_id", label: "ID", sortable: true },
        { key: "location_name", label: "Location", sortable: true },
        { key: "l_state_id", label: "State", sortable: true },
        { key: "l_t6_code", label: "T6 Code", sortable: true },
      ],
      name: null,
      t6_code: null,
      state: null,
      states: [{ value: null, text: "Please select a state" }],
      locationID: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-location'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Location
      </b-button>
    </div>
    <div v-if="this.apiBusy" style="margin-left: 50%; margin-top: 20%">
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
                    ></b-form-input>
                  </label>
                </div>
              </div>
              <!-- End search -->
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0">
              <b-table
                ref="state-table"
                bordered
                selectable
                hover
                :items="locations"
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
                @row-selected="selectLocation"
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
      ref="add-location"
      title="Add Location"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="role">
            Job Role <span class="text-danger">*</span>
          </label>
          <input
            id="role"
            type="text"
            v-model="role"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.role.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="department">
            Department <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="department"
            v-model="department"
            :options="departments"
            :class="{
              'is-invalid': submitted && $v.department.$error,
            }"
          />
          <small
            class="form-text text-muted manage"
            @click="$router.push('/departments')"
          >
            Manage Departments
          </small>
        </div>
        <div class="form-group">
          <label for="description">
            Description <span class="text-danger">*</span>
          </label>
          <b-textarea
            v-model="description"
            id="description"
            no-resize
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
