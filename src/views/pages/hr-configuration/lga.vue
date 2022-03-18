<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import Multiselect from 'vue-multiselect';

export default {
  page: {
    title: "LGAs",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  mounted() {
    this.getStates();
    this.refreshTable();
  },
  validations: {
    lg_name: { required },
    state: { required },
  },
  methods: {
    selectLabel ({ text }) {
      return `${text}`
    },
    getStates() {
      this.apiGet(this.ROUTES.state, "Get States Error").then((res) => {
        const { data} = res;
        data.map((state) => {
          this.states.push({
            value: state.s_id,
            text: state.s_name,
          });
        });
        this.totalRows = this.states.length;
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid LGA");
      } else {
        const data = {
          lg_name: this.lg_name,
          state:this.state.value
        };
        this.apiPost(this.ROUTES.localGovernment, data, "Add LGA Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "New LGA Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-state"].hide();
        });
      }
    },
    refreshTable() {
      this.apiGet(this.ROUTES.localGovernment, "Get LGAs Error").then((res) => {
        const { data} = res;
        console.log(data);
        data.map((lg)=>{
          this.lgas.push({
            lg_name:lg.lg_name,
            state:lg.lga.s_name,
            lg_id:lg.lg_id,
            state_id:lg.lg_state_id
          });
        })
        this.totalRows = this.lgas.length;
      });
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid State");
      } else {

        const data = {
          state: this.state.value,
          lg_name:this.lg_name
        };
        const url = `${this.ROUTES.localGovernment}/${this.lgaId}`;
        this.apiPatch(url, data, "Update LGA Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-state"].hide();
        });
      }
    },
    resetForm() {
      this.name = null;
      this.$v.$reset();
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectState(lga) {
      lga = lga[0];
      this.lg_name = lga.lg_name;
      this.lgaId = lga.lg_id;
      this.state = lga.state_id;
      this.states.forEach(async (state) => {

        if (state.s_id === lga.state_id) {
          const val = {
            value: state.s_id,
            text: state.s_name,
          };
          this.state.push(val);
          console.log(val);
        }
      });
      this.$refs["update-state"].show();
      this.$refs["state-table"].clearSelected();
    },
  },
  data() {
    return {
      title: "States",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "States",
          active: true,
        },
      ],
      submitted: false,
      states: [],
      lgas: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "s_id",
      sortDesc: false,
      fields: [
        { key: "lg_id", label: "ID", sortable: true },
        { key: "state", label: "State Name", sortable: true },
        { key: "lg_name", label: "LGA Name", sortable: true },
      ],
      name: null,
      stateID: null,
      lga_name:null,
      state:[], //id
      lgaId:null, //id
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-state'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add LGA
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
                :items="lgas"
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
                @row-selected="selectState"
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
      ref="add-state"
      title="Add LGA"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">

        <div class="form-group">
          <label for="name">
            State <span class="text-danger">*</span>
          </label>
          <multiselect
            v-model="state"
            :options="states"
            :custom-label="selectLabel"
            :class="{
                      'is-invalid': submitted && $v.state.$error,
                    }"
          ></multiselect>
        </div>
        <div class="form-group">
          <label for="name">
            LGA Name <span class="text-danger">*</span>
          </label>
          <input
            id="lg_name"
            type="text"
            v-model="lg_name"
            class="form-control"
            placeholder="LGA Name"
            :class="{
              'is-invalid': submitted && $v.lg_name.$error,
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
      ref="update-state"
      title="Update LGA"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            State Name <span class="text-danger">*</span>
          </label>
          <multiselect
            v-model="state"
            :options="states"
            :custom-label="selectLabel"
            :class="{
                      'is-invalid': submitted && $v.state.$error,
                    }"
          ></multiselect>
        </div>
        <div class="form-group">
          <label for="lga">
            LGA <span class="text-danger">*</span>
          </label>
          <input
            id="lg_namea"
            type="text"
            v-model="lg_name"
            class="form-control"
            placeholder="LGA Name"
            :class="{
              'is-invalid': submitted && $v.lg_name.$error,
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
