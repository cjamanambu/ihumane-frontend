import API from "@/api";

const MTR_URL = `minimum-tax-rate`;

export default {
  methods: {
    getMTR() {
      return new Promise((resolve) => {
        API.get(`${MTR_URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Get Minimum Tax Rate Error")
          );
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
            this.apiResponseHandler(err, "Update Minimum Tax Rate")
          )
          .finally(() => (this.submitting = false));
      });
    },
  },
};
