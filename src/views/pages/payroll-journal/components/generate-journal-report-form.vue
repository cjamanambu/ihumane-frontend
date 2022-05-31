<script>
import Multiselect from "vue-multiselect";
export default {
  components: {
    Multiselect,
  },
  mounted() {
    this.fetchLocations();
  },
  data() {
    return {
      period: null,
      locations: [],
      location: null,
      journals: [],
      generating: false,
    };
  },
  methods: {
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.locations = [];
        const { data } = res;
        data.forEach((location) => {
          this.locations.push({
            value: location.location_id,
            text: `${location.location_name} - ${location.l_t6_code}`,
          });
        });
      });
    },
    locationLabel({ text }) {
      return `${text}`;
    },
    resetForm() {
      this.period = null;
      this.location = null;
    },
    generate() {
      if (!this.period || !this.location) {
        this.apiFormHandler("Period & location are required");
      } else {
        this.generating = true;
        const { period, location } = this;
        const url = `${this.ROUTES.payrollJournal}/get-journal`;
        const data = {
          j_month: period.split("-")[1],
          j_year: period.split("-")[0],
          j_location: location.value,
        };
        this.apiPost(url, data, "Get Journal Error")
          .then((res) => {
            const { data } = res;
            this.journals = [];
            if (data) {
              data.forEach((journal, index) => {
                this.journals.push({
                  sn: ++index,
                  ...journal,
                });
              });
              const { journals } = this;
              this.$emit("generated", { journals, period, location });
              this.resetForm();
              this.generating = false;
              this.generated = true;
            }
          })
          .catch(() => {
            this.generating = false;
            this.generated = true;
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
        <div class="p-3 bg-light mb-4">
          <div class="d-inline mb-0">
            <h5 class="font-size-14 mb-0">Generate New Journal Report</h5>
          </div>
        </div>
        <div class="form-group">
          <label for="period">Period</label>
          <input
            id="period"
            type="month"
            class="form-control"
            v-model="period"
          />
        </div>
        <div class="form-group">
          <label for="location">Location</label>
          <multiselect
            id="location"
            v-model="location"
            :options="locations"
            placeholder="Please select a location"
            :custom-label="locationLabel"
          />
        </div>
        <div class="mt-4">
          <button
            v-if="!generating"
            @click="generate"
            class="btn btn-success w-100 mr-3"
          >
            Submit
          </button>
          <button v-else disabled class="btn btn-success w-100 mr-3">
            Submitting...
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
