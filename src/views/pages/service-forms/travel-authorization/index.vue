<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Travel Authorization",
    meta: [{ name: "description", content: appConfig.description }],
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
      category: "official",
      categoryOptions: [
        { text: "Official", value: "official" },
        { text: "Personal", value: "personal" },
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
    };
  },
  methods: {
    refreshTable() {},
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
      <b-button class="btn btn-success">
        <i class="mdi mdi-plus mr-2"></i>
        Manage Travel Requests
      </b-button>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0" v-if="category === 'official'">
                Official Travel Authorization / Per Diem Form
              </h5>
              <h5 class="font-size-14 mb-0" v-else>
                Personal Travel Authorization
              </h5>
            </div>
            <form @submit.prevent>
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
                    <input type="text" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Purpose of Travel
                      <small class="text-muted">(Description)</small>
                    </label>
                    <textarea class="form-control" />
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
                          <input type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="col-lg-6">
                        <div class="form-group">
                          <label for=""> End </label>
                          <input type="date" class="form-control" />
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
                    <input type="text" class="form-control" />
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
                    <div v-if="category === 'official'">
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
                            <b-form-select />
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-lg-3">
                          <div class="form-group">
                            <label class="pt-2" for="">
                              T2 <small class="text-muted">(Expense)</small>
                            </label>
                          </div>
                        </div>
                        <div class="col-lg-9">
                          <div class="form-group">
                            <b-form-select />
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
              <div class="row mt-4" v-if="category === 'official'">
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
                        <b-td class="text-center">
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
                        <b-td></b-td>
                        <b-td></b-td>
                        <b-td></b-td>
                        <b-td></b-td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
