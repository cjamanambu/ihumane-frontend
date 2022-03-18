<script>
export default {
  mounted() {
    this.fetchPMY();
    this.fetchDeductions();
  },
  data() {
    return {
      selectPeriod: false,
      pmyMonth: null,
      pmyYear: null,
      pmyDate: null,
      useCurrent: false,
      deduction: null,
      deductions: [{ value: null, text: "Select deduction type" }],
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
    fetchDeductions() {
      this.apiGet(this.ROUTES.paymentDefinition, "Get Payment Definition").then(
        (res) => {
          this.deductions = [{ value: null, text: "Select Deduction Type" }];
          const { data } = res;
          data.forEach((paymentDefinition) => {
            if (paymentDefinition.pd_payment_type === 2) {
              this.deductions.push({
                value: paymentDefinition.pd_id,
                text: paymentDefinition.pd_payment_name,
              });
            }
          });
        }
      );
    },
    async generate() {
      let data, pym_month, pym_year;
      if ((!this.useCurrent && !this.pmyDate) || !this.deduction) {
        this.apiFormHandler("Deduction Report");
      } else {
        if (this.useCurrent) {
          await this.fetchPMY();
          pym_month = parseFloat(this.pmyMonth);
          pym_year = parseFloat(this.pmyYear);
          data = {
            pym_month,
            pym_year,
            pd_id: this.deduction,
          };
        } else {
          let date = this.pmyDate.split("-");
          pym_month = parseFloat(date[1]);
          pym_year = parseFloat(date[0]);
          data = {
            pym_month,
            pym_year,
            pd_id: this.deduction,
          };
        }
        const url = `${this.ROUTES.salary}/deduction-report-type`;
        this.apiPost(url, data, "Generate Deduction Report").then((res) => {
          const { data } = res;
          console.log({ data });
          if (data.length) {
            this.$router.push({
              name: "deduction-report",
              params: {
                period: `${pym_month}-${pym_year}`,
                pdID: this.deduction,
              },
            });
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
            <p class="text-truncate font-size-14 mb-2">
              Current Payroll Period: {{ (parseInt(pmyMonth) - 1) | getMonth }}
              {{ pmyYear }}
            </p>
            <h4 class="mb-0">Deduction Report</h4>
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
      title="Generate Deduction Report"
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
          <label for="">Select Deduction</label>
          <b-form-select v-model="deduction" :options="deductions" />
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
