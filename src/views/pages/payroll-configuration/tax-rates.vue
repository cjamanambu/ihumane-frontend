<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import taxRateService from "@/services/tax-rate.service";
import { required } from "vuelidate/lib/validators";

export default {
  mixins: [taxRateService],
  page: {
    title: "Tax Rates",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  watch: {
    band: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.band = result));
    },
  },
  mounted() {
    this.refreshMTR();
    this.refreshTable();
  },
  validations: {
    band: { required },
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    refreshMTR() {
      this.getMTR().then((res) => {
        const { data } = res;
        this.mtr = data[0].mtr_rate;
      });
    },
    refreshTable() {
      this.getTRs().then((res) => {
        const { data } = res;
        this.trs = data;
        this.totalRows = this.trs.length;
      });
    },
    selectMTR() {
      this.mtrRate = this.mtr;
      this.$refs["update-mtr"].show();
    },
    selectTR(tr) {
      tr = tr[0];
      this.band = tr.tr_band;
      this.rate = tr.tr_rate;
      this.trID = tr.tr_id;
      this.$refs["update-tr"].show();
      this.$refs["tr-table"].clearSelected();
    },
    resetTrform() {
      this.rate = 1;
      this.band = 0;
      this.$v.$reset();
    },
    resetMtrForm() {
      this.mtrRate = null;
      this.$v.$reset();
    },
    submitMTR() {
      this.submitted = true;
      this.band = 0;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid MTR");
      } else {
        const { mtrRate } = this;
        this.updateMTR(mtrRate).then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshMTR();
          this.$v.$reset();
          this.$refs["update-mtr"].hide();
        });
      }
    },
    submitAdd() {
      this.submitted = true;
      this.mtrRate = 0;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Tax Rate");
      } else {
        const { rate } = this;
        let { band } = this;
        band = parseFloat(band.replace(/,/g, ""));
        const tr = {
          rate,
          band,
        };
        this.addTR(tr).then((res) => {
          this.apiResponseHandler(
            `${res.data.tr_band} has been added successfully`,
            "New Tax Rate Added"
          );
          this.refreshTable();
          this.$v.$reset();
          this.$refs["add-tr"].hide();
        });
      }
    },
    submitUpdate() {
      this.submitted = true;
      this.mtrRate = 0;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Tax Rate");
      } else {
        const { rate, trID } = this;
        let { band } = this;
        band = parseFloat(band.replace(/,/g, ""));
        const tr = {
          rate,
          band,
          trID,
        };
        this.updateTR(tr).then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshTable();
          this.$v.$reset();
          this.$refs["update-tr"].hide();
        });
      }
    },
  },
  data() {
    return {
      title: "Tax Rates",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Tax Rates",
          active: true,
        },
      ],
      mtr: 0,
      submitted: false,
      submitting: false,
      mtrRate: null,
      trs: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "tr_id",
      sortDesc: false,
      fields: [
        { key: "tr_id", label: "ID", sortable: true },
        { key: "tr_band", label: "Band", sortable: true },
        { key: "tr_rate", label: "Rate", sortable: true },
      ],
      band: 0,
      rate: 1,
      trID: null,
    };
  },
};
</script>

<style>
.update-mtr {
  transition: 0.5s ease;
}
.update-mtr:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />

    <div
      class="d-flex justify-content-between align-items-start mb-3 flex-lg-row flex-column"
    >
      <b-card
        header-class="bg-transparent border-success"
        class="border border-success d-inline-block"
      >
        <template v-slot:header>
          <h5 class="my-0 text-success">
            <i class="mdi mdi-file-percent-outline mr-3"></i>Minimum Tax Rate
          </h5>
        </template>
        <h5 class="card-title mt-0">{{ mtr }}%</h5>
        <p class="card-text update-mtr" @click="selectMTR">Update MTR</p>
      </b-card>
      <b-button class="btn btn-success" @click="$refs['add-tr'].show()">
        <i class="mdi mdi-plus mr-2"></i>
        Add Tax Rate
      </b-button>
    </div>
    <div class="row">
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
                ref="tr-table"
                bordered
                selectable
                hover
                :items="trs"
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
                @row-selected="selectTR"
              >
                <template #cell(tr_band)="row">
                  <p>
                    &#8358;
                    {{
                      parseFloat(row.value).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })
                    }}
                  </p>
                </template>
                <template #cell(tr_rate)="row">
                  <p>{{ row.value }}%</p>
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
      ref="update-mtr"
      title="Update MTR"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetMtrForm"
    >
      <form @submit.prevent="submitMTR">
        <div class="form-group">
          <label for="mtr-rate"> Minimum Tax Rate </label>
          <b-form-spinbutton
            id="mtr-rate"
            v-model="mtrRate"
            min="1"
            max="100"
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
      ref="add-tr"
      title="Add Tax Rate"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetTrform"
    >
      <form @submit.prevent="submitAdd">
        <div class="form-group">
          <label for="band">
            Tax Band <span class="text-danger">*</span>
          </label>
          <input
            id="band"
            type="text"
            v-model="band"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.band.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="rate"> Tax Rate (%) </label>
          <b-form-spinbutton id="rate" v-model="rate" min="1" max="100" />
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
      ref="update-tr"
      title="Update Tax Rate"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetTrform"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="band">
            Tax Band <span class="text-danger">*</span>
          </label>
          <input
            id="band"
            type="text"
            v-model="band"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.band.$error,
            }"
          />
        </div>
        <div class="form-group">
          <label for="rate"> Tax Rate (%) </label>
          <b-form-spinbutton id="rate" v-model="rate" min="1" max="100" />
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
