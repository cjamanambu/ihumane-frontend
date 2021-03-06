<script>
import { authComputed } from "@/state/helpers";

export default {
  data() {
    return {
      count: 1,
      invalidCharge: false,
      invalidMatchCharge: false,
      sum: 100,
      matchSum: 0,
      fields: [
        { id: 0, grant: null, charge: 100, match: null, matchCharge: 0 },
      ],
      confirmTER: false,
      donor: null,
      donors: [{ value: null, text: "Select code", disabled: true }],
      refNo: null,
    };
  },
  mounted() {
    this.calc();
    this.fetchDonors();
    this.populateFields();
  },
  computed: {
    ...authComputed,
  },
  props: {
    pmyMonth: {
      type: String,
      required: true,
    },
    pmyYear: {
      type: String,
      required: true,
    },
    breakdown: {
      type: Array,
      required: false,
    },
    tsRefNo: {
      type: String,
      required: true,
    },
  },
  methods: {
    fetchDonors() {
      this.apiGet(this.ROUTES.donor, "Get Donors Error").then((res) => {
        const { data } = res;
        this.donors = [{ value: null, text: "Select code", disabled: true }];
        data.forEach((donor) => {
          if (
            donor.donor_sector === parseInt(this.getEmployee.emp_department_id)
          ) {
            this.donors.push({
              value: donor.donor_code,
              text: `${donor.donor_code} (${donor.donor_description})`,
            });
          }
        });
      });
    },
    addField() {
      this.fields[0].charge--;
      this.fields.push({
        id: this.count,
        grant: null,
        charge: 1,
        match: null,
        matchCharge: 0,
      });
      this.count++;
    },
    delField(index) {
      if (index > 0) {
        this.fields.splice(index, 1);
        this.calc();
      }
    },
    calc() {
      this.sum = 0;
      this.matchSum = 0;
      this.fields.forEach((field) => {
        if (!field.charge) field.charge = 0;
        if (!field.matchCharge) field.matchCharge = 0;
        this.sum += parseInt(field.charge);
        this.matchSum += parseInt(field.matchCharge);
      });
      this.invalidCharge = this.sum !== 100;
      this.matchSum > 0 && this.matchSum !== 100
        ? (this.invalidMatchCharge = true)
        : (this.invalidMatchCharge = false);
    },
    confirm() {
      let valid = this.fields.every((field) => {
        if (!field.grant || !field.match) {
          return false;
        }
        return true;
      });
      if (valid) {
        let grants = [];
        let matches = [];
        this.fields.forEach((field) => {
          grants.push(field.grant);
          matches.push(field.match);
        });
        if (
          new Set(grants).size !== grants.length ||
          new Set(matches).size !== matches.length
        ) {
          this.apiFormHandler("No Duplicate T1 or T0 codes");
        } else {
          this.confirmTER = true;
        }
      } else {
        this.apiFormHandler("All T1 & T0 codes must be filled/selected");
      }
    },
    submit() {
      this.confirmTER = false;
      let ta_ref_no = this.tsRefNo,
        url,
        data;
      if (this.$route.name === "view-timesheet") {
        url = `${this.ROUTES.timeAllocation}/update-time-allocation`;
        data = [];
        this.fields.forEach(async (field) => {
          data.push({
            ta_emp_id: this.getEmployee.emp_id,
            ta_month: this.pmyMonth,
            ta_year: this.pmyYear,
            ta_tcode: field.grant,
            ta_charge: field.charge,
            ta_t0_code: field.match,
            ta_t0_percent: field.matchCharge,
            ta_ref_no,
          });
        });
        this.apiPost(url, data, "Time Allocation Error").then(() => {
          this.$emit("updated-ta");
          this.apiResponseHandler("Process Complete", "Time Allocation Added");
        });
      } else {
        url = `${this.ROUTES.timeAllocation}/add-time-allocation`;
        this.fields.forEach(async (field) => {
          const data = {
            ta_emp_id: this.getEmployee.emp_id,
            ta_month: this.pmyMonth,
            ta_year: this.pmyYear,
            ta_tcode: field.grant,
            ta_charge: field.charge,
            ta_t0_code: field.match,
            ta_t0_percent: field.matchCharge,
            ta_ref_no,
          };
          await this.apiPost(url, data, "Time Allocation Error").then(() => {
            this.$emit("added-ta");
            this.apiResponseHandler(
              "Process Complete",
              "Time Allocation Added"
            );
          });
        });
      }
    },
    populateFields() {
      if (this.breakdown && this.breakdown.length) {
        this.fields = [];
        this.refNo = this.breakdown[0].ta_ref_no;
        this.breakdown.forEach((entry, index) => {
          this.fields.push({
            id: index,
            grant: entry.ta_tcode,
            charge: entry.ta_charge,
            match: entry.ta_t0_code,
            matchCharge: entry.ta_t0_percent,
          });
        });
      }
    },
  },
};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
<template>
  <div>
    <form @submit.prevent="confirm">
      <div class="row" v-for="(field, index) in fields" :key="index">
        <div class="col-lg-4">
          <label> Match Code (T0) </label>
          <input class="form-control" v-model="field.match" />
        </div>
        <div class="col-lg-2">
          <label> % to Charge (T0) </label>
          <input
            v-model="field.matchCharge"
            type="number"
            class="form-control"
            min="0"
            max="100"
            @input="calc()"
          />
        </div>

        <div class="col-lg-3">
          <div class="form-group">
            <label> Grant Code (T1) </label>
            <b-form-select v-model="field.grant" :options="donors" />
          </div>
        </div>
        <div class="col-lg-2">
          <div class="form-group">
            <label> % to Charge (T1) </label>
            <input
              v-model="field.charge"
              type="number"
              class="form-control"
              id="charge"
              min="0"
              max="100"
              @input="calc()"
            />
          </div>
        </div>
        <div class="col-lg-1 text-right">
          <div v-if="field.id > 0" class="form-group">
            <label style="visibility: hidden">hidden</label><br />
            <button
              type="button"
              class="btn btn-danger"
              @click="delField(index)"
            >
              DEL
            </button>
          </div>
          <div v-else class="form-group">
            <label style="visibility: hidden">hidden</label><br />
            <button type="button" class="btn btn-success" @click="addField">
              ADD
            </button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <div
            class="alert d-flex justify-content-between"
            :class="[invalidMatchCharge ? 'alert-danger' : 'alert-success']"
          >
            <strong>% Charge (T0) Total</strong> <span>{{ matchSum }}%</span>
          </div>
        </div>
        <div class="col-lg-5">
          <div
            class="alert d-flex justify-content-between"
            :class="[invalidCharge ? 'alert-danger' : 'alert-success']"
          >
            <strong>% Charge (T1) Total</strong> <span>{{ sum }}%</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
          :disabled="invalidCharge || invalidMatchCharge"
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
      </div>
    </form>
    <b-modal
      v-model="confirmTER"
      title="Populate Timesheet"
      centered
      no-close-on-esc
      no-close-on-backdrop
      title-class="text-black font-18"
      body-class="p-3"
      hide-footer
      hide-header
    >
      <div class="text-center">
        <i
          class="mdi mdi-alert-octagon-outline text-success"
          style="font-size: 4em"
        />
        <h5 class="mt-n3 text-success">Are you sure?</h5>
      </div>
      <div class="alert alert-success mt-4">
        This process is irreversible. Please, ensure you have filled in your
        timesheet and all details provided are accurate before confirming.
      </div>
      <b-row>
        <b-col lg="6">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="confirmTER = false"
          >
            <i class="dripicons-wrong" style="font-size: 2em"></i>
            <span>Cancel</span>
          </a>
        </b-col>
        <b-col lg="6" class="mt-lg-0 mt-3">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="submit"
          >
            <i class="dripicons-checkmark" style="font-size: 2em"></i>
            <span>Confirm</span>
          </a>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>
