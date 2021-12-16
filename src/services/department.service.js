import API from "@/api";

const URL = `departments`;

export default {
  methods: {
    getDepartments() {
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Departments Error"));
      });
    },
    addDepartment(dept) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(`${URL}/add-payment-definition`, {}, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) =>
            this.apiErrorHandler(err, "Add Payment Definition Error")
          )
          .finally(() => (this.submitting = false));
      });
    },
  },
};
