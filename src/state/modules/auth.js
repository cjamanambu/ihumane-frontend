import { API } from "@/services/api.service";

export const state = {
  currentUser: sessionStorage.getItem("authUser"),
  loading: false,
  token: null,
  loggedIn: false,
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
  },
  TOGGLE_LOGGED_IN(state) {
    state.loggedIn = !state.loggedIn;
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
    return new Promise((resolve, reject) => {
      commit("TOGGLE_LOADING");
      API.post(`users/login`, {
        user_username: username,
        user_password: password,
      })
        .then((res) => {
          const { data } = res;
          API.defaults.headers.common["x-auth-token"] = data;
          commit("SET_TOKEN", data);
          commit("TOGGLE_LOGGED_IN");
          resolve(res);
        })
        .catch((err) => reject(err.response.data))
        .finally(() => commit("TOGGLE_LOADING"));
    });
  },

  // Logs out the current user.
  logOut({ commit }) {
    commit("SET_TOKEN", null);
    commit("TOGGLE_LOGGED_IN");
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
