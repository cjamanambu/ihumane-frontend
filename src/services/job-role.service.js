import API from "@/api";

const URL = `job-roles`;

export default {
  methods: {
    getJRs() {
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Job Roles Error"));
      });
    },
    addJR(jr) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}`,
          {
            job_role: jr.role,
            department_id: jr.department,
            description: jr.description,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Add Job Role Error"))
          .finally(() => (this.submitting = false));
      });
    },
    updateJR(jr) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}/${jr.jobRoleID}`,
          {
            job_role: jr.role,
            department_id: jr.department,
            description: jr.description,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Update Job Role Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
