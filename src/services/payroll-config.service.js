import API from "@/api";
import { authHeader } from "@/state/helpers";

export default {
  methods: {
    getPaymentDefinitions() {
      return new Promise((resolve) => {
        API.get(`payment-definitions`, { headers: authHeader() })
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Get Payment Definitions Error")
          );
      });
    },
  },
};
