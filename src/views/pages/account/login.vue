<script>
import { required } from "vuelidate/lib/validators";
import authService from "@/services/auth.service";

export default {
  mixins: [authService],
  data() {
    return {
      username: "",
      password: "",
      submitted: false,
    };
  },
  created() {
    document.body.classList.add("auth-body-bg");
  },
  validations: {
    username: { required },
    password: { required },
  },
  methods: {
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      this.submitting = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Login");
        this.submitting = false;
      } else {
        const { username, password } = this;
        this.login(username, password).then((userType) => {
          switch (userType) {
            case 2:
              this.employeeLogin(username);
              break;
            case 3:
              this.$refs["account-selector"].show();
              break;
            default:
              this.adminLogin(username);
              break;
          }
          this.submitting = false;
        });
      }
    },
    adminLogin(username) {
      this.changeLayoutType({ layoutType: "vertical" });
      this.changeTopbar({ topbar: "dark" });
      this.setPanel({ panel: "admin" });
      this.$router
        .push(this.$route.query.redirectFrom || { name: "home" })
        .then(() =>
          this.apiResponseHandler(
            "You have logged in successfully",
            `Welcome Back, ${username}`
          )
        );
    },
    employeeLogin(username) {
      this.changeLayoutType({ layoutType: "horizontal" });
      this.changeTopbar({ topbar: "light" });
      this.setPanel({ panel: "self-service" });
      this.$router
        .push(this.$route.query.redirectFrom || { name: "home" })
        .then(() =>
          this.apiResponseHandler(
            "You have logged in successfully",
            `Welcome Back, ${username}`
          )
        );
    },
  },
};
</script>

<template>
  <div>
    <b-modal
      ref="account-selector"
      title="Large modal"
      title-class="font-18"
      hide-header
      hide-footer
      no-close-on-backdrop
      no-close-on-esc
      centered
    >
      <div class="card-body text-center">
        <span class="logo-sm">
          <img
            :src="require('@/assets/images/ihumane-green-short.svg')"
            alt
            height="50"
          />
        </span>
        <h4 class="card-title mt-4">Welcome, {{ getUser.user_username }}.</h4>
        <p class="card-title-desc mt-3">
          Please select the account you want to login as.
        </p>
        <b-row>
          <b-col lg="6">
            <a
              href="javascript: void(0);"
              class="dropdown-icon-item"
              @click="adminLogin(`${getUser.user_username}`)"
            >
              <i class="dripicons-user" style="font-size: 2em"></i>
              <span>Admin Account</span>
            </a>
          </b-col>
          <b-col lg="6" class="mt-lg-0 mt-3">
            <a
              href="javascript: void(0);"
              class="dropdown-icon-item"
              @click="employeeLogin(`${getUser.user_username}`)"
            >
              <i class="dripicons-user-group" style="font-size: 2em"></i>
              <span>Employee Self-Service</span>
            </a>
          </b-col>
        </b-row>
      </div>
    </b-modal>
    <div>
      <div class="container-fluid p-0">
        <div class="row no-gutters">
          <div class="col-lg-4">
            <div
              class="authentication-page-content p-4 d-flex align-items-center min-vh-100"
            >
              <div class="w-100">
                <div class="row justify-content-center">
                  <div class="col-lg-9">
                    <div>
                      <div class="text-center">
                        <div>
                          <a href="/" class="logo">
                            <img
                              :src="
                                require('@/assets/images/ihumane-green-short.svg')
                              "
                              height="80"
                              alt="logo"
                            />
                          </a>
                        </div>

                        <h4 class="font-size-18 mt-5">
                          Welcome to <strong>IHUMANE</strong>
                        </h4>
                        <p class="text-muted">
                          To get started, please login with your credentials
                        </p>
                      </div>
                      <div class="p-2 mt-5">
                        <form
                          class="form-horizontal"
                          @submit.prevent="tryToLogIn"
                        >
                          <div class="form-group auth-form-group-custom mb-4">
                            <i class="ri-user-3-line auti-custom-input-icon" />
                            <label for="username">Username</label>
                            <input
                              type="text"
                              v-model="username"
                              class="form-control"
                              id="username"
                              placeholder="Enter username"
                              :class="{
                                'is-invalid': submitted && $v.username.$error,
                              }"
                              style="border-radius: 10px"
                            />
                            <div
                              v-if="submitted && $v.username.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.username.required">
                                Your username is required.
                              </span>
                            </div>
                          </div>

                          <div class="form-group auth-form-group-custom mb-4">
                            <i class="ri-lock-2-line auti-custom-input-icon" />
                            <label for="userpassword">Password</label>
                            <input
                              v-model="password"
                              type="password"
                              class="form-control"
                              id="userpassword"
                              placeholder="Enter password"
                              :class="{
                                'is-invalid': submitted && $v.password.$error,
                              }"
                              style="border-radius: 10px"
                            />
                            <div
                              v-if="submitted && !$v.password.required"
                              class="invalid-feedback"
                            >
                              Password is required
                            </div>
                          </div>

                          <div class="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              class="custom-control-input"
                              id="customControlInline"
                            />
                            <label
                              class="custom-control-label"
                              for="customControlInline"
                            >
                              Remember me
                            </label>
                          </div>

                          <div class="mt-4 text-center">
                            <button
                              v-if="this.submitting"
                              class="btn btn-success w-md waves-effect waves-light"
                              type="submit"
                              disabled
                            >
                              Logging in...
                            </button>
                            <button
                              v-else
                              class="btn btn-success w-md waves-effect waves-light"
                              type="submit"
                            >
                              Log In
                            </button>
                          </div>

                          <div class="mt-4 text-center">
                            <router-link
                              tag="a"
                              to="/forgot-password"
                              class="text-muted"
                            >
                              <i class="mdi mdi-lock mr-1"></i> Forgot your
                              password?
                            </router-link>
                          </div>
                        </form>
                      </div>

                      <div class="mt-5 text-center">
                        <p>© 2021 IHUMANE</p>
                        <p>
                          Powered by
                          <a href="https://telecom.connexxiongroup.com">
                            Connexxion Telecom
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="authentication-bg">
              <div class="bg-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
