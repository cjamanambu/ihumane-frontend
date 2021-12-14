import API from "@/api";
import { authHeader } from "@/state/helpers";
const PD_URL = `payment-definitions`;

export default {
  methods: {
    getPaymentDefinitions() {
      return new Promise((resolve) => {
        API.get(`${PD_URL}`, { headers: authHeader() })
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
          `${PD_URL}/add-payment-definition`,
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
          { headers: authHeader() }
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
          `${PD_URL}/update-payment-definition/${pd.pdID}`,
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
          { headers: authHeader() }
        )
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiResponseHandler(err, "Update Payment Definition")
          )
          .finally(() => (this.submitting = false));
      });
    },
  },
};
