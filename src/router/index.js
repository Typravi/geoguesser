import { createRouter, createWebHistory } from "vue-router";
import StartView from "../views/StartView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Start",
      component: StartView,
    },
    {
      path: "/TestQuestionView",
      name: "TestQuestionView",
      component: () => import("../views/NewViews/TestQuestionView.vue"),
    },
    {
      path: "/QuestionView",
      name: "QuestionView",
      component: () => import("../views/NewViews/QuestionView.vue"),
    },
    {
      path: "/JoinGameView",
      name: "JoinGameView",
      component: () => import("../views/NewViews/JoinGameView.vue"),
    },
    {
      path: "/NewHomeView",
      name: "NewHomeView",
      component: () => import("../views/NewViews/NewHomeView.vue"),
    },
    {
      path: "/ResultView",
      name: "ResultView",
      component: () => import("../views/NewViews/ResultView.vue"),
    },
    {
      path: "/poll/:id",
      name: "PollView",
      component: () => import("../views/PollView.vue"),
    },
    {
      path: "/lobby/:lobbyID",
      name: "LobbyView",
      component: () => import("../views/LobbyView.vue"),
      props: true,
    },
    {
      path: "/create/",
      name: "CreateView",
      component: () => import("../views/CreateView.vue"),
    },
    {
      path: "/result/:id",
      name: "ResultView",
      component: () => import("../views/ResultView.vue"),
    },
    {
      path: "/GeoMapView",
      name: "GeoMapView",
      component: () => import("../views/NewViews/GeoMapView.vue"),
    },
  ],
});

export default router;

