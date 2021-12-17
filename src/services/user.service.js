import API from "@/api";
const URL = `users`;

export default {
  methods: {
    getUsers() {
      this.apiBusy = true;
      return new Promise((resolve) => {
        API.get(`${URL}`, this.apiConfig())
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Users Error"))
          .finally(() => (this.apiBusy = false));
      });
    },
    addUser(newUser) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `${URL}/add-user`,
          {
            user_username: newUser.username,
            user_name: newUser.fullname,
            user_email: newUser.email,
            user_password: newUser.password,
            user_type: 1,
            user_token: newUser.token,
            user_status: newUser.userStatus,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Add User Error"))
          .finally(() => (this.submitting = false));
      });
    },
    editUser(user) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.patch(
          `${URL}/update-user/${user.userID}`,
          {
            user_username: user.username,
            user_name: user.fullname,
            user_email: user.email,
            user_type: user.userType,
            user_token: user.token,
            user_status: user.userStatus,
          },
          this.apiConfig()
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Update User Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
