import { mapState, mapGetters, mapActions } from "vuex";

export const authComputed = {
  ...mapState("auth", {
    currentUser: (state) => state.currentUser,
    userData: (state) => state.userData,
  }),
  ...mapGetters("auth", ["loggedIn", "loading", "getUser"]),
};

export const layoutComputed = {
  ...mapState("layout", {
    layoutType: (state) => state.layoutType,
    leftSidebarType: (state) => state.leftSidebarType,
    layoutWidth: (state) => state.layoutWidth,
    topbar: (state) => state.topbar,
    loader: (state) => state.loader,
  }),
};

export const authMethods = mapActions("auth", [
  "logIn",
  "logOut",
  "resetPassword",
]);

export const layoutMethods = mapActions("layout", [
  "changeLayoutType",
  "changeLayoutWidth",
  "changeLeftSidebarType",
  "changeTopbar",
  "changeLoaderValue",
]);

export const authHeader = () => {
  let token = localStorage.getItem("token");
  if (token) {
    return { "x-auth-token": token };
  }
};
