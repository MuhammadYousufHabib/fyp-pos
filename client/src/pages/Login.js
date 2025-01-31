import React, { useEffect } from "react";
import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useDispatch } from "react-redux";
import { MailOutlined, LockOutlined } from "@ant-design/icons";


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const res = await axios.post("/api/users/login", value);
      dispatch({ type: "HIDE_LOADING" });
      console.log(res.data);
      dispatch({
        type: "USER_LOGIN",
        payload: res.data.data,
      });

      message.success("user login Succesfully");
      // localStorage.setItem("auth", JSON.stringify(res.data));
      navigate("/");
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Something Went Wrong");
      console.log(error);
    }
  };

  //currently login  user
  useEffect(() => {
    if (localStorage.getItem("auth")) {
      localStorage.getItem("auth");
      navigate("/");
    }
  }, [navigate]);
  return (
    <>
      <div className="register">
        <div className="regsiter-form">
          <h3 className="heading-xl">Login Page</h3>
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="email" label={<span style={{ display: 'none' }}>Email</span>}>
              <Input placeholder="Email" prefix={<MailOutlined className="svg-input" />} className="input-field" />
            </Form.Item>
            <Form.Item name="password" label={<span style={{ display: 'none' }}>Password</span>}>
              <Input type="password" placeholder="Password" prefix={<LockOutlined className="svg-input" />} className="input-field" />
            </Form.Item>

            <div className="d-flex justify-content-between not-a-user">
              <p>
                Not a user?
                <Link to="/register"> Register Here !</Link>
              </p>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
