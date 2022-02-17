<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import { authComputed } from "@/state/helpers";

// import Stat from "./widget";
// import RevenueAnalytics from "./revenue";
// import SalesAnalytics from "./sales-analytics";
// import EarningReport from "./earning";
// import Sources from "./sources";
// import RecentActivity from "./recent-activity";
// import RevenueLocation from "./revenue-location";
// import Chat from "./chat";
// import Transaction from "./transaction";

/**
 * Dashboard component
 */
export default {
  components: {
    Layout,
    PageHeader,
    // Stat,
    // RevenueAnalytics,
    // SalesAnalytics,
    // EarningReport,
    // Sources,
    // RecentActivity,
    // RevenueLocation,
    // Chat,
    // Transaction,
  },
  computed: {
    ...authComputed,
  },
  data() {
    return {
      title: "Dashboard",
      items: [
        {
          text: "IHUMANE",
        },
        {
          text: "Dashboard",
          active: true,
        },
      ],
    };
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div v-if="panel === 'admin'" class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <img
                style="width: 30%"
                :src="require('@/assets/images/irc-logo.png')"
                class="mr-4"
              />
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mt-3 mb-2">
                  Welcome back,
                </p>
                <h4 class="mb-0 text-capitalize">
                  {{ this.getEmployee.emp_first_name }}
                  {{ this.getEmployee.emp_last_name }}
                </h4>
                <p class="text-muted mb-1">
                  {{ this.getEmployee.emp_unique_id }}
                </p>
                <p class="text-muted mb-0">
                  {{ new Date().toUTCString() }}
                </p>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-2">
            <div class="text-success d-inline-flex">
              <a
                href="https://www.rescue.org/country/nigeria"
                class="d-flex align-items-center"
                target="_blank"
              >
                International Rescue Committee
                <i class="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Users</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Employees</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Leave Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Travel Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Timesheets Filled</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Self Assessments Done</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="row">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <div class="media">
              <img
                style="width: 30%"
                :src="require('@/assets/images/irc-logo.png')"
                class="mr-4"
              />
              <div class="media-body overflow-hidden">
                <p class="text-truncate font-size-14 mt-3 mb-2">
                  Welcome back,
                </p>
                <h4 class="mb-0 text-capitalize">
                  {{ this.getEmployee.emp_first_name }}
                  {{ this.getEmployee.emp_last_name }}
                </h4>
                <p class="text-muted mb-1">
                  {{ this.getEmployee.emp_unique_id }}
                </p>
                <p class="text-muted mb-0">
                  {{ new Date().toUTCString() }}
                </p>
              </div>
            </div>
          </div>
          <div class="card-body border-top py-2">
            <div class="text-success d-inline-flex">
              <a
                href="https://www.rescue.org/country/nigeria"
                class="d-flex align-items-center"
                target="_blank"
              >
                International Rescue Committee
                <i class="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Pending</p>
                    <h5 class="mb-0">Leave Applications</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Pending</p>
                    <h5 class="mb-0">Travel Requests</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Pending</p>
                    <h5 class="mb-0">Timesheets Filled</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Employees to Assess</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Travel Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Leave Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body">
                <div class="media">
                  <div class="media-body overflow-hidden">
                    <p class="text-truncate font-size-14 mb-2">0 Total</p>
                    <h5 class="mb-0">Timesheet Authorizations</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
