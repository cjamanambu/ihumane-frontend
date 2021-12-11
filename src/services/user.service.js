import API from "@/api";
import { authHeader } from "@/state/helpers";

export default {
  methods: {
    getUsers() {
      return new Promise((resolve) => {
        API.get(`users`, { headers: authHeader() })
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Users Error"));
      });
    },
  },
};
