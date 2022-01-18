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

export default {
  page: {
    title: "TimeSheet",
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
          left: "",
          center: "title",
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
        editable: true,
        droppable: true,
        eventResizableFromStart: true,
        dateClick: this.dateClicked,
        eventClick: this.editEvent,
        eventsSet: this.handleEvents,
        weekends: true,
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
      extraFields: 0,
    };
  },
  methods: {
    fetchPayrollMonthYear() {
      this.apiGet(this.ROUTES.payrollMonthYear).then((res) => {
        if (res.data) {
          const { pym_year, pym_month } = res.data;
          this.pymYear = pym_year;
          this.pymMonth = pym_month;
          this.calendarOptions.initialDate = `${pym_year}-${pym_month}-01`;
        }
      });
    },
    addField() {
      this.extraFields++;
    },
    delField() {
      this.extraFields--;
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
    <scale-loader class="scale-loader" v-if="this.apiBusy" />
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
              <h5 class="font-size-14 mb-0">Time & Effort Report</h5>
            </div>
            <form @submit.prevent>
              <div class="row" v-for="index in extraFields" :key="index">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="grant">
                      Grant Code (T1) <span class="text-danger">*</span>
                    </label>
                    <input id="grant" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label>
                      % to Charge (T1) <span class="text-danger">*</span>
                    </label>
                    <b-form-spinbutton id="charge" min="1" max="100" />
                  </div>
                </div>
                <div class="col-lg-2">
                  <div class="form-group">
                    <label for="" style="visibility: hidden">hidden</label>
                    <button class="btn btn-danger" @click="delField">
                      del
                    </button>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="grant">
                      Grant Code (T1) <span class="text-danger">*</span>
                    </label>
                    <input id="grant" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="form-group">
                    <label>
                      % to Charge (T1) <span class="text-danger">*</span>
                    </label>
                    <b-form-spinbutton id="charge" min="1" max="100" />
                  </div>
                </div>
                <div class="col-lg-2">
                  <div class="form-group">
                    <label for="" style="visibility: hidden">hidden</label>
                    <button class="btn btn-success" @click="addField">
                      add
                    </button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <b-button
                  v-if="!submitting"
                  class="btn btn-success btn-block mt-4"
                  type="submit"
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
  </Layout>
</template>
