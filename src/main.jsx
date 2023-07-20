import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "swiper/css";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
const persistor = persistStore(store);
import { persistStore } from "redux-persist";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
