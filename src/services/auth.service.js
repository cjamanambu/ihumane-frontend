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
          // check user type here first before routing
          this.$router
            .push(this.$route.query.redirectFrom || { name: "home" })
            .then(() =>
              this.apiResponseHandler(
                "You have logged in successfully",
                "Welcome Back"
              )
            );
        })
        .catch((err) => {
          this.apiErrorHandler(err, "Login Error");
        });
    },
  },
};
