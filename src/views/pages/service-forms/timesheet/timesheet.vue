<script>
import Layout from "@/views/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config.json";
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";
import { authComputed } from "@/state/helpers";
import TimeEffortForm from "./components/time-effort-form";
import store from "@/state/store";

export default {
  beforeRouteEnter(to, from, next) {
    const userType = store.getters["auth/getUser"].user_type;
    if (userType === 2 || userType === 3) {
      next();
    } else {
      alert("You are not allowed to access this page. You will be redirected.");
      next("/");
    }
  },
  page: {
    title: "TimeSheet",
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
    this.fetchPayrollMonthYear();
  },
  data() {
    return {
      title: "TimeSheet",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          href: "/",
        },
        {
          text: "TimeSheet",
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
      groupedPublicHolidays: [],
      showModalPH: false,
      phName: "",
      refNo: null,
      timesheetApproved: false,
    };
  },
  methods: {
    async fetchPayrollMonthYear() {
      /* Here, I first got public holidays and then the payroll month and year.
       * I set the initial date on the FullCalendar as the first day of the payroll
       * month and year.
       * */
      this.fetching = true;
      let url = `${this.ROUTES.publicHolidays}/holiday`;
      await this.apiGet(url).then((res) => {
        this.publicHolidays = res.data;
      });
      await this.apiGet(this.ROUTES.publicHolidays).then((res) => {
        this.groupedPublicHolidays = res.data;
      });
      // await this.apiGet(this.ROUTES.payrollMonthYear).then((res) => {
      //   if (res.data) {
      //     const { pym_year, pym_month } = res.data;
      //     this.pymYear = pym_year;
      //     this.pymMonth = pym_month;
      //     this.pymFullDate = `${pym_year}-${pym_month}-01`;
      //     this.fetchTimeAllocations();
      //     this.calendarOptions.initialDate = this.pymFullDate;
      //   }
      // });
      let { payrollMY } = this.$route.params;
      this.pymFullDate = `${payrollMY}-01`;
      const dateParts = this.pymFullDate.split("-");
      this.pymYear = dateParts[0];
      this.pymMonth = dateParts[1];
      this.fetchTimeAllocations();
      this.calendarOptions.initialDate = this.pymFullDate;
    },
    fetchTimeAllocations() {
      // Here, I tried to get the time allocation for the payroll month and year to see if
      // it's been filled first.
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timeAllocation}/get-time-allocation/${employeeID}/${this.pymFullDate}`;
      this.apiGet(url, "Get Time Allocation Error").then((res) => {
        const { timeAllocationSum, timeAllocationStatus } = res.data;
        if (timeAllocationSum) {
          this.timeAllocated = true;
        } else if (
          timeAllocationStatus.length &&
          timeAllocationStatus[0].ta_status === 1
        ) {
          this.timesheetApproved = true;
        } else {
          // either your timesheet was not filled or it was declined
          this.fetchTimesheetData();
        }
      });
    },
    fetchTimesheetData() {
      // Get the timesheet data for an employee for each day of the payroll month.
      const employeeID = this.getEmployee.emp_id;
      const dateParts = this.pymFullDate.split("-");
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      console.log({ month, year });
      const url = `${this.ROUTES.timesheet}/get-time-sheets/${employeeID}/${month}/${year}`;
      this.apiGet(url, "Get Timesheet Error").then(async (res) => {
        const { data } = res;
        console.log(data);
        if (!data.length) {
          this.runTimesheetPopulate();
          // this.populateTimesheetData();
        } else {
          this.refNo = data[0].ts_ref_no;
          let calendarApi = this.$refs.fullCalendar.getApi();
          let entryObj = {};
          this.publicHolidays.forEach((publicHoliday) => {
            let month, day;
            publicHoliday.ph_month.length === 1
              ? (month = `0${publicHoliday.ph_month}`)
              : (month = publicHoliday.ph_month);
            publicHoliday.ph_day.length === 1
              ? (day = `0${publicHoliday.ph_day}`)
              : (day = publicHoliday.ph_day);
            // publicHoliday.ph_to_month.toString().length === 1
            //   ? (endMonth = `0${publicHoliday.ph_to_month}`)
            //   : (endMonth = publicHoliday.ph_to_month);
            // publicHoliday.ph_to_day.toString().length === 1
            //   ? (endDay = `0${publicHoliday.ph_to_day}`)
            //   : (endDay = publicHoliday.ph_to_day);
            let startDate = `${publicHoliday.ph_year}-${month}-${day}`;
            // let endDate = `${publicHoliday.ph_to_year}-${endMonth}-${
            //   endDay + 1
            // }`;
            entryObj = {
              id: this.entryCount++,
              start: startDate,
              end: startDate,
              display: "block",
              backgroundColor: "red",
              title: `${publicHoliday.ph_name} Public Holiday`,
            };
            calendarApi.addEvent(entryObj);
          });
          data.forEach((entry) => {
            let month, day;
            entry.ts_month.length === 1
              ? (month = `0${entry.ts_month}`)
              : (month = entry.ts_month);
            entry.ts_day.length === 1
              ? (day = `0${entry.ts_day}`)
              : (day = entry.ts_day);
            const date = `${entry.ts_year}-${month}-${day}`;
            entryObj = {
              id: this.entryCount++,
              start: date,
              end: date,
              display: "background",
            };
            switch (entry.ts_is_present) {
              case 0: // employee absent
                entryObj.title = `ABSENT`;
                entryObj.display = "block";
                calendarApi.addEvent(entryObj);
                break;
              case 4: // employee leave
                entryObj.title = `LEAVE`;
                entryObj.display = "block";
                calendarApi.addEvent(entryObj);
                break;
              case 1: // employee present
                entryObj.title = `${this.tConvert(
                  entry.ts_start
                )} - ${this.tConvert(entry.ts_end)} for ${
                  entry.ts_duration
                } hrs`;
                calendarApi.addEvent(entryObj);
                break;
              default:
                // do nothing on public holidays and weekends
                break;
            }
          });
        }
      });
      this.fetching = false;
    },
    populateTimesheetData() {
      this.populateOption = true;
    },
    cancelPopulate() {
      this.populateOption = false;
    },
    runTimesheetPopulate() {
      this.populating = true;
      const employeeID = this.getEmployee.emp_id;
      const dateParts = this.pymFullDate.split("-");
      const year = dateParts[0];
      const month = dateParts[1];
      const url = `${this.ROUTES.timesheet}/preload-date/${employeeID}/${month}/${year}`;
      this.apiGet(url, "Populate Timesheet Error")
        .then((res) => {
          if (res.data) {
            this.apiResponseHandler(`${res.data}`, "Timesheet Population Done");
            this.fetchTimesheetData();
          }
        })
        .finally(() => {
          this.populating = false;
          this.populateOption = false;
        });
    },
    async dateClicked(info) {
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
    },
    fillTSE(dateInfo) {
      this.$router.push({
        name: "timesheet-entry",
        params: { date: dateInfo.dateStr },
      });
    },
    viewTimesheets() {
      // const payrollMY = `${this.pymYear}-${this.pymMonth}`;
      this.$router.push({
        name: "timesheets",
      });
    },
    viewTimesheet() {
      const { payrollMY } = this.$route.params;
      // const payrollMY = `${this.pymYear}-${this.pymMonth}`;
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
<style>
/*.fc-event-title {*/
/*  color: blue;*/
/*}*/
.fc .fc-bg-event .fc-event-title {
  font-size: 1.5em;
  color: black;
  padding-top: 2em;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div v-if="timeAllocated" class="alert alert-info">
      Your timesheet for this payroll reporting period is now filled and
      pending.
      <span
        style="cursor: pointer; text-decoration: underline"
        @click="viewTimesheet"
      >
        View and make updates here.
      </span>
    </div>
    <div v-if="timesheetApproved" class="alert alert-success">
      Your timesheet for this payroll reporting period has been approved.
      <span
        style="cursor: pointer; text-decoration: underline"
        @click="viewTimesheet"
      >
        View it here.
      </span>
    </div>
    <div v-else>
      <scale-loader class="scale-loader" v-if="this.apiBusy" />
      <div v-else>
        <div class="d-flex justify-content-end mb-3">
          <b-button
            class="btn btn-success"
            @click="$router.push('/timesheets')"
          >
            <i class="mdi mdi-plus mr-2"></i>
            View Timesheets
          </b-button>
        </div>
        <div>
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <span v-if="populating">Populating... please wait.</span>
                  <div class="app-calendar">
                    <FullCalendar
                      ref="fullCalendar"
                      :options="calendarOptions"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-lg-4">
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
                      <span>
                        {{ (parseInt(pymMonth) - 1) | getMonth }}
                      </span>
                      <span>{{ pymYear }}</span>
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
                    <p>{{ getEmployee.sector.d_t3_code }}</p>
                  </div>
                  <div class="d-flex justify-content-between">
                    <p>Nationality</p>
                    <p>Non-US</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-8">
              <div class="card">
                <div class="card-body">
                  <div class="p-3 bg-light mb-4">
                    <h5 class="font-size-14 mb-0">Time Allocation</h5>
                  </div>
                  <TimeEffortForm
                    :pmy-month="pymMonth"
                    :pmy-year="pymYear"
                    :ts-ref-no="refNo"
                    @added-ta="viewTimesheets"
                  />
                </div>
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
    <b-modal
      v-model="populateOption"
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
        <h5 class="mt-n3 text-success">Notice</h5>
      </div>
      <div class="alert alert-success mt-3">
        You are about to auto-populate your timesheet for the payroll reporting
        period
        <strong>
          {{ (parseInt(pymMonth) - 1) | getMonth }} {{ pymYear }}.
        </strong>
        This process will overwrite any manual changes.
        <br />
        Please note, you can modify each day's timesheet entry later before
        submission.
      </div>
      <scale-loader v-if="populating" />
      <b-row v-else>
        <b-col lg="6">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="cancelPopulate"
          >
            <i class="dripicons-wrong" style="font-size: 2em"></i>
            <span>Cancel Auto-Populate</span>
          </a>
        </b-col>
        <b-col lg="6" class="mt-lg-0 mt-3">
          <a
            href="javascript: void(0);"
            class="dropdown-icon-item"
            @click="runTimesheetPopulate"
          >
            <i class="dripicons-checkmark" style="font-size: 2em"></i>
            <span>Run Auto-Populate</span>
          </a>
        </b-col>
      </b-row>
    </b-modal>
  </Layout>
</template>
