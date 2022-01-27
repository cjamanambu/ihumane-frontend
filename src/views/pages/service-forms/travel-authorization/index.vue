<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
export default {
  page: {
    title: "Travel Authorization",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
  },
  data() {
    return {
      title: "Travel Authorization",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Travel Authorization",
          active: true,
        },
      ],
    };
  },
  methods: {
    refreshTable() {},
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success">
        <i class="mdi mdi-plus mr-2"></i>
        Manage Travel Requests
      </b-button>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="p-3 bg-light mb-4">
              <h5 class="font-size-14 mb-0">Grant</h5>
            </div>
            <form>
              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group">
                    <label for=""> Employee's Name </label>
                    <input
                      type="text"
                      class="form-control"
                      disabled
                      :value="getUser.user_name"
                    />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Passport No
                      <small class="text-muted">(International Staff)</small> /
                      Nigeria ID No
                      <small class="text-muted">(National Staff)</small>
                    </label>
                    <input type="text" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Purpose of Travel
                      <small class="text-muted">(Description)</small>
                    </label>
                    <textarea class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="">
                      Dates of Travel
                      <small class="text-muted">(TO & FRO)</small>
                    </label>
                    <div class="row">
                      <div class="col-lg-6">
                        <div class="form-group">
                          <label for=""> Start </label>
                          <input type="date" class="form-control" />
                        </div>
                      </div>
                      <div class="col-lg-6">
                        <div class="form-group">
                          <label for=""> End </label>
                          <input type="date" class="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="">
                      Dates of Official Business:
                      <small class="text-muted">All Days</small>
                    </label>
                    <input type="date" class="form-control" disabled />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label for="">
                      T7 Number: <small class="text-muted">STAFF ID</small>
                    </label>
                    <input type="text" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for=""> Phone Number </label>
                    <input
                      type="text"
                      class="form-control"
                      :value="this.getEmployee.emp_phone_no"
                      disabled
                    />
                  </div>
                  <div class="form-group">
                    <label for="">Program / Charge Codes</label>
                    <div class="row">
                      <div class="col-lg-3">
                        <label for="">T1</label>
                      </div>
                      <div class="col-lg-9">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="GRANT CODE"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
