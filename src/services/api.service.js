// import { authHeader } from "@/state/helpers";
import { ROUTES, API, AUTH_HEADER } from "@/api";
import authService from "@/services/auth.service";

export default {
  mixins: [authService],
  data() {
    return {
      apiBusy: false,
      submitting: false,
      ROUTES,
    };
  },
  methods: {
    apiGet(url, errTitle) {
      this.apiBusy = true;
      return new Promise((resolve) => {
        API.get(`${url}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, errTitle))
          .finally(() => (this.apiBusy = false));
      });
    },
    apiPost(url, data, errTitle) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(`${url}`, data, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, errTitle))
          .finally(() => (this.submitting = false));
      });
    },
    apiPatch(url, data, errTitle) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(`${url}`, data, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, errTitle))
          .finally(() => (this.submitting = false));
      });
    },
    apiConfig() {
      return { headers: AUTH_HEADER() };
    },
    apiResponseHandler(message, title) {
      this.$bvToast.toast(`${message}`, {
        title,
        toaster: "b-toaster-top-right",
        appendToast: true,
        variant: "success",
      });
    },
    apiErrorHandler(error, title) {
      if (error.response.status !== 403) {
        this.$bvToast.toast(`${error.response.data}`, {
          title,
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "danger",
        });
      } else {
        this.logOut().then(() => {});
        this.$router.push({ name: "login" }).then(() => {
          this.$bvToast.toast(
            `Your session has expired. Please log in again.`,
            {
              title: `${error.response.data}`,
              toaster: "b-toaster-top-right",
              appendToast: true,
              variant: "danger",
            }
          );
        });
      }
    },
    apiFormHandler(title) {
      this.$bvToast.toast(`Please fill in all fields correctly`, {
        title: `${title}`,
        toaster: "b-toaster-top-right",
        appendToast: true,
        variant: "warning",
      });
    },
    apiValueHandler(input) {
      let output = input.toString().split(".");
      output[0] = output[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return output.join(".");
    },
  },
};
