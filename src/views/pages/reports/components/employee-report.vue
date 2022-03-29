<script>
export default {
  mounted() {

  },
  data() {
    return {
      selectType: false,
      type: null,
      types: [{ value: 'all', text: "All" }, { value: 1, text: "Active" }, { value: 0, text: "Inactive" }, ],
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
      await this.$router.push({
        name: "employee-report",
        params: {
          type: this.type,
        },
      });
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

            </p>
            <h4 class="mb-0">Employee Report</h4>
          </div>
          <div class="text-secondary"></div>
        </div>

      </div>
      <div class="card-body border-top py-2">
        <div
            class="d-flex align-items-center text-success d-inline-flex"
            style="cursor: pointer"
            @click="selectType = true"
        >
          <span class="mr-2">Generate</span>
          <i class="ri-arrow-right-s-line"></i>
        </div>
      </div>

      </div>

    <b-modal
        v-model="selectType"
        title="Generate Employee Report"
        hide-footer
        centered
        title-class="font-18"
        size="md"
        no-close-on-backdrop
        no-close-on-esc
    >
      <form @submit.prevent="generate">

        <div class="form-group">
          <label for="">Select Type</label>
          <b-form-select v-model="type" :options="types" />
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


