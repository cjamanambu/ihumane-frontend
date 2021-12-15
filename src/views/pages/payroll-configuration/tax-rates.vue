<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import taxRateService from "@/services/tax-rate.service";
import { required } from "vuelidate/lib/validators";

export default {
  mixins: [taxRateService],
  page: {
    title: "Tax Rates",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  mounted() {
    this.refreshMTR();
  },
  validations: {
    rate: { required },
  },
  methods: {
    refreshMTR() {
      this.getMTR().then((res) => {
        const { data } = res;
        this.mtr = data[0].mtr_rate;
      });
    },
    selectMTR() {
      this.rate = this.mtr;
      this.$refs["update-mtr"].show();
    },
    resetMtrForm() {
      this.rate = null;
      this.$v.$reset();
    },
    submitMTR() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.apiFormHandler("Invalid MTR");
      } else {
        const { rate } = this;
        this.updateMTR(rate).then((res) => {
          this.apiResponseHandler(`${res.data}`, "Update Successful");
          this.refreshMTR();
          this.$v.$reset();
          this.$refs["update-mtr"].hide();
        });
      }
    },
  },
  data() {
    return {
      title: "Tax Rates",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Tax Rates",
          active: true,
        },
      ],
      mtr: 0,
      submitted: false,
      submitting: false,
      rate: null,
    };
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
    <b-card
      header-class="bg-transparent border-success"
      class="border border-success d-inline-block"
    >
      <template v-slot:header>
        <h5 class="my-0 text-success">
          <i class="mdi mdi-file-percent-outline mr-3"></i>Minimum Tax Rate
        </h5>
      </template>
      <h5 class="card-title mt-0">{{ mtr }}%</h5>
      <p class="card-text update-mtr" @click="selectMTR">Update MTR</p>
    </b-card>
    <b-modal
      ref="update-mtr"
      title="Update MTR"
      hide-footer
      centered
      title-class="font-18"
      size="sm"
      @hidden="resetMtrForm"
    >
      <form @submit.prevent="submitMTR">
        <div class="form-group">
          <label for="username">
            Minimum Tax Rate <span class="text-danger">*</span>
          </label>
          <input
            id="username"
            type="text"
            v-model="rate"
            class="form-control"
            :class="{
              'is-invalid': submitted && $v.rate.$error,
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
