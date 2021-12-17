import API from "@/api";

const URL = `departments`;

export default {
  methods: {
    getDepartments() {
      this.apiBusy = true;
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Departments Error"))
          .finally(() => (this.apiBusy = false));
      });
    },
    addDepartment(dept) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}`,
          {
            department_name: dept.name,
            t3_code: dept.t3_code,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Add Department Error"))
          .finally(() => (this.submitting = false));
      });
    },
    updateDepartment(dept) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${URL}/${dept.deptID}`,
          {
            department_name: dept.name,
            t3_code: dept.t3_code,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Update Department Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
