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
import Swal from "sweetalert2";
import { authComputed } from "@/state/helpers";
import TimeEffortForm from "./components/time-effort-form";

export default {
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
        eventClick: this.editEvent,
        eventsSet: this.handleEvents,
        weekends: false,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
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
      fetching: false,
      populateOption: false,
      entryCount: 0,
      populating: false,
    };
  },
  methods: {
    fetchPayrollMonthYear() {
      this.fetching = true;
      this.apiGet(this.ROUTES.payrollMonthYear).then((res) => {
        if (res.data) {
          const { pym_year, pym_month } = res.data;
          this.pymYear = pym_year;
          this.pymMonth = pym_month;
          this.calendarOptions.initialDate = `${pym_year}-${pym_month}-01`;
          this.fetchTimesheetData();
        }
      });
    },
    fetchTimesheetData() {
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timesheet}/get-time-sheets/${employeeID}`;
      this.apiGet(url, "Get Timesheet Error").then((res) => {
        const { data } = res;
        if (!data.length) {
          this.populateTimesheetData();
        } else {
          data.forEach((entry) => {
            console.log({ entry });
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
    populateTimesheetData() {
      this.populateOption = true;
    },
    cancelPopulate() {
      this.populateOption = false;
    },
    runTimesheetPopulate() {
      this.populating = true;
      const employeeID = this.getEmployee.emp_id;
      const url = `${this.ROUTES.timesheet}/preload-date/${employeeID}`;
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
    /**
     * Modal form submit
     */
    // eslint-disable-next-line no-unused-vars
    handleSubmit(e) {
      this.submitted = true;

      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        const title = this.event.title;
        const category = this.event.category;
        let calendarApi = this.newEventData.view.calendar;

        this.currentEvents = calendarApi.addEvent({
          id: this.newEventData.length + 1,
          title,
          start: this.newEventData.date,
          end: this.newEventData.date,
          classNames: [category],
        });
        this.successmsg();
        this.showModal = false;
        this.newEventData = {};
      }
      this.submitted = false;
      this.event = {};
    },
    // eslint-disable-next-line no-unused-vars
    hideModal(e) {
      this.submitted = false;
      this.showModal = false;
      this.event = {};
    },
    /**
     * Edit event modal submit
     */
    // eslint-disable-next-line no-unused-vars
    editSubmit(e) {
      this.submit = true;
      const editTitle = this.editevent.editTitle;
      const editcategory = this.editevent.editcategory;

      this.edit.setProp("title", editTitle);
      this.edit.setProp("classNames", editcategory);
      this.successmsg();
      this.eventModal = false;
    },

    /**
     * Delete event
     */
    deleteEvent() {
      this.edit.remove();
      this.eventModal = false;
    },
    /**
     * Modal open for add event
     */
    dateClicked(info) {
      this.newEventData = info;
      this.dateInfo = info;
      const { date } = info;
      const chosenDateMonth = date.getMonth;
      const chosenDateYear = date.getFullYear;
      console.log({ chosenDateMonth, chosenDateYear });
      this.showModal = true;
    },
    /**
     * Modal open for edit event
     */
    editEvent(info) {
      this.edit = info.event;
      this.editevent.editTitle = this.edit.title;
      this.editevent.editcategory = this.edit.classNames[0];
      this.eventModal = true;
    },

    closeModal() {
      this.eventModal = false;
    },

    confirm() {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to delete this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.value) {
          this.deleteEvent();
          Swal.fire("Deleted!", "Event has been deleted.", "success");
        }
      });
    },

    /**
     * Show list of events
     */
    handleEvents(events) {
      this.currentEvents = events;
    },

    /**
     * Show successfull Save Dialog
     */
    successmsg() {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Event has been saved",
        showConfirmButton: false,
        timer: 1000,
      });
    },
    fillTSE(dateInfo) {
      this.$router.push({
        name: "timesheet-entry",
        params: { date: dateInfo.dateStr },
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="d-flex justify-content-end mb-3">
      <b-button class="btn btn-success" @click="populateTimesheetData">
        <i class="mdi mdi-plus mr-2"></i>
        Populate Timesheet
      </b-button>
    </div>
    <scale-loader class="scale-loader" v-if="this.apiBusy || this.fetching" />
    <div v-else class="row">
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
              <p>-</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Location (T5)</p>
              <p>-</p>
            </div>
            <div class="d-flex justify-content-between">
              <p>Site Code (T6)</p>
              <p>-</p>
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
            <TimeEffortForm />
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
