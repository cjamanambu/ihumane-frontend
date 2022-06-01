<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required, sameAs } from "vuelidate/lib/validators";
import { authComputed } from "@/state/helpers";
import authService from "@/services/auth.service";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  mixins: [authService],
  page: {
    title: "Change Password",
    meta: [{ name: "description", content: appConfig.description }],
  },
  computed: {
    ...authComputed,
  },
  components: {
    Layout,
    PageHeader,
  },
  validations: {
    oldPassword: { required },
    newPassword: { required },
    confirmPassword: { sameAsPassword: sameAs("newPassword") },
  },
  // mounted() {
  //   console.log(this.getUser);
  // },
  methods: {
    submit() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Change Password");
      } else {
        const data = {
          current_password: this.oldPassword,
          new_password: this.newPassword,
          confirm_password: this.confirmPassword,
          userId: this.getUser.user_id,
        };
        const url = `${this.ROUTES.employee}/change-password`;
        this.apiPost(url, data, "Change Password Error").then((res) => {
          const { data } = res;
          console.log({ data });
          if (data) {
            this.logOut().then(() => {});
            this.$router.push({ name: "login" }).then(() => {
              this.$bvToast.toast(
                `Your session has ended. Please log in again with your new password.`,
                {
                  title: `Password Change Successful`,
                  toaster: "b-toaster-top-right",
                  appendToast: true,
                  variant: "success",
                }
              );
            });
          }
        });
      }
    },
  },
  data() {
    return {
      title: "Change Password",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Change Password",
          active: true,
        },
      ],
      submitted: false,
      oldPassword: null,
      newPassword: null,
      confirmPassword: null,
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'profile' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Profile
      </b-button>
    </div>
    <div class="row">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4 d-flex justify-content-between">
              <h5 class="font-size-14 mb-0">Password & Security</h5>
            </div>
            <div class="alert alert-info mb-4">
              <p class="mb-0">Change your account password below.</p>
              <p>
                Password strength is important so please create a hard to guess
                password.
              </p>
              <p class="mb-0">
                <strong>Note:</strong> If you change your password, you will end
                your current session.
              </p>
            </div>
            <form @submit.prevent="submit">
              <div class="form-group">
                <label for="old-password"> Old Password </label>
                <input
                  id="old-password"
                  type="password"
                  v-model="oldPassword"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.oldPassword.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="new-password"> New Password </label>
                <input
                  id="new-password"
                  type="password"
                  v-model="newPassword"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.newPassword.$error,
                  }"
                />
              </div>
              <div class="form-group">
                <label for="new-password-ii"> New Password (Again) </label>
                <input
                  id="new-password-ii"
                  type="password"
                  v-model="confirmPassword"
                  class="form-control"
                  :class="{
                    'is-invalid': submitted && $v.confirmPassword.$error,
                  }"
                />
              </div>
              <b-button
                v-if="!submitting"
                class="btn btn-success btn-block mt-4"
                type="submit"
              >
                Submit
              </b-button>
              <b-button
                v-else
                disabled
                class="btn btn-success btn-block mt-4"
                type="submit"
              >
                Submitting...
              </b-button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
