import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "landing-page/",
      name: "landing-page",
      component: require("@/components/LandingPage").default
    },
    {
      path: "/",
      name: "home-page",
      component: require("@/components/HomePage").default
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
