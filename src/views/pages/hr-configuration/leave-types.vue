<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Leave Types",
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
    leave_name:{ required },
   lt_rate: { required },
    lt_mode: { required }


  },
  methods: {
    refreshTable() {
      this.apiGet(this.ROUTES.leaveType, "Get Leave Types Error").then(
        (res) => {
          const { data } = res;
          this.leaveTypes = data;
          this.totalRows = this.leaveTypes.length;
        }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.lt_id = null
      this.leave_name = null
       this.lt_rate= null
       this.lt_mode= null
      this.$v.$reset();
    },
    selectLeaveType(leaveType) {
      leaveType = leaveType[0];
      this.lt_id = leaveType.leave_type_id;
      this.leave_name = leaveType.leave_name;
      this.lt_rate = leaveType.lt_rate;
      this.lt_mode = leaveType.lt_mode;
      this.$refs["update-leave-type"].show();
      this.$refs["leave-type-table"].clearSelected();
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Leave Type");
      } else {
        const data = {

          leave_name: this.leave_name,
          leave_mode: this.lt_mode,
          leave_rate: this.lt_rate,
          leave_duration: 5,

        };
        this.apiPost(this.ROUTES.leaveType, data, "Add Leave Type Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "New Leave Type Added");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["add-leave-type"].hide();
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
          leave_name: this.leave_name,
          leave_mode: this.lt_mode,
          leave_rate: this.lt_rate,
          leave_duration: 5,
        };
        const url = `${this.ROUTES.leaveType}/${this.lt_id}`;
        this.apiPatch(url, data, "Update Leave Type Error").then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-leave-type"].hide();
        });
      }
    },
  },
  data() {
    return {
      submitting: false,
      title: "Leave Types",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Leave Types",
          active: true,
        },
      ],
      leaveTypes: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "lt_id",
      sortDesc: false,
      fields: [
        { key: "leave_type_id", label: "SN", sortable: true },
        { key: "leave_name", label: "Leave Type", sortable: true },
        { key: "lt_rate", label: "Rate(Days)", sortable: true },
        { key: "lt_mode", label: "Mode", sortable: true },
      ],
      lt_id: null,
      leave_name: null,
      lt_rate: null,
      lt_mode: null,
      submitted: false,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="$refs['add-leave-type'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Leave Type
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
                ref="dept-table"
                bordered
                selectable
                hover
                :items="leaveTypes"
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
                @row-selected="selectLeaveType"
              >

                <template #cell(lt_mode)="row">
                  <div
                      class="badge badge-info badge-pill"
                      v-if="row.value === 1"
                  >
                    Monthly
                  </div>

                  <div
                      class="badge badge-warning badge-pill"
                      v-if="row.value === 2"
                  >
                    Yearly
                  </div>


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
      ref="add-leave-type"
      title="Add Department"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="lt-name-add">
            Leave Type <span class="text-danger">*</span>
          </label>
          <input
              id="lt-name-add"
              type="text"
              v-model="leave_name"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.leave_name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="lt-rate-add">
            Rate <span class="text-danger">*</span>
          </label>
          <input
              id="lt-rate-add"
              type="text"
              v-model="lt_rate"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.lt_rate.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="lt-mode-add">
            Mode <span class="text-danger">*</span>
          </label>
          <input
              id="lt-mode-add"
              type="text"
              v-model="lt_mode"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.lt_mode.$error,
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
      ref="update-leave-type"
      title="Update Leave Type"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="lt-name">
            Leave Type <span class="text-danger">*</span>
          </label>
          <input
            id="lt-name"
            type="text"
            v-model="leave_name"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.leave_name.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="lt-rate">
            Rate <span class="text-danger">*</span>
          </label>
          <input
            id="lt-rate"
            type="text"
            v-model="lt_rate"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.lt_rate.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="lt-mode">
            Mode <span class="text-danger">*</span>
          </label>
          <input
              id="lt-mode"
              type="text"
              v-model="lt_mode"
              class="form-control"
              :class="{
              'is-invalid': submitted && $v.lt_mode.$error,
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
