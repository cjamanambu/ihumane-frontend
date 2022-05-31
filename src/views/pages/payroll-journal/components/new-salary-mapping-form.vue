<script>
import Multiselect from "vue-multiselect";
export default {
  components: {
    Multiselect,
  },
  mounted() {
    this.fetchLocations();
  },
  data() {
    return {
      period: null,
      locations: [],
      location: null,
      file: null,
      uploading: false,
    };
  },
  methods: {
    fetchLocations() {
      this.apiGet(this.ROUTES.location, "Get Locations Error").then((res) => {
        this.locations = [];
        const { data } = res;
        data.forEach((location) => {
          this.locations.push({
            value: location.location_id,
            text: `${location.location_name} - ${location.l_t6_code}`,
          });
        });
      });
    },
    locationLabel({ text }) {
      return `${text}`;
    },
    async upload() {
      if (!this.period || !this.location || !this.file) {
        this.apiFormHandler("Period, location & file upload are required");
      } else {
        this.uploading = true;
        const data = {
          smm_month: parseInt(this.period.split("-")[1]),
          smm_year: parseInt(this.period.split("-")[0]),
          smm_location: this.location.value,
        };
        let url = `${this.ROUTES.payrollJournal}/salary-mapping-master`;
        await this.apiPost(url, data, "Upload Salary Mapping (Step 1)")
          .then(async (res) => {
            const { data } = res;
            if (data) {
              const masterId = data.smm_id;
              url = `${this.ROUTES.payrollJournal}/upload-mapping-detail/${masterId}`;
              let fd = new FormData();
              fd.append("salary_map", this.file);
              await this.apiPost(url, fd, "Upload Salary Mapping (Step 2)")
                .then(async (res) => {
                  const { data } = res;
                  if (data && data === "Uploaded Successfully") {
                    url = `${this.ROUTES.payrollJournal}/salary-mapping-detail/${masterId}`;
                    await this.apiGet(url, "Upload Salary Mapping (Step 3)")
                      .then((res) => {
                        const { data } = res;
                        if (data) {
                          this.apiResponseHandler(data, "Process Complete");
                          this.$emit("uploaded");
                        }
                      })
                      .catch(() => {
                        this.uploading = false;
                      });
                  }
                })
                .catch(() => {
                  this.uploading = false;
                });
            }
          })
          .catch(() => {
            this.uploading = false;
          });
        this.uploading = false;
        this.resetForm();
      }
    },
    resetForm() {
      this.period = null;
      this.location = null;
      this.file = null;
    },
  },
};
</script>

<template>
  <div>
    <div class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <div class="d-inline mb-0">
                <h5 class="font-size-14 mb-0">Upload New Salary Mapping</h5>
              </div>
            </div>
            <div class="form-group">
              <label for="period">Period</label>
              <input
                id="period"
                type="month"
                class="form-control"
                v-model="period"
              />
            </div>
            <div class="form-group">
              <label for="location">Location</label>
              <multiselect
                id="location"
                v-model="location"
                :options="locations"
                placeholder="Please select a location"
                :custom-label="locationLabel"
              />
            </div>
            <div class="form-group">
              <label for="file">File Upload</label>
              <b-form-file id="file" v-model="file" accept=".xlsx,.xls,.csv" />
            </div>
            <div class="mt-4">
              <button
                v-if="!uploading"
                @click="upload"
                class="btn btn-success w-100 mr-3"
              >
                Submit
              </button>
              <button v-else disabled class="btn btn-success w-100 mr-3">
                Submitting...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
