<script>
export default {
  mounted() {
    this.fetchPMY();
  },
  data() {
    return {
      selectPeriod: false,
      pmyMonth: null,
      pmyYear: null,
      pmyDate: null,
      useCurrent: false,
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
    generate() {
      let data, pym_month, pym_year;
      if (!this.useCurrent && !this.pmyDate) {
        this.apiFormHandler("Emolument Report");
      } else {
        if (this.useCurrent) {
          pym_month = parseFloat(this.pmyMonth);
          pym_year = parseFloat(this.pmyYear);
          data = {
            pym_month,
            pym_year,
          };
        } else {
          let date = this.pmyDate.split("-");
          pym_month = parseFloat(date[1]);
          pym_year = parseFloat(date[0]);
          data = {
            pym_month,
            pym_year,
          };
        }
        const url = `${this.ROUTES.salary}/pull-emolument`;
        this.apiPost(url, data, "Generate Emolument Report").then((res) => {
          console.log({ res });
          const { data } = res;
          if (data.length) {
            //route to new page and make request again
            this.$router.push({
              name: "emolument-report",
              params: { period: `${pym_month}-${pym_year}` },
            });
          }
        });
      }
      // if (this.useCurrent) {
      //   console.log(parseFloat(this.pmyMonth), parseFloat(this.pmyYear));
      //   data;
      // } else {
      //   if (this.pmyDate) {
      //     console.log(this.pmyDate);
      //     let date = this.pmyDate.split("-");
      //     console.log({ date });
      //   } else {
      //   }
      // }
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
            <p class="text-truncate font-size-14 mb-2">
              Current Payroll Period: {{ (parseInt(pmyMonth) - 1) | getMonth }}
              {{ pmyYear }}
            </p>
            <h4 class="mb-0">Emolument Report</h4>
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
      title="Generate Emolument Report"
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
          <input
            id="pmy"
            v-model="pmyDate"
            type="month"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pmyDate.$error,
            }"
          />
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
