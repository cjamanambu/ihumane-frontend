<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import store from "@/state/store";
//import { required } from "vuelidate/lib/validators";

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
    title: "Goal Settings",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshTable();
  },
  // validations: {
  //   //gs_from: { required },
  //   currentFrom: { required },
  //   //gs_to: { required },
  //   currentTo: { required },
  //   gs_activity: { required },
  // },
  methods: {
    async refreshTable() {
      await this.apiGet(this.ROUTES.goalSetting, "Get Goal Setting Error").then(
        (res) => {
          const { data } = res;
          console.log({ data });
          if (data) {
            data.forEach((goalSetting, index) => {
              this.goalSettings[index] = { sn: ++index, ...goalSetting };
            });
          }
          this.totalRows = this.goalSettings.length;
        }
      );
      this.refreshGSY();
    },
    refreshGSY() {
      this.apiGet(this.ROUTES.goalSettingYear, "Get Goal Setting Year").then(
        (res) => {
          if (res.data) {
            this.currentGSY = res.data.gsy_year;
            this.currentFrom = res.data.gsy_from;
            this.currentTo = res.data.gsy_to;
          }
        }
      );
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    resetForm() {
      this.gs_id = null;
      this.gs_year = null;
      this.gs_activity = null;
      this.gs_from = null;
      this.gs_to = null;
      // this.$v.$reset();
    },
    selectGoalSetting(goalSetting) {
      goalSetting = goalSetting[0];
      this.gs_id = goalSetting.gs_id;
      this.gs_year = goalSetting.gs_year;
      this.gs_activity = goalSetting.gs_activity;
      this.gs_from = this.currentFrom; //goalSetting.gs_from;
      this.gs_to = this.currentTo; //goalSetting.gs_to;
      this.gs_status = parseInt(goalSetting.gs_status);
      this.$refs["update-goal-setting"].show();
      this.$refs["goal-setting-table"].clearSelected();
    },
    async submitNew() {
      this.submitted = true;
      const data = {
        gs_activity: String(this.gs_activity),
      };
      const url = `${this.ROUTES.goalSetting}/add-goal-setting`;
      this.apiPost(url, data, "Add goal setting error").then(async (res) => {
        this.apiResponseHandler(`${res.data}`, "New Goal Setting added");
        await this.refreshTable();
      });
      this.$refs["add-goal-setting"].hide();

      //this.$v.$reset();
    },
    submitUpdate() {
      this.submitted = true;
      const data = {
        gs_from: this.gs_from,
        gs_to: this.gs_to,
        gs_year: this.currentGSY,
        gs_activity: this.gs_activity,
        gs_status: this.gs_status,
      };
      const url = `${this.ROUTES.goalSetting}/close-goal-setting/${this.gs_id}`;
      this.apiPatch(url, data, "Close Goal Setting Error").then(async (res) => {
        this.apiResponseHandler(`${res.data}`, "Close Goal Setting");
        await this.refreshTable();
        this.$refs["update-goal-setting"].hide();
      });
    },
    resetGSYForm() {
      this.gsy = "";
      this.$v.reset();
    },
    async submitGSY() {
      const data = {
        gsy_year: this.gsy,
        gsy_from: this.period_from,
        gsy_to: this.period_to,
      };
      const url = `${this.ROUTES.goalSettingYear}/add-year`;
      this.apiPost(url, data, "Add Goal Setting Year Error").then((res) => {
        if (res.data) {
          this.apiResponseHandler(
            `Goal Setting Year has been set successfully`,
            "New Goal Setting Year Set"
          );
        }
      });
      await this.refreshGSY();
      this.setGSY = false;
    },
  },
  data() {
    return {
      submitting: false,
      title: "Goal Settings",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Goal Settings",
          active: true,
        },
      ],
      goalSettings: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: true,
      fields: [
        { key: "sn", label: "S/n", sortable: true },
        { key: "gs_from", label: "From", sortable: true },
        { key: "gs_to", label: "To", sortable: true },
        { key: "gs_year", label: "Year", sortable: true },
        { key: "gs_activity", label: "Activity", sortable: true },
        { key: "gs_status", label: "Status", sortable: true },
      ],
      gs_from: null,
      gs_to: null,
      gs_year: null,
      gs_activity: null,
      period_from: null,
      period_to: null,
      currentFrom: null,
      currentTo: null,
      gs_status: 0,
      gs_activities: [
        { value: null, text: "Please select an Activity" },
        { value: 1, text: "Beginning of year" },
        { value: 2, text: "Mid Year Checking" },
        { value: 3, text: "End of Year" },
      ],
      submitted: false,
      setGSY: false,
      currentGSY: null,
      gsy: "",
      gsySet: false,
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
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div
        class="d-flex justify-content-between align-items-start mb-3 flex-lg-row flex-column"
      >
        <b-card
          header-class="bg-transparent border-success"
          class="border border-success d-inline-block"
        >
          <template v-slot:header>
            <h5 class="my-0 text-success">
              <i class="mdi mdi-calendar-sync mr-3"></i>
              Current Goal Setting Year
            </h5>
          </template>
          <h5 class="card-title mt-0" v-if="currentGSY">
            {{ currentGSY }} - ({{ currentFrom }} -> {{ currentTo }})
          </h5>
          <p class="card-text update-mtr" @click="setGSY = true">
            Update Goal Setting Year
          </p>
          <!--          <p v-else class="card-text update-mtr" @click="selectPMY">Set PMY</p>-->
        </b-card>
      </div>
      <b-button
        class="btn btn-success"
        @click="$refs['add-goal-setting'].show()"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Add New Activity
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
                ref="goal-setting-table"
                bordered
                selectable
                hover
                :items="goalSettings"
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
                @row-selected="selectGoalSetting"
              >
                <template #cell(gs_from)="row">
                  <span>{{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(gs_to)="row">
                  <span>{{ new Date(row.value).toDateString() }}</span>
                </template>
                <template #cell(gs_activity)="row">
                  <div v-if="parseInt(row.value) === 1">Beginning of Year</div>

                  <div v-if="parseInt(row.value) === 2">Mid Year</div>

                  <div v-if="parseInt(row.value) === 3">End of Year</div>
                </template>

                <template #cell(gs_status)="row">
                  <div
                    class="badge badge-primary badge-pill"
                    v-if="parseInt(row.value) === 1"
                  >
                    Open
                  </div>

                  <div
                    class="badge badge-warning badge-pill"
                    v-if="parseInt(row.value) === 0"
                  >
                    Close
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
      ref="add-goal-setting"
      title="Add New Activity"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitNew">
        <div class="form-group">
          <label> From <span class="text-danger">*</span> </label>
          <input
            type="date"
            v-model="currentFrom"
            class="form-control"
            disabled
          />
        </div>
        <div class="form-group">
          <label> To <span class="text-danger">*</span> </label>
          <input
            type="date"
            v-model="currentTo"
            class="form-control"
            disabled
          />
        </div>
        <div class="form-group">
          <label for="lt-mode-add">
            Goal Setting Year <span class="text-danger">*</span>
          </label>
          <input
            id="lt-mode-add"
            type="text"
            v-model="currentGSY"
            disabled
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="gs_activity">
            Activity Type <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="gs_activity"
            v-model="gs_activity"
            :options="gs_activities"
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
      ref="update-goal-setting"
      title="Update Goal Setting"
      hide-footer
      centered
      title-class="font-18"
      @hidden="resetForm"
    >
      <form @submit.prevent="submitUpdate">
        <div class="form-group">
          <label for="gs_fromU">
            From <span class="text-danger">*</span>
          </label>
          <input
            id="gs_fromU"
            type="date"
            v-model="currentFrom"
            class="form-control"
            disabled
          />
        </div>
        <div class="form-group">
          <label for="gs_toU"> To <span class="text-danger">*</span> </label>
          <input
            id="gs_toU"
            type="date"
            v-model="currentTo"
            class="form-control"
            disabled
          />
        </div>
        <div class="form-group">
          <label for="yearU">
            Goal Setting Year <span class="text-danger">*</span>
          </label>
          <input
            id="yearU"
            type="text"
            v-model="currentGSY"
            class="form-control"
            disabled
          />
        </div>
        <div class="form-group">
          <label for="gs_activityU">
            Activity Type <span class="text-danger">*</span>
          </label>
          <b-form-select
            id="gs_activityU"
            v-model="gs_activity"
            :options="gs_activities"
            disabled
          />
        </div>

        <div v-if="gs_status == 1">
          <b-button
            v-if="!submitting"
            class="btn btn-danger btn-block mt-4"
            type="submit"
          >
            Close Activity
          </b-button>
          <b-button
            v-else
            disabled
            class="btn btn-success btn-block mt-4"
            type="submit"
          >
            Closing...
          </b-button>
        </div>
        <div v-else-if="gs_status == 0">
          <b-button
            v-if="!submitting"
            class="btn btn-success btn-block mt-4"
            type="submit"
          >
            Open Activity
          </b-button>
          <b-button
            v-else
            disabled
            class="btn btn-success btn-block mt-4"
            type="submit"
          >
            Closing...
          </b-button>
        </div>
      </form>
    </b-modal>
    <b-modal
      v-model="setGSY"
      title="Set Goal Setting Year"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetGSYForm"
    >
      <form @submit.prevent="submitGSY">
        <div class="form-group">
          <label> Period From <span class="text-danger">*</span> </label>
          <input
            id="from"
            v-model="period_from"
            class="form-control"
            placeholder="From"
            type="date"
          />
        </div>
        <div class="form-group">
          <label> Period To <span class="text-danger">*</span> </label>
          <input
            id="to"
            v-model="period_to"
            class="form-control"
            placeholder="To"
            type="date"
          />
        </div>
        <div class="form-group">
          <label> Goal Setting Year <span class="text-danger">*</span> </label>
          <input
            id="pmy"
            v-model="gsy"
            class="form-control"
            placeholder="Year"
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
