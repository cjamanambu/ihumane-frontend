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
    title: "Pension Providers",
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
    provider_code: { required },
  },
  methods: {
    refreshTable() {
      this.apiGet(
        this.ROUTES.pensionProvider,
        "Get Pension Providers Error"
      ).then((res) => {
        const { data } = res;
        //console.log(data);
        data.forEach((pensionProvider, index) => {
          this.pensionProviders[index] = { sn: ++index, ...pensionProvider };
        });
        this.totalRows = this.pensionProviders.length;
      });
    },
    submitNew() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Pension Provider");
      } else {
        const data = {
          provider_name: this.name,
          provider_code: this.provider_code,
        };
        this.apiPost(
          this.ROUTES.pensionProvider,
          data,
          "New Pension Provider Error"
        ).then((res) => {
          this.apiResponseHandler(`${res.data}`, "New Pension Provider Added");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-pension-provider"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Pension Provider");
      } else {
        const data = {
          provider_name: this.name,
          provider_code: this.provider_code,
        };
        const url = `${this.ROUTES.pensionProvider}/${this.pensionProviderID}`;
        this.apiPatch(url, data, "Update Pension Provider Error").then(
          (res) => {
            this.apiResponseHandler(`${res.data}`, "Update Successful");
            this.refreshTable();
            this.$v.$reset();
            this.$refs["update-pension-provider"].hide();
          }
        );
      }
    },
    resetForm() {
      this.name = null;
      this.$v.$reset();
    },
    selectRow(pensionProvider) {
      pensionProvider = pensionProvider[0];
      this.pensionProviderID = pensionProvider.pension_provider_id;
      this.name = pensionProvider.provider_name;
      this.provider_code = pensionProvider.provider_code;
      this.$refs["update-pension-provider"].show();
      this.$refs["pension-provider-table"].clearSelected();
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  data() {
    return {
      title: "Pension Providers",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Pension Providers",
          active: true,
        },
      ],
      submitted: false,
      pensionProviders: [],
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
        { key: "provider_name", label: "Pension Provider", sortable: true },
        { key: "provider_code", label: " Provider Code", sortable: true },
      ],
      name: null,
      provider_code: null,
      pensionProviderID: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$refs['add-pension-provider'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add Pension Provider
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
                ref="pension-provider-table"
                bordered
                selectable
                hover
                :items="pensionProviders"
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
      ref="add-pension-provider"
      title="Add Pension Provider"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label for="name">
            Provider Name <span class="text-danger">*</span>
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
        <div class="form-group">
          <label for="name">
            Provider Code <span class="text-danger">*</span>
          </label>
          <input
            id="provider_code"
            type="text"
            v-model="provider_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.provider_code.$error,
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
      ref="update-pension-provider"
      title="Update Pension Provider"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="name">
            Provider Name <span class="text-danger">*</span>
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
        <div class="form-group">
          <label for="name">
            Provider Code <span class="text-danger">*</span>
          </label>
          <input
            id="provider_code"
            type="text"
            v-model="provider_code"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.provider_code.$error,
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
