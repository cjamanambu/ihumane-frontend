<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";
import store from "@/state/store";
export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    const permissions = store.getters["auth/permissions"];
    if (
      (userType === 1 || userType === 3) &&
      permissions.includes("PAYROLL_CONFIG")
    ) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "Payroll Setup",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshPMY();
  },
  validations: {
    pmyDate: { required },
  },
  data() {
    return {
      title: "Payroll Setup",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Payroll Setup",
          active: true,
        },
      ],
      pmySet: true,
      pmyYear: null,
      pmyMonth: null,
      pmyDate: null,
      submitted: false,
    };
  },
  methods: {
    refreshPMY() {
      this.apiGet(
        this.ROUTES.payrollMonthYear,
        "Get Payroll Month & Year Error"
      ).then((res) => {
        if (res.data) {
          this.pmySet = true;
          const { pym_year, pym_month } = res.data;
          this.pmyMonth = pym_month;
          this.pmyYear = pym_year;
        } else {
          this.pmySet = false;
        }
      });
    },
    selectPMY() {
      if (!this.pmySet) {
        this.$refs["set-pmy"].show();
      } else {
        this.pmyDate = `${this.pmyYear}-${this.pmyMonth}`;
        this.$refs["set-pmy"].show();
      }
    },
    resetPMYForm() {
      this.pmyDate = null;
      this.$v.reset();
    },
    setPMY() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid Payroll Month & Year");
      } else {
        const date = this.pmyDate.split("-");
        const data = {
          pym_year: date[0],
          pym_month: date[1],
        };
        const url = `${this.ROUTES.payrollMonthYear}/add-payroll-month-year`;
        this.apiPost(url, data, "Add Payroll Month & Year Error").then(
          (res) => {
            if (res.data) {
              console.log({ res });
              this.apiResponseHandler(
                `Payroll month & year has been set successfully`,
                "New Payroll Month & Year Set"
              );
              this.refreshPMY();
              this.$v.$reset();
              this.$refs["set-pmy"].hide();
            }
          }
        );
      }
    },
  },
};
</script>
<style>
.update-mtr {
  transition: 0.5s ease;
}
.update-mtr:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <scale-loader v-if="apiBusy" />
    <div v-else>
      <div
        class="d-flex justify-content-between align-items-start mb-3 flex-lg-row flex-column"
      >
        <b-card
          header-class="bg-transparent border-success"
          class="border border-success d-inline-block"
        >
          <template v-slot:header>
            <h5 class="my-0 text-success">
              <i class="mdi mdi-calendar-sync mr-3"></i>
              Payroll Month & Year
            </h5>
          </template>
          <h5 class="card-title mt-0">
            {{ (parseInt(this.pmyMonth) - 1) | getMonth }} {{ this.pmyYear }}
          </h5>
          <p v-if="pmySet" class="card-text update-mtr" @click="selectPMY">
            Update PMY
          </p>
          <p v-else class="card-text update-mtr" @click="selectPMY">Set PMY</p>
        </b-card>
      </div>
    </div>
    <b-modal
      ref="set-pmy"
      title="Set PMY"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetPMYForm"
    >
      <form @submit.prevent="setPMY">
        <div class="form-group">
          <label for="pmy">
            Payroll Month & Year <span class="text-danger">*</span>
          </label>
          <input
            id="pmy"
            v-model="pmyDate"
            type="month"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.pmyDate.$error,
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
    </b-modal>
  </Layout>
</template>
