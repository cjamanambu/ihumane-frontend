<script>
export default {
  data() {
    return {
      count: 1,
      invalidCharge: false,
      sum: 100,
      fields: [{ id: 0, grant: null, charge: 100 }],
    };
  },
  mounted() {
    this.calc();
  },
  methods: {
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
    <form @submit.prevent>
      <div class="row" v-for="(field, index) in fields" :key="index">
        <div class="col-lg-6">
          <div class="form-group">
            <label for="grant"> Grant Code (T1) </label>
            <input id="grant" v-model="field.grant" class="form-control" />
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
            <button class="btn btn-danger" @click="delField(index)">DEL</button>
          </div>
          <div v-else class="form-group">
            <label style="visibility: hidden">hidden</label>
            <button class="btn btn-success" @click="addField">ADD</button>
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
  </div>
</template>
