import "antd/dist/antd.min.css";
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CartPage from "./pages/CartPage";
import Homepage from "./pages/Homepage";
import ItemPage from "./pages/ItemPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BillsPage from "./pages/BillsPage";
import CutomerPage from "./pages/CutomerPage";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import CameraCapture from "./pages/CameraCapture";

function App() {
  const dispatch = useDispatch();
  const { user, isLogin, role } = useSelector((state) => state.rootReducer);
  console.log("here is user", user, isLogin, role);

  useEffect(() => {
    axios.interceptors.request.use(
      function (config) {
        config.withCredentials = true;
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    const checkUserLoginStatus = async () => {
      try {
        const response = await axios.get("/api/status", {
          withCredentials: true,
        });
        console.log("the status response", response.data.user);
        dispatch({
          type: "USER_LOGIN",
          payload: response.data.user,
        });
      } catch (err) {
        console.log("error is come in app use effect ", err);
        dispatch({
          type: "USER_LOGOUT",
        });
      }
    };
    checkUserLoginStatus();
  }, []);

  return (
    <>
      {isLogin === true && role === "user" ? (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/items" element={<ItemPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/camera" element={<CameraCapture />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/customers" element={<CutomerPage />} />

          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      ) : null}

      {isLogin === false || isLogin === null ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace={true} />} />
        </Routes>
      ) : null}

      {isLogin === null || isLogin === undefined ? <div></div> : null}
    </>
  );
}

export default App;

// export function ProtectedRoute({ children }) {
//   if (localStorage.getItem("auth")) {
//     return children;
//   } else {
//     return <Navigate to="/login" />;
//   }
// }
