<script>
import simplebar from "simplebar-vue";
import i18n from "../i18n";
import { authComputed } from "@/state/helpers";

export default {
  computed: {
    ...authComputed,
  },
  data() {
    return {
      languages: [
        {
          flag: require("@/assets/images/flags/us.jpg"),
          language: "en",
          title: "English",
        },
        {
          flag: require("@/assets/images/flags/french.jpg"),
          language: "fr",
          title: "French",
        },
        {
          flag: require("@/assets/images/flags/spain.jpg"),
          language: "es",
          title: "spanish",
        },
        {
          flag: require("@/assets/images/flags/chaina.png"),
          language: "zh",
          title: "Chinese",
        },
        {
          flag: require("@/assets/images/flags/arabic.png"),
          language: "ar",
          title: "Arabic",
        },
      ],
      current_language: "en",
    };
  },
  components: { simplebar },
  methods: {
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */ !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    getEmployeeNotifications(){
      let employeeID = this.getEmployee.emp_id

      const url = `${this.ROUTES.notifications}/${employeeID}`;
      this.apiGet(url, "Get Notifications Error").then((res) => {
        const { data } = res;
        console.log({ data });
        data.forEach((notification) => {
          this.notifications.push(notification);
        });
      });
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    setLanguage(locale) {
      i18n.locale = locale;
      this.current_language = i18n.locale;
    },
    switchPanel() {
      this.changeLayoutType({ layoutType: "horizontal" });
      this.changeTopbar({ topbar: "light" });
      this.setPanel({ panel: "self-service" });
      this.$router
        .push({ name: "home" })
        .then(() =>
          this.apiResponseHandler(
            "Welcome back to your self-service panel",
            `Welcome Back, ${this.getUser.user_username}`
          )
        );
    },
  },

 /* getUserType(){
    if(user == 2 || user == 3){
      this.getEmployeeNotifications();
    }
  }*/
  mounted() {
    if( parseInt(this.getUser.user_type) === 2 || parseInt(this.getUser.user_type) === 3){
      this.notifications = this.getNotifications;
      this.getEmployeeNotifications();

    }
  },
};
</script>

<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <a href="javascript:void(0)" class="logo logo-dark">
            <span class="logo-sm">
              <img
                :src="require('@/assets/images/ihumane-green-short.svg')"
                alt
                height="22"
              />
            </span>
            <span class="logo-lg">
              <img
                :src="require('@/assets/images/ihumane-green-long.svg')"
                alt
                height="20"
              />
            </span>
          </a>

          <a
            href="javascript:void(0)"
            class="logo logo-light"
            @click="$router.push('/')"
          >
            <span class="logo-sm">
              <img
                :src="require('@/assets/images/ihumane-white-short.svg')"
                alt
                height="22"
              />
            </span>
            <span class="logo-lg">
              <img
                :src="require('@/assets/images/ihumane-white-long.svg')"
                alt
                height="20"
              />
            </span>
          </a>
        </div>

        <button
          @click="toggleMenu"
          type="button"
          class="btn btn-sm px-3 font-size-24 header-item waves-effect"
          id="vertical-menu-btn"
        >
          <i class="ri-menu-2-line align-middle"></i>
        </button>
      </div>

      <div class="d-flex">
        <div class="dropdown d-none d-lg-inline-block ml-1">
          <button
            type="button"
            class="btn header-item noti-icon waves-effect"
            @click="initFullScreen"
          >
            <i class="ri-fullscreen-line"></i>
          </button>
        </div>

        <b-dropdown
          right
          menu-class="dropdown-menu-lg p-0"
          toggle-class="header-item noti-icon"
          variant="black"
        >
          <template v-slot:button-content>
            <i class="ri-notification-3-line"></i>
            <span class="noti-dot"></span>
          </template>
          <div class="p-3">
            <div class="row align-items-center">
              <div class="col">
                <h6 class="m-0">
                  {{ $t("navbar.dropdown.notification.text") }}
                </h6>
              </div>
              <div class="col-auto">
                <a href="#!" class="small">{{
                  $t("navbar.dropdown.notification.subtext")
                }}</a>
              </div>
            </div>
          </div>
          <simplebar style="max-height: 230px">

            <a href class="text-reset notification-item" v-for="notify in notifications" :key="notify.n_id">
              <div class="media">
                <div class="avatar-xs mr-3">
                  <span
                    class="avatar-title bg-primary rounded-circle font-size-16"
                  >
                    <i class="ri-bell-fill"></i>
                  </span>
                </div>
                <div class="media-body">
                  <h6 class="mt-0 mb-1">
                    {{ notify.n_subject }}
                  </h6>
                  <div class="font-size-12 text-muted">
                    <p class="mb-1">
                      {{ notify.n_body }}
                    </p>
                    <p class="mb-0">
                      <i class="mdi mdi-clock-outline"></i>
                      {{ new Date(notify.createdAt).toDateString() }}
                    </p>
                  </div>
                </div>
              </div>
            </a>


          </simplebar>
          <div class="p-2 border-top">
            <a
              class="btn btn-sm btn-link font-size-14 btn-block text-center"
              href="javascript:void(0)"
            >
              <i class="mdi mdi-arrow-right-circle mr-1"></i>
              {{ $t("navbar.dropdown.notification.button") }}
            </a>
          </div>
        </b-dropdown>

        <b-dropdown
          right
          variant="black"
          toggle-class="header-item"
          class="d-inline-block user-dropdown"
        >
          <template v-slot:button-content>
            <img
              class="rounded-circle header-profile-user"
              src="@/assets/images/users/avatar-svgrepo-com.svg"
              alt="Header Avatar"
            />
            <span class="d-none d-xl-inline-block ml-1 font-weight-bolder">
              {{ getUser.user_username }}
            </span>
            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
          </template>
          <!-- item-->
          <a class="dropdown-item" href="#">
            <i class="ri-user-line align-middle mr-1"></i>
            {{ $t("navbar.dropdown.kevin.list.profile") }}
          </a>
          <a
            v-if="getUser.user_type === 3"
            class="dropdown-item"
            href="javascript:void(0)"
            @click="switchPanel"
          >
            <i class="ri-arrow-right-fill align-middle mr-1"></i>
            Go to Self-Service
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="/logout">
            <i class="ri-shut-down-line align-middle mr-1 text-danger"></i>
            {{ $t("navbar.dropdown.kevin.list.logout") }}
          </a>
        </b-dropdown>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.notify-item {
  .active {
    color: #16181b;
    background-color: #f8f9fa;
  }
}
</style>
