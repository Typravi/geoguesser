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
      path: "/JoinGameView",
      name: "JoinGameView",
      component: () => import("../views/JoinGameView.vue"),
    },

    {
      path: "/ResultsView/:lobbyID/:playerID",
      name: "ResultView",
      component: () => import("../views/ResultView.vue"),
    },
    
    {
      path: "/lobby/:lobbyID/:playerID",
      name: "LobbyView",
      component: () => import("../views/LobbyView.vue"),
    },
    {
      path: "/create/",
      name: "CreateView",
      component: () => import("../views/CreateView.vue"),
    },
    {
      path: "/GeoMapView/:lobbyID/:playerID",
      name: "GeoMapView",
      component: () => import("../views/GeoMapView.vue"),
    },
  ],
});

export default router;
