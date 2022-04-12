-pl
<script>
import simplebar from "simplebar-vue";
import i18n from "../i18n";
import { layoutComputed, authComputed } from "@/state/helpers";

export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...layoutComputed,
    ...authComputed,
  },
  components: { simplebar },
  mounted() {
    this.value = this.languages.find((x) => x.language === i18n.locale);
    this.text = this.value.title;
    this.flag = this.value.flag;

    this.notifications = this.getNotifications;
    this.getEmployeeNotifications();
  },
  data() {
    return {
      notifications:[],
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
  methods: {
    getEmployeeNotifications(){
      let employeeID = this.getEmployee.emp_id
      const url = `${this.ROUTES.notifications}/${employeeID}`;
      this.apiGet(url, "Get Notifications Error").then((res) => {
        const { data } = res;
        //console.log({ data });
        data.forEach((notification) => {
          this.notifications.push(notification);
        });
      });
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
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    toggleMenu() {
      let element = document.getElementById("topnav-menu-content");
      element.classList.toggle("show");
    },
    setLanguage(locale) {
      i18n.locale = locale;
      this.current_language = i18n.locale;
    },
    switchPanel() {
      this.changeLayoutType({ layoutType: "vertical" });
      this.changeTopbar({ topbar: "dark" });
      this.setPanel({ panel: "admin" });
      this.$router
        .push({ name: "home" })
        .then(() =>
          this.apiResponseHandler(
            "Welcome back to your admin panel",
            `Welcome Back, ${this.getUser.user_username}`
          )
        );
    },
  },

  watch: {
    type: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-topbar", "dark");
              break;
            case "light":
              document.body.setAttribute("data-topbar", "light");
              document.body.removeAttribute("data-layout-size", "boxed");
              break;
            case "colored":
              document.body.setAttribute("data-topbar", "colored");
              document.body.removeAttribute("data-layout-size", "boxed");
              break;
            default:
              document.body.setAttribute("data-topbar", "dark");
              break;
          }
        }
      },
    },
    width: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "boxed":
              document.body.setAttribute("data-layout-size", "boxed");
              break;
            case "fluid":
              document.body.setAttribute("data-layout-mode", "fluid");
              document.body.removeAttribute("data-layout-size");
              break;
            default:
              document.body.setAttribute("data-layout-mode", "fluid");
              break;
          }
        }
      },
    },
  },
};
</script>

<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <a
            href="javascript:void(0)"
            class="logo logo-dark"
            @click="$router.push('/')"
          >
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
          type="button"
          class="btn btn-sm px-3 font-size-24 d-lg-none header-item"
          data-toggle="collapse"
          @click="toggleMenu"
        >
          <i class="ri-menu-2-line align-middle"></i>
        </button>

        <!-- App Search-->
        <!--        <form class="app-search d-none d-lg-block">-->
        <!--          <div class="position-relative">-->
        <!--            <input-->
        <!--              type="text"-->
        <!--              class="form-control"-->
        <!--              :placeholder="$t('navbar.search.text')"-->
        <!--            />-->
        <!--            <span class="ri-search-line"></span>-->
        <!--          </div>-->
        <!--        </form>-->
      </div>

      <div class="d-flex">
        <div class="dropdown d-none d-lg-inline-block ml-1">
          <button
            type="button"
            class="btn header-item noti-icon waves-effect"
            data-toggle="fullscreen"
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
              :src="getEmployee.emp_passport"
              alt="Header Avatar"
            />
            <span class="d-none d-xl-inline-block ml-1">
              {{ getUser.user_username }}
            </span>
            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
          </template>
          <!-- item-->
          <a
            class="dropdown-item"
            href="javascript:void(0)"
            @click="$router.push({ name: 'profile' })"
          >
            <i class="ri-user-line align-middle mr-1"></i>
            {{ $t("navbar.dropdown.kevin.list.profile") }}
          </a>
          <a
            class="dropdown-item"
            href="javascript:void(0)"
            @click="$router.push({ name: 'change-password' })"
          >
            <i class="ri-lock-line align-middle mr-1"></i>
            Change Password
          </a>
          <a
            v-if="getUser.user_type === 3"
            class="dropdown-item"
            href="javascript:void(0)"
            @click="switchPanel"
          >
            <i class="ri-arrow-left-fill align-middle mr-1"></i>
            Go to Admin
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
