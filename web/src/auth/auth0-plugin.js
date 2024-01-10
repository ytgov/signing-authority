/**
 *  External Modules
 */

import Vue from "vue";
import { createAuth0Client } from "@auth0/auth0-spa-js";
import { secureDelete, secureGet, securePut, securePost } from "@/store/jwt";
import { getAuthConfig } from "./getAuthConfig";
import { apiConfigUrl } from "@/config";

/**
 *  Vue.js Instance Definition
 */

let instance;

export const getInstance = () => instance;

/**
 *  Vue.js Instance Initialization
 */

export const useAuth0 = ({
  onRedirectCallback = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  redirectUri = window.location.origin,
  ...pluginOptions //eslint-disable-line no-unused-vars
}) => {
  if (instance) return instance;

  instance = new Vue({
    data() {
      return {
        auth0Client: null,
        isLoading: true,
        isAuthenticated: false,
        user: {},
        error: null,
        options: {},
        targetUrl: undefined,
      };
    },
    methods: {
      async handleRedirectCallback() {
        this.isLoading = true;
        console.log("REDIRECT CALLBACK: ", this.redirectUri);
        try {
          await this.auth0Client.handleRedirectCallback();
          this.user = await this.auth0Client.getUser();

          this.isAuthenticated = true;
        } catch (error) {
          this.error = error;
        } finally {
          this.isLoading = false;
        }
      },

      loginWithRedirect(options) {
        return this.auth0Client.loginWithRedirect(options);
      },

      logout(options) {
        return this.auth0Client.logout(options);
      },

      getTokenSilently(o) {
        return this.auth0Client.getTokenSilently(o);
      },

      get(url) {
        return secureGet(url);
      },
      put(url, body, config) {
        return securePut(url, body, config);
      },
      post(url, body, config) {
        return securePost(url, body, config);
      },
      delete(url) {
        return secureDelete(url);
      },
    },

    async created() {
      this.options = await getAuthConfig(apiConfigUrl);

      this.auth0Client = await createAuth0Client({
        //...this.options,
        clientId: this.options.clientId,
        domain: this.options.domain,

        // ...pluginOptions,
        authorizationParams: {
          redirect_uri: redirectUri,
          audience: this.options.audience,
        },
      });

      try {
        if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
          const { appState } = await this.auth0Client.handleRedirectCallback();

          if (appState && appState.targetUrl) this.targetUrl = appState.targetUrl;

          onRedirectCallback(appState);
        }
      } catch (error) {
        this.error = error;
      } finally {
        this.isAuthenticated = await this.auth0Client.isAuthenticated();
        this.user = await this.auth0Client.getUser();
        //set the access token in the auth store
        //await this.getTokenSilently();
        //store.commit("auth/setToken", token);
        this.isLoading = false;
      }
    },
  });

  return instance;
};

/**
 *  Vue.js Plugin Definition
 */

export const Auth0Plugin = {
  install(Vue, options) {
    Vue.prototype.$auth = useAuth0(options);
  },
};
