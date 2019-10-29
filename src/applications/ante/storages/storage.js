export default {
  namespaced: true,

  state: {
    currentApplication: null // Profile of current application
  },

  mutations: {
    // Set client IP (when connected to access point)
    setCurrentApplication (state, value) {
      state.currentApplication = value;
    }
  },

  actions: {
    // Close current application
    closeCurrentApplication (context) {
      context.commit('setCurrentApplication', null);
    },

    // Close current application
    registerCurrentApplication (context, profile) {
      context.commit('setCurrentApplication', profile);
    }
  }
};
