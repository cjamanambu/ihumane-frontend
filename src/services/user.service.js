import API from "@/api";
import { authHeader } from "@/state/helpers";

export default {
  methods: {
    getUsers() {
      return new Promise((resolve) => {
        API.get(`users`, { headers: authHeader() })
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Get Users Error"));
      });
    },
    addUser(newUser) {
      this.submitting = true;
      return new Promise((resolve) => {
        API.post(
          `users/add-user`,
          {
            user_username: newUser.username,
            user_name: newUser.fullname,
            user_email: newUser.email,
            user_password: newUser.password,
            user_type: 1,
            user_token: newUser.token,
            user_status: newUser.userStatus,
          },
          { headers: authHeader() }
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
          `users/update-user/${user.userID}`,
          {
            user_username: user.username,
            user_name: user.fullname,
            user_email: user.email,
            user_type: user.userType,
            user_token: user.token,
            user_status: user.userStatus,
          },
          { headers: authHeader() }
        )
          .then((res) => resolve(res))
          .catch((err) => this.apiErrorHandler(err, "Edit User Error"))
          .finally(() => (this.submitting = false));
      });
    },
  },
};
