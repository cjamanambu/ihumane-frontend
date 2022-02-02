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
      category: 1,
      categoryOptions: [
        { text: "Official", value: 1 },
        { text: "Personal", value: 2 },
      ],
      count: 1,
      trips: [
        {
          id: 0,
          from: null,
          fromEdit: false,
          date: new Date(),
          dateEdit: false,
          airRoad: 1,
          airRoadOptions: [
            { value: 1, text: "Road" },
            { value: 2, text: "Air" },
          ],
          airRoadEdit: false,
          amPm: 1,
          amPmOptions: [
            { value: 1, text: "AM" },
            { value: 2, text: "PM" },
          ],
          amPmEdit: false,
          destination: null,
          destinationEdit: false,
        },
      ],
      perDiem: null,
      perDiemEdit: false,
      perDiemDays: null,
      perDiemDaysEdit: null,
      currency: "NGN",
      total: 0,
      hotel: 1,
      hotels: [
        { value: 1, text: "Yes" },
        { value: 2, text: "No" },
      ],
      hotelCity: "",
      hotelCityEdit: false,
      hotelArrival: new Date(),
      hotelArrivalEdit: false,
      hotelDeparture: new Date(),
      hotelDepartureEdit: false,
      hotelPreferred: null,
      hotelPreferredEdit: false,
      donor: null,
      donors: [
        { value: null, text: "Please select grant code", disabled: true },
      ],
      expense: [],
      expenses: [
        { value: null, text: "Please select expenses", disabled: true },
      ],
      fetchingExpenses: false,
      confirmTA: false,
      purpose: "",
      start: null,
      end: null,
    };
  },
  methods: {
    fetchDonors() {
      this.apiGet(this.ROUTES.donor, "Get Donors Error").then(async (res) => {
        const { data } = res;
        this.donors = [
          { value: null, text: "Please select grant code", disabled: true },
        ];
        await data.forEach((donor) => {
          this.donors.push({
            value: donor.donor_id,
            text: `${donor.donor_code} (${donor.donor_description})`,
            disabled: false,
          });
        });
      });
    },
    getExpenses() {
      this.fetchingExpenses = true;
      this.expenses = [
        { value: null, text: "Please select expenses", disabled: true },
      ];
      const url = `${this.ROUTES.grantChart}/grant/donor/${this.donor}`;
      this.apiGet(url, "Get Expenses Error").then(async (res) => {
        const { data } = res;

        await data.forEach((expense) => {
          this.expenses.push({
            value: expense.gc_id,
            text: `${expense.gc_expense}: ${expense.gc_account_code}`,
            disabled: false,
          });
        });
        this.fetchingExpenses = false;
      });
    },
    addTrip() {
      this.trips.push({
        id: this.count++,
        from: null,
        fromEdit: false,
        date: new Date(),
        dateEdit: false,
        airRoad: 1,
        airRoadOptions: [
          { value: 1, text: "Road" },
          { value: 2, text: "Air" },
        ],
        airRoadEdit: false,
        amPm: 1,
        amPmOptions: [
          { value: 1, text: "AM" },
          { value: 2, text: "PM" },
        ],
        amPmEdit: false,
        destination: null,
        destinationEdit: false,
      });
    },
    delTrip(index) {
      if (index > 0) {
        this.trips.splice(index, 1);
      }
    },
    getTotal() {
      let total = 0;
      if (this.perDiem && this.perDiemDays) {
        let rate = parseFloat(this.perDiem.replace(/,/g, ""));
        let days = parseFloat(this.perDiemDays.replace(/,/g, ""));
        total = rate * days;
      }
      this.total = total.toString();
    },
    submit() {
      let breakdown = [];
      let per_diem = 0;
      let total = 0;
      let t2_code = [];
      let t1_code = "";
      let data = {};
      this.trips.forEach((trip) => {
        breakdown.push({
          depart_from: trip.from,
          actual_date: trip.date,
          means: trip.airRoad,
          prompt: trip.amPm,
          destination: trip.destination,
        });
      });
      this.expense.forEach((code) => {
        // code = code.toString();
        t2_code.push({
          code,
        });
      });
      if (this.perDiem) {
        per_diem = parseInt(this.perDiem.replace(/,/g, ""));
      }
      if (this.total) {
        total = parseInt(this.total.replace(/,/g, ""));
      }
      if (this.donor) {
        t1_code = this.donor.toString();
      }
      data.employee = this.getEmployee.emp_id;
      data.travel_category = this.category;
      if (this.category === 1) {
        data.per_diem = per_diem;
        data.t2_code = t2_code;
        data.total = total;
      }
      data.hotel = this.hotel;
      if (this.hotel === 1) {
        data.city = this.hotelCity;
        data.arrival_date = this.hotelArrival;
        data.departure_date = this.hotelDeparture;
        data.preferred_hotel = this.hotelPreferred;
      }
      data.purpose = this.purpose;
      data.start_date = this.start;
      data.end_date = this.end;
      data.t1_code = t1_code;
      data.currency = this.currency;
      data.breakdown = breakdown;

      const url = `${this.ROUTES.travelApplication}/new-travel-application`;
      this.confirmTA = false;
      this.apiPost(url, data, "Add Travel Application").then((res) => {
        console.log({ res });
        const { data } = res;
        this.$router.push({ name: "travel-requests" }).then(() => {
          this.apiResponseHandler(data, "Travel Application Submitted");
        });
      });
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
  },
  watch: {
    perDiem: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.perDiem = result));
    },
    perDiemDays: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.perDiemDays = result));
    },
    total: function (newValue) {
      const result = newValue
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      this.$nextTick(() => (this.total = result));
    },
  },
  mounted() {
    this.fetchDonors();
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-between align-items-end mb-3">
      <b-form-group class="mb-0">
        <b-form-radio-group
          id="btn-radios-1"
          v-model="category"
          :options="categoryOptions"
          buttons
          button-variant="outline-success"
        />
      </b-form-group>
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'travel-requests' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        View Travel Requests
      </b-button>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0" v-if="category === 1">
                Official Travel Authorization / Per Diem Form
              </h5>
              <h5 class="font-size-14 mb-0" v-else>
                Personal Travel Authorization
              </h5>
            </div>
            <form>
              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group">
                    <label for=""> Employee's Name </label>
                    <input
                      type="text"
                      class="form-control"
                      disabled
                      :value="getUser.user_name"
                    />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Passport No
                      <small class="text-muted">(International Staff)</small> /
                      Nigeria ID No
                      <small class="text-muted">(National Staff)</small>
                    </label>
                    <input type="text" class="form-control" disabled />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Purpose of Travel
                      <small class="text-muted">(Description)</small>
                    </label>
                    <textarea class="form-control" v-model="purpose" />
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
                          <input
                            type="date"
                            v-model="start"
                            class="form-control"
                          />
                        </div>
                      </div>
                      <div class="col-lg-6">
                        <div class="form-group">
                          <label for=""> End </label>
                          <input
                            type="date"
                            v-model="end"
                            class="form-control"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label for="">
                      T7 Number <small class="text-muted">(Staff ID)</small>
                    </label>
                    <input type="text" class="form-control" disabled />
                  </div>
                  <div class="form-group">
                    <label for=""> Phone Number </label>
                    <input
                      type="text"
                      class="form-control"
                      :value="this.getEmployee.emp_phone_no"
                      disabled
                    />
                  </div>
                  <div class="form-group">
                    <label for="">Program / Charge Codes</label>
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="pt-2" for="">
                            T1 <small class="text-muted">(Grant Code)</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-lg-9">
                        <div class="form-group">
                          <b-form-select
                            @change="getExpenses"
                            v-model="donor"
                            :options="donors"
                          />
                        </div>
                      </div>
                    </div>
                    <div v-if="category === 1">
                      <div class="row">
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label class="pt-2" for="">
                              T2 <small class="text-muted">(Expense)</small>
                            </label>
                            <scale-loader v-if="fetchingExpenses" />
                          </div>
                        </div>
                        <div class="col-lg-9">
                          <div class="form-group">
                            <b-form-select
                              v-model="expense"
                              :options="expenses"
                              multiple
                              :select-size="3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="pt-2" for="">
                            T3 <small class="text-muted">(Sector)</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-lg-9">
                        <div class="form-group">
                          <input type="text" class="form-control" disabled />
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-lg-3">
                        <div class="form-group">
                          <label class="pt-2" for="">
                            T6 <small class="text-muted">(Location)</small>
                          </label>
                        </div>
                      </div>
                      <div class="col-lg-9">
                        <div class="form-group">
                          <input type="text" class="form-control" disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <b-table-simple hover responsive bordered outlined>
                    <b-thead head-variant="light">
                      <b-tr>
                        <b-th>DEPART FROM</b-th>
                        <b-th>DATE</b-th>
                        <b-th>AIR/ROAD</b-th>
                        <b-th>AM/PM</b-th>
                        <b-th>DESTINATION</b-th>
                        <b-th></b-th>
                      </b-tr>
                    </b-thead>
                    <b-tbody>
                      <b-tr v-for="(trip, index) in trips" :key="index">
                        <b-td
                          @click="trip.fromEdit = true"
                          style="cursor: pointer; width: 30%"
                        >
                          <input
                            size="sm"
                            type="text"
                            v-if="trip.fromEdit"
                            v-model="trip.from"
                            @blur="
                              trip.fromEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              trip.fromEdit = false;
                              $emit('update');
                            "
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="trip.from">
                              {{ trip.from }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter departure point...
                            </em>
                          </span>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 15%"
                          @click="trip.dateEdit = true"
                        >
                          <input
                            v-if="trip.dateEdit"
                            v-model="trip.date"
                            @blur="
                              trip.dateEdit = false;
                              $emit('update');
                            "
                            @input="
                              trip.dateEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              trip.dateEdit = false;
                              $emit('update');
                            "
                            v-focus
                            type="date"
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            {{ new Date(trip.date).toDateString() }}
                          </span>
                        </b-td>
                        <b-td style="width: 10%">
                          <b-form-group class="mb-0">
                            <b-form-radio-group
                              size="sm"
                              id="btn-radios-1"
                              v-model="trip.airRoad"
                              :options="trip.airRoadOptions"
                              buttons
                              button-variant="outline-secondary"
                            />
                          </b-form-group>
                        </b-td>
                        <b-td style="width: 10%">
                          <b-form-group class="mb-0">
                            <b-form-radio-group
                              size="sm"
                              id="btn-radios-1"
                              v-model="trip.amPm"
                              :options="trip.amPmOptions"
                              buttons
                              button-variant="outline-secondary"
                            />
                          </b-form-group>
                        </b-td>
                        <b-td
                          @click="trip.destinationEdit = true"
                          style="cursor: pointer; width: 30%"
                        >
                          <input
                            type="text"
                            v-if="trip.destinationEdit"
                            v-model="trip.destination"
                            @blur="
                              trip.destinationEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              trip.destinationEdit = false;
                              $emit('update');
                            "
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="trip.destination">
                              {{ trip.destination }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter arrival point...
                            </em>
                          </span>
                        </b-td>
                        <b-td style="width: 5%">
                          <b-button
                            class="btn btn-sm btn-danger"
                            v-if="index > 0"
                            @click="delTrip(index)"
                          >
                            DEL
                          </b-button>
                          <b-button
                            v-else
                            class="btn btn-sm btn-success"
                            @click="addTrip"
                          >
                            ADD
                          </b-button>
                        </b-td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                </div>
              </div>
              <div class="row mt-4" v-if="category === 1">
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
                        <b-td
                          style="cursor: pointer; width: 30%"
                          @click="perDiemEdit = true"
                        >
                          <input
                            type="text"
                            v-if="perDiemEdit"
                            v-model="perDiem"
                            @blur="
                              perDiemEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              perDiemEdit = false;
                              $emit('update');
                            "
                            @input="getTotal"
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="perDiem">
                              {{ perDiem }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter per diem rate...
                            </em>
                          </span>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 20%"
                          @click="perDiemDaysEdit = true"
                        >
                          <input
                            type="text"
                            v-if="perDiemDaysEdit"
                            v-model="perDiemDays"
                            @blur="
                              perDiemDaysEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              perDiemDaysEdit = false;
                              $emit('update');
                            "
                            @input="getTotal"
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="perDiemDays">
                              {{ perDiemDays }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter number of days...
                            </em>
                          </span>
                        </b-td>
                        <b-td style="cursor: pointer; width: 20%">
                          <span>
                            {{ currency }}
                          </span>
                        </b-td>
                        <b-td
                          style="
                            cursor: pointer;
                            width: 30%;
                            text-align: center;
                          "
                        >
                          {{ total }}
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
                          <b-form-group class="mb-0">
                            <b-form-radio-group
                              size="sm"
                              id="btn-radios-1"
                              v-model="hotel"
                              :options="hotels"
                              buttons
                              button-variant="outline-secondary"
                            />
                          </b-form-group>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 20%"
                          @click="hotelCityEdit = true"
                        >
                          <input
                            size="sm"
                            type="text"
                            v-if="hotelCityEdit"
                            v-model="hotelCity"
                            @blur="
                              hotelCityEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              hotelCityEdit = false;
                              $emit('update');
                            "
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="hotelCity">
                              {{ hotelCity }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter city...
                            </em>
                          </span>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 15%"
                          @click="hotelArrivalEdit = true"
                        >
                          <input
                            v-if="hotelArrivalEdit"
                            v-model="hotelArrival"
                            @blur="
                              hotelArrivalEdit = false;
                              $emit('update');
                            "
                            @input="
                              hotelArrivalEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              hotelArrivalEdit = false;
                              $emit('update');
                            "
                            v-focus
                            type="date"
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            {{ new Date(hotelArrival).toDateString() }}
                          </span>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 15%"
                          @click="hotelDepartureEdit = true"
                        >
                          <input
                            v-if="hotelDepartureEdit"
                            v-model="hotelDeparture"
                            @blur="
                              hotelDepartureEdit = false;
                              $emit('update');
                            "
                            @input="
                              hotelDepartureEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              hotelDepartureEdit = false;
                              $emit('update');
                            "
                            v-focus
                            type="date"
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            {{ new Date(hotelDeparture).toDateString() }}
                          </span>
                        </b-td>
                        <b-td
                          style="cursor: pointer; width: 20%"
                          @click="hotelPreferredEdit = true"
                        >
                          <input
                            size="sm"
                            type="text"
                            v-if="hotelPreferredEdit"
                            v-model="hotelPreferred"
                            @blur="
                              hotelPreferredEdit = false;
                              $emit('update');
                            "
                            @keyup.enter="
                              hotelPreferredEdit = false;
                              $emit('update');
                            "
                            v-focus
                            class="form-control form-control-sm"
                          />
                          <span v-else>
                            <span v-if="hotelPreferred">
                              {{ hotelPreferred }}
                            </span>
                            <em style="font-size: 0.8em" v-else>
                              click to enter preferred hotel...
                            </em>
                          </span>
                        </b-td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                </div>
              </div>
              <b-button
                v-if="!submitting"
                @click="confirmTA = true"
                class="btn btn-success btn-block mt-4"
              >
                Submit
              </b-button>
              <b-button v-else disabled class="btn btn-success btn-block mt-4">
                Submitting...
              </b-button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="confirmTA"
      title="Travel Request"
      centered
      no-close-on-esc
      no-close-on-backdrop
      title-class="text-black font-18"
      body-class="p-3"
      hide-footer
      hide-header
    >
      <div class="text-center">
        <i
          class="mdi mdi-alert-octagon-outline text-success"
          style="font-size: 4em"
        />
        <h5 class="mt-n3 text-success">Are you sure?</h5>
      </div>
      <div class="alert alert-success mt-4">
        Please ensure all fields of the Travel Authorization form are filled
        correctly before submission.
      </div>
      <b-row>
        <b-col lg="6">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="confirmTA = false"
          >
            <i class="dripicons-wrong" style="font-size: 2em"></i>
            <span>Cancel</span>
          </a>
        </b-col>
        <b-col lg="6" class="mt-lg-0 mt-3">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="submit"
          >
            <i class="dripicons-checkmark" style="font-size: 2em"></i>
            <span>Confirm</span>
          </a>
        </b-col>
      </b-row>
    </b-modal>
  </Layout>
</template>
