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
import TimeEffortForm from "@/views/pages/service-forms/timesheet/components/time-effort-form";

export default {
  page: {
    title: "Timesheet",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    FullCalendar,
    Layout,
    PageHeader,
    TimeEffortForm,
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
        dateClick: this.dateClicked,
        weekends: false,
        selectable: true,
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
      calendarView: false,
      status: null,
    };
  },
  methods: {
    async fetchPayroll() {
      let payrollMY = this.$route.params.payrollMY;
      console.log({ payrollMY });
      this.pymFullDate = `${payrollMY}-01`;
      this.pymYear = payrollMY.split("-")[0];
      this.pymMonth = payrollMY.split("-")[1];
      await this.fetchTimeAllocations();
      this.calendarOptions.initialDate = this.pymFullDate;
      this.calendarView = true;
    },
    fetchTimeAllocations() {
      // Here, I tried to get the time allocation for the payroll month and year to see if
      // it's been filled first.
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timeAllocation}/get-time-allocation/${employeeID}/${this.pymFullDate}`;
      this.apiGet(url, "Get Time Allocation Error").then((res) => {
        const { timeAllocationBreakDown } = res.data;
        this.breakdown = timeAllocationBreakDown;
        if (this.breakdown.length) {
          this.status = this.breakdown[0].ta_status;
        }
        timeAllocationBreakDown.every((tab) => {
          if (tab.ta_status) {
            // stop users from editing their timesheet entries if it has been
            // approved or rejected
            this.calendarOptions.selectable = false;
            this.calendarOptions.dateClick = null;
            return false;
          }
          return true;
        });
        this.fetchTimesheetData();
      });
    },
    async dateClicked(info) {
      console.log(this.calendarOptions);
      if (info) {
        this.newEventData = info;
        this.dateInfo = info;
        let isPublicHoliday = false;
        let date = this.dateInfo.dateStr.split("-");
        await this.publicHolidays.every((publicHoliday) => {
          if (
            publicHoliday.ph_year === date[0] &&
            parseInt(publicHoliday.ph_month) === parseInt(date[1]) &&
            parseInt(publicHoliday.ph_day) === parseInt(date[2])
          ) {
            this.phName = publicHoliday.ph_name;
            isPublicHoliday = true;
            return false;
          }
          return true;
        });
        if (!isPublicHoliday) {
          this.showModal = true;
        } else {
          this.showModalPH = true;
        }
      }
    },
    fetchTimesheetData() {
      // Get the timesheet data for an employee for each day of the payroll month.
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timesheet}/get-time-sheet-month/${employeeID}/${this.pymFullDate}`;
      this.apiGet(url, "Get Timesheet Error").then(async (res) => {
        const { data } = res;
        if (data.length) {
          await data.forEach((entry) => {
            let month, day;
            entry.ts_month.length === 1
              ? (month = `0${entry.ts_month}`)
              : (month = entry.ts_month);
            entry.ts_day.length === 1
              ? (day = `0${entry.ts_day}`)
              : (day = entry.ts_day);
            const date = `${entry.ts_year}-${month}-${day}`;
            const entryObj = {
              id: this.entryCount++,
              start: date,
              end: date,
              display: "background",
            };
            if (entry.ts_is_present) {
              entryObj.title = `${this.tConvert(
                entry.ts_start
              )} - ${this.tConvert(entry.ts_end)} for ${entry.ts_duration} hrs`;
            } else {
              entryObj.title = `ABSENT`;
              entryObj.display = "block";
            }
            let calendarApi = this.$refs.fullCalendar.getApi();
            calendarApi.addEvent(entryObj);
          });
        }
      });
      this.fetching = false;
    },
    fillTSE(dateInfo) {
      this.$router.push({
        name: "timesheet-entry",
        params: { date: dateInfo.dateStr },
      });
    },
    viewTimesheet() {
      const payrollMY = `${this.pymYear}-${this.pymMonth}`;
      this.$router.push({
        name: "view-timesheet",
        params: { payrollMY },
      });
    },
    tConvert(time) {
      // Check correct time format and split into components
      time = time
        .toString()
        .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? " AM" : " PM"; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join(""); // return adjusted time or original string
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
    <div class="alert alert-success" v-if="this.status === 1">
      This timesheet has been approved and cannot be modified further
    </div>
    <div class="alert alert-warning" v-else-if="this.status === 2">
      This timesheet has been declined and cannot be modified further
    </div>
    <scale-loader class="scale-loader" v-if="this.apiBusy" />
    <div v-else>
      <div class="row">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-body">
              <div class="app-calendar">
                <FullCalendar
                  v-if="calendarView"
                  ref="fullCalendar"
                  :options="calendarOptions"
                />
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
                <h5 class="font-size-14 mb-0">Time Allocation</h5>
              </div>
              <div v-if="status">
                <p v-for="(charge, index) in breakdown" :key="index">
                  <span class="mr-4">Grant Code: {{ charge.ta_tcode }}</span>
                  <span>Percentage Charge: {{ charge.ta_charge }}%</span>
                </p>
              </div>
              <div v-else>
                <TimeEffortForm
                  :breakdown="breakdown"
                  :pmy-month="pymMonth"
                  :pmy-year="pymYear"
                  @added-ta="viewTimesheet"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      v-model="showModal"
      title="Timesheet Entry"
      centered
      title-class="text-black font-18"
      body-class="p-3"
      hide-footer
    >
      <p v-if="dateInfo" class="mb-4">
        Manage your Time Sheet Entry for
        <strong>{{ dateInfo.date.toDateString() }}</strong> or select another
        date to continue.
      </p>
      <div class="text-center">
        <a
          href="javascript: void(0);"
          class="dropdown-icon-item"
          @click="fillTSE(dateInfo)"
        >
          <i class="dripicons-clock" style="font-size: 2em"></i>
          <span>Manage Timesheet Entry</span>
        </a>
      </div>
    </b-modal>
    <b-modal
      v-model="showModalPH"
      title="Timesheet Entry"
      centered
      title-class="text-black font-18"
      body-class="p-3"
      hide-footer
    >
      <p v-if="dateInfo" class="mb-4">
        <strong>{{ dateInfo.date.toDateString() }}</strong> is
        <strong class="text-capitalize"> {{ phName }} </strong>. Please select
        another date to fill.
      </p>
    </b-modal>
  </Layout>
</template>
