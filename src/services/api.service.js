export default {
  methods: {
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
        this.$router.push({ name: "logout" }).then(() => {
          this.$router.push({ name: "login" }).then(() => {
            this.$bvToast.toast(`${error.response.data}`, {
              title,
              toaster: "b-toaster-top-right",
              appendToast: true,
              variant: "danger",
            });
          });
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
  },
};
