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
      return new Promise((resolve, reject) => {
        API.get(`${url}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => {
            this.apiErrorHandler(err, errTitle);
            reject(err);
          })
          .finally(() => (this.apiBusy = false));
      });
    },
    apiPost(url, data, errTitle) {
      this.submitting = true;
      return new Promise((resolve, reject) => {
        API.post(`${url}`, data, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => {
            this.apiErrorHandler(err, errTitle);
            reject(err);
          })
          .finally(() => (this.submitting = false));
      });
    },
    apiPatch(url, data, errTitle) {
      this.submitting = true;
      return new Promise((resolve, reject) => {
        API.patch(`${url}`, data, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => {
            this.apiErrorHandler(err, errTitle);
            reject(err);
          })
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
      const statusCode = error.response.status;
      switch (statusCode) {
        case 403: {
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
          break;
        }
        case 500: {
          const errorMessage = error.response.data.message;
          if (errorMessage && errorMessage === "jwt expired") {
            this.logOut().then(() => {});
            this.$router.push({ name: "login" }).then(() => {
              this.$bvToast.toast(
                `Your session has expired. Please log in again.`,
                {
                  title: `Invalid Session`,
                  toaster: "b-toaster-top-right",
                  appendToast: true,
                  variant: "danger",
                }
              );
            });
          }
          break;
        }
        default: {
          this.$bvToast.toast(`Please fill in all fields correctly`, {
            title: `${title}`,
            toaster: "b-toaster-top-right",
            appendToast: true,
            variant: "warning",
          });
          break;
        }
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
