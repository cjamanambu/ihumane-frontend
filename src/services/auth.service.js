import { authMethods, authComputed, layoutMethods } from "@/state/helpers";

export default {
  computed: {
    ...authComputed,
  },
  methods: {
    ...authMethods,
    ...layoutMethods,
    login(username, password) {
      return new Promise((resolve, reject) => {
        this.logIn({ username, password })
          .then(async () => {
            const { user_type, permission } = this.getUser;
            this.setPermissions({ permissions: permission });
            if (user_type === 2 || user_type === 3)
              await this.setEmployeeStatus();
            resolve(user_type);
          })
          .catch((err) => {
            this.apiErrorHandler(err, "Login Error");
            reject(err);
          });
      });
    },
    unlock(username, password) {
      return new Promise((resolve) => {
        this.unlockScreen({ username, password })
          .then(() => resolve(true))
          .catch((err) => {
            this.apiErrorHandler(err, "Unlock Screen Error");
          });
      });
    },
    async setEmployeeStatus() {
      const { emp_location_id, emp_id, emp_supervisor_status } =
        this.getEmployee;
      if (emp_supervisor_status === 1) {
        this.setIsSupervisor({ isSupervisor: true });
      } else {
        const isFocalPoint = await this.checkEmployeeFocalPoint(
          emp_id,
          emp_location_id
        );
        if (isFocalPoint) {
          this.setIsFocalPoint({ isFocalPoint: true });
        } else {
          this.setIsSupervisor({ isSupervisor: false });
          this.setIsFocalPoint({ isFocalPoint: false });
        }
      }
    },
    async checkEmployeeFocalPoint(employeeId, locationId) {
      const url = `${this.ROUTES.hrFocalPoint}/${locationId}`;
      this.focalPoints = [];
      await this.apiGet(url, "Get Focal Points Error").then((res) => {
        const { data } = res;
        if (data) {
          data.forEach((focalPoint) => {
            this.focalPoints.push(focalPoint.focal_person.emp_id);
          });
        }
      });
      return this.focalPoints.includes(employeeId);
    },
  },
};
// 0: "MANAGE_USER"

// 1: "HR_CONFIG"
// 2: "PAYROLL_CONFIG"
// 3: "PAYMENT_DEFINITION"
// 12: "SELF_ASSESSMENT"

// 4: "ONBOARD_EMPLOYEE"
// 5: "MANAGE_EMPLOYEE"
// 6: "ASSIGN_SUPERVISORS"

// 7: "ANNOUNCEMENT"
// 8: "QUERY"

// 9: "LEAVE"
// 10: "TRAVEL"
// 11: "TIMESHEET"
// 13: "LEAVE_MANAGEMENT"

// 14: "SETUP_VARIATIONS"
// 15: "CONFIRM_VARIATIONS"
// 16: "APPROVE_VARIATIONS"
// 17: "DECLINE_VARIATIONS"

// 18: "RUN_PAYROLL"
// 19: "UNDO_PAYROLL"
// 20: "CONFIRM_PAYROLL"
// 21: "APPROVE_PAYROLL"
