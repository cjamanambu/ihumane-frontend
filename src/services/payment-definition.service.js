import API from "@/api";
const URL = `payment-definitions`;

export default {
  methods: {
    getPaymentDefinitions() {
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Get Payment Definitions Error")
          );
      });
    },
    addPD(pd) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}/add-payment-definition`,
          {
            pd_payment_code: pd.code,
            pd_payment_name: pd.name,
            pd_payment_type: pd.type,
            pd_payment_variant: pd.variant,
            pd_payment_taxable: pd.taxable,
            pd_desc: pd.description,
            pd_basic: pd.basic,
            pd_tie_number: pd.tie,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Add Payment Definition Error")
          )
          .finally(() => (this.submitting = false));
      });
    },
    updatePD(pd) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${URL}/update-payment-definition/${pd.pdID}`,
          {
            pd_payment_code: pd.code,
            pd_payment_name: pd.name,
            pd_payment_type: pd.type,
            pd_payment_variant: pd.variant,
            pd_payment_taxable: pd.taxable,
            pd_desc: pd.description,
            pd_basic: pd.basic,
            pd_tie_number: pd.tie,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Update Payment Definition Error")
          )
          .finally(() => (this.submitting = false));
      });
    },
  },
};
