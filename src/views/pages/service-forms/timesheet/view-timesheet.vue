<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";
import { authComputed } from "@/state/helpers";
export default {
  page: {
    title: "Timesheet",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    FullCalendar,
    Layout,
    PageHeader,
  },
  computed: {
    ...authComputed,
  },
  mounted() {
    this.fetchPayroll();
  },
  data() {
    return {
      title: "Timesheet",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "Timesheet",
          active: true,
        },
      ],
      calendarOptions: {
        headerToolbar: {
          left: "title",
          center: "",
          right: "",
        },
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          bootstrapPlugin,
          listPlugin,
        ],
        initialView: "dayGridMonth",
        themeSystem: "bootstrap",
        initialDate: null,
        initialEvents: [],
        editable: false,
        droppable: false,
        eventResizableFromStart: false,
        dateClick: null,
        weekends: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        showNonCurrentDates: false,
        fixedWeekCount: false,
      },
      currentEvents: [],
      showModal: false,
      eventModal: false,
      submitted: false,
      submit: false,
      newEventData: {},
      edit: {},
      deleteId: {},
      event: {
        title: "",
        category: "",
      },
      editevent: {
        editTitle: "",
        editcategory: "",
      },
      dateInfo: null,
      pymYear: "",
      pymMonth: "",
      pymFullDate: "",
      fetching: false,
      populateOption: false,
      entryCount: 0,
      populating: false,
      timeAllocated: false,
      publicHolidays: [],
      showModalPH: false,
      phName: "",
      breakdown: [],
    };
  },
  methods: {
    async fetchPayroll() {
      let payrollMY = this.$route.params.payrollMY;
      this.pymFullDate = `${payrollMY}-01`;
      await this.fetchTimeAllocations();
      this.calendarOptions.initialDate = this.pymFullDate;
    },
    fetchTimeAllocations() {
      // Here, I tried to get the time allocation for the payroll month and year to see if
      // it's been filled first.
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timeAllocation}/get-time-allocation/${employeeID}/${this.pymFullDate}`;
      this.apiGet(url, "Get Time Allocation Error").then((res) => {
        const { timeAllocationBreakDown } = res.data;
        this.breakdown = timeAllocationBreakDown;
        this.fetchTimesheetData();
      });
    },
    fetchTimesheetData() {
      // Get the timesheet data for an employee for each day of the payroll month.
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timesheet}/get-time-sheet-month/${employeeID}/${this.pymFullDate}`;
      this.apiGet(url, "Get Timesheet Error").then(async (res) => {
        const { data } = res;
        if (data.length) {
          await data.forEach((entry) => {
            let month, day, title;
            title = `${entry.ts_start} - ${entry.ts_end} for ${entry.ts_duration} hrs`;
            entry.ts_month.length === 1
              ? (month = `0${entry.ts_month}`)
              : (month = entry.ts_month);
            entry.ts_day.length === 1
              ? (day = `0${entry.ts_day}`)
              : (day = entry.ts_day);
            const date = `${entry.ts_year}-${month}-${day}`;
            const entryObj = {
              id: this.entryCount++,
              title,
              start: date,
              end: date,
              display: "background",
            };
            let calendarApi = this.$refs.fullCalendar.getApi();
            calendarApi.addEvent(entryObj);
          });
        }
      });
      this.fetching = false;
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
        @click="$router.push({ name: 'timesheets' })"
      >
        <i class="mdi mdi-plus mr-2"></i>
        View Timesheets
      </b-button>
    </div>
    <scale-loader class="scale-loader" v-if="this.apiBusy" />
    <div v-else>
      <div class="row">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-body">
              <div class="app-calendar">
                <FullCalendar ref="fullCalendar" :options="calendarOptions" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card mb-3">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">
                  International Rescue Committee - Overseas Staff
                </h5>
              </div>
              <div class="d-flex justify-content-between">
                <p>Payroll Reporting Period</p>
                <p class="font-weight-bolder">
                  <span
                    >{{ new Date(pymFullDate).getMonth() | getMonth }}
                    {{ new Date(pymFullDate).getFullYear() }}</span
                  >
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Name</p>
                <p>
                  {{ getUser.user_name }}
                </p>
              </div>
              <div class="d-flex justify-content-between">
                <p>T7 Code</p>
                <p>{{ getEmployee.emp_unique_id }}</p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Location (T6)</p>
                <p>{{ getEmployee.location.l_t6_code }}</p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Site Code (T3)</p>
                <p>{{ getEmployee.JobRole.Department.d_t3_code }}</p>
              </div>
              <div class="d-flex justify-content-between">
                <p>Nationality</p>
                <p>Non-US</p>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="p-3 bg-light mb-4">
                <h5 class="font-size-14 mb-0">Time & Effort Reporting</h5>
              </div>
              <p v-for="(charge, index) in breakdown" :key="index">
                <span class="mr-4">Grant Code: {{ charge.ta_tcode }}</span>
                <span>Percentage Charge: {{ charge.ta_charge }}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
