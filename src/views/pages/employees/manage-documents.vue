<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Employee Documents",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Employee Documents",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Employee Documents",
          active: true,
        },
      ],
      uploadFieldName: "file",
      uploadFiles: [],
      currentEmployee: null,
      employeeDocs: [],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [10, 25, 50, 100],
      filter: null,
      filterOn: [],
      sortBy: "sn",
      sortDesc: false,
      fields: [
        { key: "sn", label: "S/n", sortable: true, thStyle: { width: "5%" } },
        {
          key: "ed_filename",
          label: "File Name",
          sortable: true,
          thStyle: { width: "65%" },
        },
        {
          key: "createdAt",
          label: "Uploaded At",
          sortable: true,
        },
      ],
    };
  },
  mounted() {
    this.refreshTable();
  },
  methods: {
    fetchEmployee() {
      let employeeID = this.$route.params.employeeID;
      let url = `${this.ROUTES.employee}/get-employee/${employeeID}`;
      this.apiGet(url, "Get Employee Error").then((res) => {
        this.currentEmployee = res.data;
      });
    },
    refreshTable() {
      let employeeID = this.$route.params.employeeID;
      let url = `${this.ROUTES.employee}/get-documents/${employeeID}`;
      this.apiGet(url, "Get Employee Documents Error").then((res) => {
        const { data } = res;
        data.forEach((doc, index) => {
          this.employeeDocs[index] = { sn: ++index, ...doc };
        });
        this.totalRows = this.employeeDocs.length;
        this.fetchEmployee();
      });
    },
    launchFilePicker() {
      this.$refs.file.click();
    },
    async onFileChange(fieldName, files) {
      this.uploadFiles = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          this.uploadFiles.push(files[i]);
        }
      } else {
        this.$bvToast.toast("Please select at least one file to upload", {
          title: "No Files Selected",
          toaster: "b-toaster-top-right",
          appendToast: true,
          variant: "warning",
        });
      }
    },
    deleteFile(index) {
      this.uploadFiles.splice(index, 1);
    },
    async submitFiles() {
      let employeeID = this.$route.params.employeeID;
      if (this.uploadFiles.length > 0) {
        let formData = new FormData();
        await this.uploadFiles.forEach((file) => {
          formData.append("documents", file);
        });
        let url = `${this.ROUTES.employee}/upload-documents/${employeeID}`;
        this.apiPost(url, formData, "Upload Documents Error").then((res) => {
          this.uploadFiles = [];
          this.apiResponseHandler(res.data, "Upload Documents");
          this.refreshTable();
        });
      }
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    selectRow(row) {
      row = row[0];
      window.open(`${row.ed_doc}`);
      this.$refs["employee-doc-table"].clearSelected();
    },
  },
};
</script>
<style>
.file-uploads {
  padding: 3em;
  border: 1px dashed #1cbb8c;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
}
.file-detail {
  border: 1px solid #ced4da;
  padding: 0.5em 1em;
  border-radius: 5px;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button
        class="btn btn-success"
        @click="$router.push({ name: 'manage-employees' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        Manage Employees
      </b-button>
    </div>
    <div class="row">
      <div class="col-lg-7">
        <scale-loader v-if="apiBusy" />
        <div v-else class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row mt-4">
                  <div class="col-sm-12 col-md-6">
                    <div id="tickets-table_length" class="dataTables_length">
                      <label class="d-inline-flex align-items-center">
                        Show&nbsp;
                        <b-form-select
                          v-model="perPage"
                          size="sm"
                          :options="pageOptions"
                        ></b-form-select
                        >&nbsp;entries
                      </label>
                    </div>
                  </div>
                  <!-- Search -->
                  <div class="col-sm-12 col-md-6">
                    <div
                      id="tickets-table_filter"
                      class="dataTables_filter text-md-right"
                    >
                      <label class="d-inline-flex align-items-center">
                        Search:
                        <b-form-input
                          v-model="filter"
                          type="search"
                          placeholder="Search..."
                          class="form-control form-control-sm ml-2"
                        ></b-form-input>
                      </label>
                    </div>
                  </div>
                  <!-- End search -->
                </div>
                <!-- Table -->
                <div class="table-responsive mb-0">
                  <b-table
                    ref="employee-doc-table"
                    bordered
                    selectable
                    hover
                    :items="employeeDocs"
                    :fields="fields"
                    responsive="sm"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :filter="filter"
                    :filter-included-fields="filterOn"
                    @filtered="onFiltered"
                    show-empty
                    select-mode="single"
                    @row-selected="selectRow"
                  >
                    <template #cell(createdAt)="row">
                      <span>
                        {{ new Date(row.value).toDateString() }}
                      </span>
                      <span>
                        {{ new Date(row.value).toLocaleTimeString("en") }}
                      </span>
                    </template>
                  </b-table>
                </div>
                <div class="row">
                  <div class="col">
                    <div
                      class="dataTables_paginate paging_simple_numbers float-right"
                    >
                      <ul class="pagination pagination-rounded mb-0">
                        <!-- pagination -->
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="totalRows"
                          :per-page="perPage"
                        ></b-pagination>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">
                Manage Documents for
                <span class="text-capitalize" v-if="currentEmployee">
                  {{ currentEmployee.emp_first_name }}
                  {{ currentEmployee.emp_last_name }} ({{
                    currentEmployee.emp_unique_id
                  }})
                </span>
              </h5>
            </div>
            <input
              type="file"
              ref="file"
              multiple
              :name="uploadFieldName"
              @change="onFileChange($event.target.name, $event.target.files)"
              style="display: none"
            />
            <div class="file-uploads mb-3" @click="launchFilePicker()">
              <p class="mb-0 text-muted">Click here to upload files</p>
            </div>
            <div v-if="uploadFiles.length > 0">
              <div class="alert alert-info mb-3">
                You've chosen the following documents to upload. Confirm and
                upload your selection below.
              </div>
              <div
                class="file-detail d-flex justify-content-between align-items-center mt-3"
                v-for="(file, index) in uploadFiles"
                :key="index"
              >
                <small>
                  <span>{{ file.name }}</span>
                  <br />
                  <span>{{ file.size | getFileSize }}</span>
                </small>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteFile(index)"
                >
                  DEL
                </button>
              </div>
              <button
                v-if="!submitting"
                @click="submitFiles"
                class="btn btn-success btn-block mt-4"
              >
                Upload Selection
              </button>
              <button v-else disabled class="btn btn-success btn-block mt-4">
                Uploading Selection...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
