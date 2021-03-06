<script>
import { authMethods } from "@/state/helpers";
import { required, email } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      email: "",
      submitted: false,
      error: null,
      tryingToReset: false,
      isResetError: false,
      resetting: false,
    };
  },
  validations: {
    email: { required, email },
  },
  created() {
    document.body.classList.add("auth-body-bg");
  },
  methods: {
    ...authMethods,
    // Try to register the user in with the email, fullname
    // and password they provided.
    async tryToReset() {
      this.submitted = true;
      this.resetting = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Reset Password");
        this.resetting = false;
        return;
      } else {
        const url = `${this.ROUTES.user}/forgot-password`;
        const data = {
          user_username: this.email,
        };
        await this.apiPost(url, data, "Reset Password Error")
          .then((res) => {
            this.$router.push({ name: "login" }).then(() => {
              this.apiResponseHandler(
                `${res.data}`,
                "Reset Password Successful"
              );
            });
          })
          .finally(() => {
            this.resetting = false;
          });
      }
    },
  },
};
</script>

<template>
  <div>
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

                        <h4 class="font-size-18 mt-5">Reset Password</h4>
                        <p class="text-muted">
                          Enter your email to reset your IHUMANE password
                        </p>
                      </div>

                      <div class="p-2 mt-5">
                        <b-alert
                          v-model="isResetError"
                          class="mb-4"
                          variant="danger"
                          dismissible
                          >{{ error }}</b-alert
                        >

                        <form
                          class="form-horizontal"
                          @submit.prevent="tryToReset"
                        >
                          <div class="form-group auth-form-group-custom mb-4">
                            <i class="ri-mail-line auti-custom-input-icon"></i>
                            <label for="useremail">Email</label>
                            <input
                              v-model="email"
                              type="email"
                              class="form-control"
                              id="useremail"
                              placeholder="Enter email"
                              :class="{
                                'is-invalid': submitted && $v.email.$error,
                              }"
                              style="border-radius: 10px"
                            />
                            <div
                              v-if="submitted && $v.email.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.email.required"
                                >Email is required.</span
                              >
                              <span v-if="!$v.email.email"
                                >Please enter valid email.</span
                              >
                            </div>
                          </div>

                          <div class="mt-4 text-center">
                            <button
                              v-if="this.resetting"
                              class="btn btn-success w-md waves-effect waves-light"
                              type="submit"
                              disabled
                            >
                              Resetting...
                            </button>
                            <button
                              v-else
                              class="btn btn-success w-md waves-effect waves-light"
                              type="submit"
                            >
                              Reset
                            </button>
                          </div>
                        </form>
                      </div>

                      <div class="mt-5 text-center">
                        <p>
                          Already have an account?
                          <router-link
                            tag="a"
                            to="/login"
                            class="font-weight-medium text-primary"
                            >Log in</router-link
                          >
                        </p>
                        <p class="mt-3">
                          © {{ new Date().getFullYear() }} IHUMANE
                        </p>
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
