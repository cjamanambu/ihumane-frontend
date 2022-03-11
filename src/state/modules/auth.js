import { ROUTES, SET_TOKEN, API } from "@/api";

export const state = {
  currentUser: sessionStorage.getItem("authUser"),
  loading: false,
  token: null,
  loggedIn: false,
  userData: {},
  employee: {},
  locked: false,
  panel: "admin",
};

export const mutations = {
  SET_CURRENT_USER(state, newValue) {
    state.currentUser = newValue;
    saveState("auth.currentUser", newValue);
  },
  TOGGLE_LOADING(state) {
    state.loading = !state.loading;
  },
  SET_TOKEN(state, token) {
    state.token = token;
    SET_TOKEN(token);
  },
  TOGGLE_LOGGED_IN(state) {
    state.loggedIn = !state.loggedIn;
  },
  SET_USER_DATA(state, userData) {
    state.userData = userData;
  },
  SET_EMPLOYEE(state, employee) {
    state.employee = employee;
  },
  TOGGLE_LOCKED(state) {
    state.locked = !state.locked;
  },
  SET_PANEL(state, panel) {
    state.panel = panel;
  },
};

export const getters = {
  // Whether the user is currently logged in.
  loggedIn(state) {
    return state.loggedIn;
  },
  loading(state) {
    return state.loading;
  },
  getUser(state) {
    return state.userData;
  },
  getEmployee(state) {
    return state.employee;
  },
  locked(state) {
    return state.locked;
  },
  panel(state) {
    return state.panel;
  },
};

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  // eslint-disable-next-line no-unused-vars
  init({ state, dispatch }) {
    dispatch("validate");
  },

  // Logs in the current user.
  // logIn({ commit, dispatch, getters }, { email, password } = {}) {
  //
  // return getFirebaseBackend().loginUser(email, password).then((response) => {
  //     const user = response
  //     commit('SET_CURRENT_USER', user)
  //     return user
  // });
  // authService.login(username, password)
  // },
  // eslint-disable-next-line no-unused-vars
  logIn({ commit }, { username, password } = {}) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      commit("TOGGLE_LOADING");
      const url = `${ROUTES.user}/login`;
      const data = {
        user_username: username,
        user_password: password,
      };
      API.post(url, data)
        .then((res) => {
          const { userData, token, employee } = res.data;
          commit("SET_TOKEN", token);
          commit("SET_USER_DATA", userData);
          commit("SET_EMPLOYEE", employee);
          commit("TOGGLE_LOGGED_IN");
          resolve(res);
        })
        .catch((err) => reject(err))
        .finally(() => commit("TOGGLE_LOADING"));
    });
  },
  unlockScreen({ commit }, { username, password } = {}) {
    return new Promise((resolve, reject) => {
      commit("TOGGLE_LOADING");
      const url = `${ROUTES.user}/login`;
      const data = {
        user_username: username,
        user_password: password,
      };
      API.post(url, data)
        .then((res) => {
          const { userData, token, employee } = res.data;
          commit("SET_TOKEN", token);
          commit("SET_USER_DATA", userData);
          commit("SET_EMPLOYEE", employee);
          commit("TOGGLE_LOCKED");
          resolve(res);
        })
        .catch((err) => reject(err))
        .finally(() => commit("TOGGLE_LOADING"));
    });
  },
  toggleLockedScreen({ commit }) {
    commit("TOGGLE_LOCKED");
  },
  setPanel({ commit }, { panel }) {
    commit("SET_PANEL", panel);
  },
  setEmployee({ commit }, { employee }) {
    commit("SET_EMPLOYEE", employee);
  },

  // Logs out the current user.
  logOut({ commit }) {
    return new Promise(() => {
      commit("SET_TOKEN", null);
      commit("TOGGLE_LOGGED_IN");
      localStorage.clear();
    });
  },

  // resetPassword
  // eslint-disable-next-line no-unused-vars
  resetPassword({ commit, dispatch, getters }, { email } = {}) {
    // if (getters.loggedIn) return dispatch('validate')
    //
    // return getFirebaseBackend().forgetPassword(email).then((response) => {
    //     const message = response.data
    //     return message
    // });
  },

  // Validates the current user's token and refreshes it
  // with new data from the API.
  // eslint-disable-next-line no-unused-vars
  // validate({ commit, state }) {
  //   if (!state.currentUser) return Promise.resolve(null);
  //   const user = getFirebaseBackend().getAuthenticatedUser();
  //   commit("SET_CURRENT_USER", user);
  //   return user;
  // },
};

// ===
// Private helpers
// ===

function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state));
}
