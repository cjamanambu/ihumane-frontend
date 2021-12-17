import { ROUTES, SET_TOKEN, API } from "@/api";

export const state = {
  currentUser: sessionStorage.getItem("authUser"),
  loading: false,
  token: null,
  loggedIn: false,
  userData: {},
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
          const { userData, token } = res.data;
          commit("SET_TOKEN", token);
          commit("SET_USER_DATA", userData);
          commit("TOGGLE_LOGGED_IN");
          resolve(res);
        })
        .catch((err) => reject(err))
        .finally(() => commit("TOGGLE_LOADING"));
    });
  },

  // Logs out the current user.
  logOut({ commit }) {
    commit("SET_TOKEN", null);
    commit("TOGGLE_LOGGED_IN");
    localStorage.clear();
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
