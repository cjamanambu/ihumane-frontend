<script>
import { authComputed } from "@/state/helpers";

export default {
  data() {
    return {
      count: 1,
      invalidCharge: false,
      sum: 100,
      fields: [{ id: 0, grant: null, charge: 100 }],
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
  },
  methods: {
    fetchDonors() {
      this.apiGet(this.ROUTES.donor, "Get Donors Error").then((res) => {
        const { data } = res;
        this.donors = [{ value: null, text: "Select code", disabled: true }];
        data.forEach((donor) => {
          this.donors.push({
            value: donor.donor_code,
            text: `${donor.donor_code} (${donor.donor_description})`,
          });
        });
      });
    },
    addField() {
      this.fields[0].charge--;
      this.fields.push({ id: this.count, grant: null, charge: 1 });
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
      this.fields.forEach((field) => {
        this.sum += field.charge;
      });
      this.invalidCharge = this.sum !== 100;
    },
    confirm() {
      const valid = this.fields.every((field) => {
        if (!field.grant) {
          return false;
        }
        return true;
      });
      if (valid) {
        this.confirmTER = true;
      } else {
        this.apiFormHandler("Invalid Grant Code(s)");
      }
    },
    submit() {
      this.confirmTER = false;
      let ta_ref_no, url;
      if (this.refNo) {
        ta_ref_no = this.refNo;
        url = `${this.ROUTES.timeAllocation}/update-time-allocation`;
      } else {
        ta_ref_no = Math.random().toString(36).slice(2);
        url = `${this.ROUTES.timeAllocation}/add-time-allocation`;
      }
      this.fields.forEach(async (field) => {
        const data = {
          ta_emp_id: this.getEmployee.emp_id,
          ta_month: this.pmyMonth,
          ta_year: this.pmyYear,
          ta_tcode: field.grant,
          ta_charge: field.charge,
          ta_ref_no,
        };
        await this.apiPost(url, data, "Time Allocation Error").then();
      });
      this.$emit("added-ta");
      this.apiResponseHandler("Process Complete", "Time Allocation Added");
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
        <div class="col-lg-6">
          <div class="form-group">
            <label> Grant Code (T1) </label>
            <b-form-select v-model="field.grant" :options="donors" />
          </div>
        </div>
        <div class="col-lg-4">
          <div class="form-group">
            <label> % to Charge (T1) </label>
            <b-form-spinbutton
              v-model="field.charge"
              id="charge"
              min="1"
              max="100"
              @change="calc(field.charge)"
            />
          </div>
        </div>
        <div class="col-lg-2">
          <div v-if="field.id > 0" class="form-group">
            <label style="visibility: hidden">hidden</label>
            <button
              type="button"
              class="btn btn-danger"
              @click="delField(index)"
            >
              DEL
            </button>
          </div>
          <div v-else class="form-group">
            <label style="visibility: hidden">hidden</label>
            <button type="button" class="btn btn-success" @click="addField">
              ADD
            </button>
          </div>
        </div>
      </div>
      <div
        class="alert d-flex justify-content-between"
        :class="[invalidCharge ? 'alert-danger' : 'alert-success']"
      >
        <strong>% Charge (T1) Total</strong> <span>{{ sum }}%</span>
      </div>
      <div class="form-group">
        <b-button
          v-if="!submitting"
          class="btn btn-success btn-block mt-4"
          type="submit"
          :disabled="invalidCharge"
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
