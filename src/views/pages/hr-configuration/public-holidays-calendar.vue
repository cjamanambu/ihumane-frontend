<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";
    import { required } from "vuelidate/lib/validators";
    //import Calendar from 'v-calendar/lib/components/calendar.umd';
    import DatePicker from 'v-calendar/lib/components/date-picker.umd'
    export default {
        page: {
            title: "Public Holiday Calendar",
            meta: [{ name: "description", content: appConfig.description }],
        },
        components: {
            Layout,
            PageHeader,
         // Calendar,
          DatePicker
        },
        mounted() {
            this.refreshTable();
        },
        validations: {
            public_name: { required },
            public_day: { required },
            public_month: { required },
            public_year: { required },
            public_date: { required },
        },
        data() {
            return {
              attrs:[
                {
                  key:'today',
                  highlight:{
                    backgroundColor:'#ff8080',
                  },
                  dates: new Date(2022,3,11),
                }
              ],
              modelConfig: {
                type: 'string',
                mask: 'YYYY-MM-DD', // Uses 'iso' if missing
              },
              todos: [
                {
                  id: 1,
                  description: 'Clean the house.',
                  date: new Date(2018, 0, 15),
                  isCompleted: false,
                  color: 'red'
                },
              ],
              date:new Date().toISOString().slice(0, 10),
              selectedDate:null,
              dates:[new Date(2022, 3,12).toISOString().slice(0, 10), new Date(2022, 3,19).toISOString().slice(0, 10)],
            }
        },
        methods:{
          refreshTable() {
            this.apiGet(this.ROUTES.publicHolidays, "Error getting public holidays").then((res) => {
              const { data } = res;
              console.log(data)
              console.log(this.dates);
              //this.dates = data;
              //console.log(this.dates);
              //this.totalRows = this.dates.length;
            });
          },
          submitNewPublicHoliday(e){
            console.log(e);
            /*this.submitted = true;
            this.$v.$touch();
            if (this.$v.$invalid) {
              this.apiFormHandler("Something went wrong. Inspect form and try again.");
            } else {
              const data = {
                public_name: this.public_name,
                public_date: this.public_date,
              };
              this.apiPost(`${this.ROUTES.publicHolidays}/add-public-holiday`, data, "Add New Public Holiday error").then((res) => {
                this.apiResponseHandler(`${res.data}`, "New Public Holiday added successfully.");
                this.refreshTable();
                this.$v.$reset();
                this.$refs["add-ph"].hide();
              });
            }*/
          },
          selectedDateHandler(){
            console.log(this.selectedDate);
          },
          dayClicked(day) {
            this.selectedDate = day;
          },
        },
      computed:{
        errorMessage() {
          if (!this.selectedDate) return 'Date is required.';
          return '';
        },
        attributes() {
          return this.todos.map(t => ({
            key: `todo.${t.id}`,
            dot: {
              backgroundColor: t.color,
            },
            dates: t.date,
            customData: t,
          }));
        },
      },
    };
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div class="d-flex justify-content-end mb-3">
            <b-button
                    class="btn btn-success"
                    @click="$refs['add-ph'].show()"
            >
                <i class="mdi mdi-plus mr-2"></i>
                Add New Holiday
            </b-button>
        </div>
        <b-spinner type="grow" v-if="apiBusy" class="m-2" variant="success" />
        <div v-else class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div class="row mt-4">
                            <div class="col-sm-12 col-md-12">
                              <DatePicker
                                v-model="date"
                                is-expanded
                                title-position="left"
                                :columns="$screens({ default: 1, lg:2})"
                                mode="date"
                                :attributes='attributes'
                                @dayclick="dayClicked"
                              />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
      <b-modal
        ref="add-ph"
        title="Add New Holiday"
        hide-footer
        centered
        title-class="font-18"
        @hidden="resetForm"
      >
        <form class="" @submit.prevent="submitNewPublicHoliday" autocomplete="off">
          <div class="flex w-full">
            <DatePicker v-model="date" class="flex-grow">
              <template >
                <div class="form-group">
                  <label for="">Event Title</label>
                  <input
                    id="public_name"
                    class="form-control"
                    :class="{ 'text-danger': errorMessage }"
                    :value="public_name"
                    v-on="public_nameEvent"
                    placeholder="Event Title"
                  />
                </div>
                <div class="form-group">
                  <label for="">Date</label>
                  <input
                    id="date"
                    class="form-control"
                    :class="{ 'border-red-600': errorMessage }"
                    v-model="selectedDate"
                    @input="selectedDateHandler"
                  />
                </div>
              </template>
            </DatePicker>
            <button
              type="button"
              class="btn btn-primary "
              :class="date ? 'bg-red-500' : 'bg-red-300'"
              :disabled="!date"
              @click="date = null"
            >
              Submit
            </button>
          </div>
        </form>
      </b-modal>
    </Layout>
</template>
