<script>
    import Layout from "@/views/layouts/main";
    import PageHeader from "@/components/page-header";
    import appConfig from "@/app.config";
    import { authComputed } from "@/state/helpers";
    export default {
        page: {
            title: "Time Sheet Details",
            meta: [{ name: "description", content: appConfig.description }],
        },
        computed: {
            ...authComputed,
        },
        components: {
            Layout,
            PageHeader,
        },
        mounted() {
            this.fetchRequest();
        },
        props: ["employee"],
        methods: {
            fetchRequest() {

                let month = this.$route.params.month;
                let year = this.$route.params.year;
                const url = `${this.ROUTES.timesheet}/${month}/${year}`;

                this.apiGet(url, "Get Time sheet details").then((res) => {
                    this.isApiBusy = true;
                    //console.log( { res });
                    const { timesheet, timeAllocation, log } = res.data;
                    this.timeSheet = timesheet;
                    this.allocation = timeAllocation;
                    this.log = log;
                    this.ref_no = this.allocation.ta_ref_no;
                    this.ta_status = this.allocation.ta_status;
                    for (let i = 0; i < this.log.length; i++) {
                        if (this.log[i].auth_officer_id === this.getEmployee.emp_id) {
                            this.my_status = this.log[i].auth_status;
                        }
                    }
                    this.isApiBusy = false;
                });
            },
            authorizationHandler(val) {
                if (this.comment === null) {
                    alert("Leave a comment");
                } else {
                    const url = `${this.ROUTES.appAuthorization}`;
                    const data = {
                        appId: `${this.ref_no}`,
                        status: val,
                        officer: this.getEmployee.emp_id,
                        type: 2,
                        comment: this.comment,
                        markAsFinal: this.final,
                        nextOfficer: this.nextOfficer,
                    };
                    this.apiPost(url, data, "Authorization Error")
                        .then((res) => {
                            this.apiResponseHandler(`${res.data}`, "Authorization action");
                            this.fetchRequest();
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    //alert("Comment: "+this.comment+" val: "+val);
                }
            },
        },
        data() {
            return {
                title: "Time Sheet Details",
                isApiBusy: false,
                items: [
                    {
                        text: "IHUMANE",
                    },
                    {
                        text: "Dashboard",
                        href: "/",
                    },
                    {
                        text: "Time Sheet Details",
                        active: true,
                    },
                ],
                application: null,
                timeSheet: [],
                allocation: [],
                log: [],
                my_status: null,
                donor: null,
                t2Codes: [],
                final: 1,
                official: null,
                comment: null,
                allocationId: null,
                ref_no: null,
                ta_status: null,
                officials: [
                    {
                        value: null,
                        text: "Please choose the next reviewer",
                        disabled: "true",
                    },
                ],
            };
        },
    };
</script>


<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <div class="d-flex justify-content-end mb-3">
            <b-button
                    class="btn btn-secondary"
                    @click="$router.push({ name: 'manage-time-sheets' })"
            >
                <i class="mdi mdi-step-backward mr-2"></i>
                Go Back
            </b-button>
        </div>
        <scale-loader v-if="apiBusy" />
        <div class="row" v-else>
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-body">
                        <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                            <div class="d-inline mb-0">
                                <h5>Time Sheet</h5>
                            </div>
                            <small
                                    v-if="this.ta_status === 1"
                                    class="text-success float-right"
                            >
                                Approved
                            </small>
                            <small
                                    v-else-if="this.ta_status === 2"
                                    class="text-danger float-right"
                            >
                                Discarded
                            </small>
                            <small v-else class="text-warning float-right"> Pending </small>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="table-responsive">
                                    <table class="table mb-0">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Start</th>
                                            <th>End</th>
                                            <th>Duration</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr
                                                class="table-light"
                                                v-for="(ts, index) in this.timeSheet"
                                                :key="index"
                                        >
                                            <th scope="row">{{ index + 1 }}</th>
                                            <td>{{ ts.ts_start }}</td>
                                            <td>{{ ts.ts_end }}</td>
                                            <td>{{ ts.ts_duration }}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                            <div class="d-inline mb-0">
                                <h5>Authorization Log</h5>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="table-responsive">
                                    <table class="table mb-0">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Officer</th>
                                            <th>Status</th>
                                            <th>Comment</th>
                                            <th>Date</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr
                                                class="table-light"
                                                v-for="(off, ind) in this.log"
                                                :key="ind"
                                        >
                                            <th scope="row">{{ ind + 1 }}</th>
                                            <td>
                                                {{
                                                off.officers.emp_first_name
                                                ? off.officers.emp_first_name
                                                : ""
                                                }}
                                                {{
                                                off.officers.emp_last_name
                                                ? off.officers.emp_last_name
                                                : ""
                                                }}
                                            </td>
                                            <td>
                                                <small
                                                        v-if="off.auth_status === 1"
                                                        class="text-success"
                                                >
                                                    Approved
                                                </small>
                                                <small
                                                        v-else-if="off.auth_status === 2"
                                                        class="text-danger"
                                                >
                                                    Discarded
                                                </small>
                                                <small v-else class="text-warning"> Pending </small>
                                            </td>
                                            <td>{{ off.auth_comment }}</td>
                                            <td>{{ off.updatedAt }}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <div class="p-3 bg-light mb-4 d-flex justify-content-between">
                            <div class="d-inline mb-0">
                                <h5 class="font-size-14 mb-0">Employee Details</h5>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>Employee Name</span>
                            <span>
                {{ this.allocation.Employee.emp_first_name }}
                {{ this.allocation.Employee.emp_last_name }}
              </span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>T7 Number</span>
                            <span>
                {{ this.allocation.Employee.emp_unique_id }}
              </span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>T3 Code</span>
                            <span> - </span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>T6 Code</span>
                            <span> - </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</template>
