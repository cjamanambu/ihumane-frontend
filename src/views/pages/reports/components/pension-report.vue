<script>
export default {
  mounted() {
    this.fetchPMY();
    this.fetchLocations();
  },
  data() {
    return {
      selectPeriod: false,
      pmyMonth: null,
      pmyYear: null,
      pmyDate: null,
      useCurrent: false,
      location: null,
      locations: [{ value: null, text: "Select location" }],
    };
  },
  methods: {
    fetchPMY() {
      this.apiGet(
        this.ROUTES.payrollMonthYear,
        "Get Payroll Month & Year Error"
      ).then((res) => {
        if (res.data) {
          const { pym_year, pym_month } = res.data;
          this.pmyMonth = pym_month;
          this.pmyYear = pym_year;
        }
      });
    },
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.locations = [
          { value: null, text: "Select location" },
          { value: 0, text: "All locations" },
        ];
        const { data } = res;
        data.forEach((location) => {
          this.locations.push({
            value: location.location_id,
            text: `${location.l_t6_code} (${location.location_name})`,
          });
        });
      });
    },
    async generate() {
      let data, pym_month, pym_year;
      if ((!this.useCurrent && !this.pmyDate) || this.location === null) {
        this.apiFormHandler("Pension Report");
      } else {
        if (this.useCurrent) {
          await this.fetchPMY();
          pym_month = parseFloat(this.pmyMonth);
          pym_year = parseFloat(this.pmyYear);
          data = {
            pym_month,
            pym_year,
            pym_location: this.location,
          };
        } else {
          let date = this.pmyDate.split("-");
          pym_month = parseFloat(date[1]);
          pym_year = parseFloat(date[0]);
          data = {
            pym_month,
            pym_year,
            pym_location: this.location,
          };
        }
        const url = `${this.ROUTES.salary}/pension-report`;
        this.apiPost(url, data, "Generate Pension Report").then((res) => {
          if (res) {
            const { data } = res;
            if (data.length) {
              this.$router.push({
                name: "pension-report",
                params: {
                  period: `${pym_month}-${pym_year}`,
                  locationID: this.location,
                },
              });
            }
          }
        });
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="media">
          <div class="media-body overflow-hidden">
            <!--            <p class="text-truncate font-size-14 mb-2">-->
            <!--              Current Payroll Period: {{ (parseInt(pmyMonth) - 1) | getMonth }}-->
            <!--              {{ pmyYear }}-->
            <!--            </p>-->
            <h4 class="mb-0">Pension Report</h4>
          </div>
          <div class="text-secondary"></div>
        </div>
      </div>
      <div class="card-body border-top py-2">
        <div
          class="d-flex align-items-center text-success d-inline-flex"
          style="cursor: pointer"
          @click="selectPeriod = true"
        >
          <span class="mr-2">Generate</span>
          <i class="ri-arrow-right-s-line"></i>
        </div>
      </div>
    </div>
    <b-modal
      v-model="selectPeriod"
      title="Generate Pension Report"
      hide-footer
      centered
      title-class="font-18"
      size="md"
      no-close-on-backdrop
      no-close-on-esc
    >
      <form @submit.prevent="generate">
        <div class="form-group" v-if="!useCurrent">
          <label for="pmy">
            Select Payroll Period <span class="text-danger">*</span>
          </label>
          <input id="pmy" v-model="pmyDate" type="month" class="form-control" />
        </div>
        <div class="form-group">
          <label for="">Select Location</label>
          <b-form-select v-model="location" :options="locations" />
        </div>
        <div class="form-group">
          <b-form-group>
            <b-form-checkbox
              id="checkbox-1"
              v-model="useCurrent"
              name="checkbox-1"
              :value="true"
              :unchecked-value="false"
            >
              Select to generate for current payroll period
            </b-form-checkbox>
          </b-form-group>
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
  </div>
</template>
