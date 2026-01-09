import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./routes/router";

try {
  console.log("Initializing Vue app...");
  const app = createApp(App);
  app.use(router);
  
  const mountElement = document.getElementById("app");
  if (!mountElement) {
    console.error("Mount element #app not found!");
  } else {
    app.mount("#app");
    console.log("Vue app mounted successfully");
  }
} catch (error) {
  console.error("Error initializing Vue app:", error);
}
