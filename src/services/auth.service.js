import { authMethods, authComputed, layoutMethods } from "@/state/helpers";

export default {
  computed: {
    ...authComputed,
  },
  methods: {
    ...authMethods,
    ...layoutMethods,
    login(username, password) {
      return new Promise((resolve) => {
        this.logIn({ username, password })
          .then(() => {
            // check user type here first before routing
            resolve(this.getUser.user_type);
          })
          .catch((err) => {
            this.apiErrorHandler(err, "Login Error");
          });
      });
    },
    unlock(username, password) {
      return new Promise((resolve) => {
        this.unlockScreen({ username, password })
          .then(() => resolve(true))
          .catch((err) => {
            this.apiErrorHandler(err, "Unlock Screen Error");
          });
      });
    },
  },
};
