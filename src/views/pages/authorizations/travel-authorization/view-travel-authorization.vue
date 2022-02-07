<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Travel Authorization",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.fetchRequest();
  },
  props: ["employee"],
  methods: {
    fetchRequest() {
      let requestID = this.$route.params.travelAppID;
      const url = `${this.ROUTES.travelApplication}/${requestID}`;
      this.apiGet(url, "Get Travel Application").then((res) => {
        console.log({ res });
        const { application, breakdown, expenses } = res.data;
        this.application = application;
        this.breakdowns = breakdown;
        this.expenses = expenses;
        this.fetchDonorInfo();
        this.fetchExpenses();
      });
    },
    fetchDonorInfo() {
      const url = `${this.ROUTES.donor}/${this.application.travelapp_t1_code}`;
      this.apiGet(url, "Get Donor Error").then((res) => {
        const { data } = res;
        this.donor = data;
      });
    },
    fetchExpenses() {
      this.expenses.forEach((expense) => {
        const url = `${this.ROUTES.grantChart}/${expense.travelapp_t2_id}`;
        this.apiGet(url, "Get Expense Error").then((res) => {
          const { data } = res;
          this.t2Codes.push({
            expense: data.gc_expense,
            code: data.gc_account_code,
          });
        });
      });
    },
  },
  data() {
    return {
      title: "Travel Authorization",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Travel Authorization",
          active: true,
        },
      ],
      application: null,
      breakdowns: [],
      expenses: [],
      donor: null,
      t2Codes: [],
      final: true,
      official: null,
      officials: [
        {
          value: null,
          text: "Please choose the next reviewer",
          disabled: "true",
        },
      ],
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
        @click="$router.push({ name: 'travel-authorization' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Travel Authorizations
      </b-button>
    </div>
    <scale-loader v-if="apiBusy" />
    <div class="row" v-else>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5
                  class="font-size-14 mb-0"
                  v-if="application.travelapp_travel_cat === 1"
                >
                  Official Travel Authorization / Per Diem Form
                </h5>
                <h5 class="font-size-14 mb-0" v-else>
                  Personal Travel Authorization
                </h5>
              </div>
              <span class="d-inline mb-0">
                <small
                  v-if="application.travelapp_status === 0"
                  class="text-warning"
                >
                  Application Pending
                </small>
                <small
                  v-else-if="application.travelapp_status === 1"
                  class="text-success"
                >
                  Application Approved
                </small>
                <small
                  v-else-if="application.travelapp_status === 2"
                  class="text-danger"
                >
                  Application Declined
                </small>
              </span>
            </div>
            <div class="row">
              <div class="col-lg-8">
                <div class="form-group">
                  <label for="">
                    Purpose of Travel
                    <small class="text-muted">(Description)</small>
                  </label>
                  <p class="text-muted">
                    {{ application.travelapp_purpose }}
                  </p>
                </div>
                <div class="form-group">
                  <label for="">
                    Dates of Travel
                    <small class="text-muted">(TO & FRO)</small>
                  </label>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> Start </label>
                        <p class="text-muted">
                          {{
                            new Date(
                              application.travelapp_start_date
                            ).toDateString()
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label for=""> End </label>
                        <p class="text-muted">
                          {{
                            new Date(
                              application.travelapp_end_date
                            ).toDateString()
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-group">
                  <label for="">Program / Charge Codes</label>
                  <div class="row">
                    <div class="col-lg-4">
                      <div class="form-group">
                        <label class="" for="">
                          T1 <small class="text-muted">(Grant Code)</small>
                        </label>
                      </div>
                    </div>
                    <div class="col-lg-8">
                      <div class="form-group">
                        <span v-if="donor">
                          {{ donor.donor_code }} ({{ donor.donor_description }})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="expenses.length">
                    <div class="row">
                      <div class="col-lg-4">
                        <div class="form-group">
                          <label for="">
                            T2 <small class="text-muted">(Expense)</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-lg-8">
                        <div class="form-group">
                          <p
                            class="mb-0"
                            v-for="(t2code, index) in t2Codes"
                            :key="index"
                          >
                            {{ t2code.expense }}: {{ t2code.code }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <b-table-simple striped responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>DEPART FROM</b-th>
                      <b-th>DATE</b-th>
                      <b-th>AIR/ROAD</b-th>
                      <b-th>AM/PM</b-th>
                      <b-th>DESTINATION</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr v-for="(breakdown, index) in breakdowns" :key="index">
                      <b-td style="width: 30%">
                        <span>
                          {{ breakdown.ta_breakdown_from }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span>
                          {{
                            new Date(breakdown.ta_breakdown_date).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 10%">
                        <span v-if="breakdown.ta_breakdown_mode === 1">
                          Road
                        </span>
                        <span v-else> Air </span>
                      </b-td>
                      <b-td style="width: 10%">
                        <span v-if="breakdown.ta_breakdown_prompt === 1">
                          AM
                        </span>
                        <span v-else> PM </span>
                      </b-td>
                      <b-td style="width: 30%">
                        <span>
                          {{ breakdown.ta_breakdown_destination }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
            <div class="row mt-4" v-if="application.travelapp_travel_cat === 1">
              <div class="col-12">
                <b-table-simple responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th>PER DIEM RATE</b-th>
                      <b-th>NO. DAYS</b-th>
                      <b-th>CURRENCY</b-th>
                      <b-th class="text-center">TOTAL</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr>
                      <b-td style="width: 30%">
                        <span>
                          {{ application.travelapp_per_diem.toLocaleString() }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span>
                          {{ application.travelapp_days.toLocaleString() }}
                        </span>
                      </b-td>
                      <b-td style="cursor: pointer; width: 20%">
                        <span> NGN </span>
                      </b-td>
                      <b-td style="width: 30%; text-align: center">
                        {{ application.travelapp_total.toLocaleString() }}
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-12">
                <b-table-simple responsive bordered outlined>
                  <b-thead head-variant="light">
                    <b-tr>
                      <b-th class="text-center">HOTEL REQUIRED?</b-th>
                      <b-th>CITY</b-th>
                      <b-th>ARRIVAL DATE</b-th>
                      <b-th>DEPARTURE DATE</b-th>
                      <b-th>PREFERRED HOTEL</b-th>
                    </b-tr>
                  </b-thead>
                  <b-tbody>
                    <b-tr>
                      <b-td class="text-center" style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          YES
                        </span>
                        <span v-else> NO </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{ application.travelapp_city }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{
                            new Date(
                              application.travelapp_arrival_date
                            ).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 15%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{
                            new Date(
                              application.travelapp_departure_date
                            ).toDateString()
                          }}
                        </span>
                      </b-td>
                      <b-td style="width: 20%">
                        <span v-if="application.travelapp_hotel === 1">
                          {{ application.travelapp_preferred_hotel }}
                        </span>
                      </b-td>
                    </b-tr>
                  </b-tbody>
                </b-table-simple>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Authorization Details</h5>
              </div>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>Employee Name</span>
              <span>
                {{ application.Employee.emp_first_name }}
                {{ application.Employee.emp_first_name }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T7 Number</span>
              <span>
                {{ application.Employee.emp_unique_id }}
              </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T3 Code</span>
              <span> - </span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span>T6 Code</span>
              <span> - </span>
            </div>
            <b-form-group>
              <b-form-checkbox
                id="checkbox-1"
                v-model="final"
                name="checkbox-1"
                :value="true"
                :unchecked-value="false"
              >
                Mark this authorization as final
              </b-form-checkbox>
            </b-form-group>
            <div v-if="final">
              <b-form-group>
                <b-form-textarea
                  rows="5"
                  no-resize
                  placeholder="Leave your comments here.."
                />
              </b-form-group>
              <div class="d-flex">
                <button class="btn btn-success w-100 mr-3">Approve</button>
                <button class="btn btn-danger w-100">Decline</button>
              </div>
            </div>
            <div v-else>
              <b-form-group>
                <b-form-textarea
                  rows="5"
                  no-resize
                  placeholder="Leave your comments here.."
                />
              </b-form-group>
              <b-form-group>
                <b-form-select v-model="official" :options="officials" />
              </b-form-group>
              <div>
                <button class="btn btn-success w-100 mr-3">
                  Forward Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
