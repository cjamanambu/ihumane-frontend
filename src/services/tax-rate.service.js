import API from "@/api";

const MTR_URL = `minimum-tax-rate`;
const TR_URL = `tax-rates`;

export default {
  methods: {
    getMTR() {
      return new Promise((resolve) => {
        this.apiBusy = true;
        API.get(`${MTR_URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Get Minimum Tax Rate Error")
          )
          .finally(() => (this.apiBusy = false));
      });
    },
    updateMTR(mtr_rate) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${MTR_URL}/update-minimum-tax-rate/1`,
          {
            mtr_rate,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Update Minimum Tax Rate Error")
          )
          .finally(() => (this.submitting = false));
      });
    },
    getTRs() {
      return new Promise((resolve) => {
        API.get(`${TR_URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => {
            this.apiErrorHandler(err, "Get Tax Rates Error");
          });
      });
    },
    addTR(tr) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${TR_URL}/add-tax-rate`,
          {
            tr_band: tr.band,
            tr_rate: tr.rate,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => {
            this.apiErrorHandler(err, "Add Tax Rate Error");
          })
          .finally(() => (this.submitting = false));
      });
    },
    updateTR(tr) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${TR_URL}/update-tax-rate/${tr.trID}`,
          {
            tr_band: tr.band,
            tr_rate: tr.rate,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Update Tax Rate Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
