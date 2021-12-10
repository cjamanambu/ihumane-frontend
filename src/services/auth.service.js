import { authMethods, authComputed } from "@/state/helpers";

export default {
  computed: {
    ...authComputed,
  },
  methods: {
    ...authMethods,
    login(username, password) {
      this.logIn({ username, password })
        .then(() => {
          this.$router
            .push(this.$route.query.redirectFrom || { name: "home" })
            .then(() => {
              this.$bvToast.toast(`You have logged in successfully!`, {
                title: "Welcome",
                toaster: "b-toaster-top-right",
                appendToast: true,
                variant: "success",
              });
            });
        })
        .catch((err) => {
          this.$bvToast.toast(`${err}`, {
            title: "Login Error",
            toaster: "b-toaster-top-right",
            appendToast: true,
            variant: "danger",
          });
        });
    },
  },
};
