import API from "@/api";
const URL = "/grades";

export default {
  methods: {
    getGrades() {
      this.apiBusy = true;
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Grades Error"))
          .finally(() => (this.apiBusy = false));
      });
    },
    addGrade(grade_name) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}`,
          {
            grade_name,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Add Grade Error"))
          .finally(() => (this.submitting = false));
      });
    },
    updateGrade(grade) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${URL}/${grade.gradeID}`,
          {
            grade_name: grade.name,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Update Grade Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
