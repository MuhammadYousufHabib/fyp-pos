import React, { useEffect } from "react";
import { Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (value) => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      await axios.post("/api/users/register", value);
      message.success("Register Succesfully");
      navigate("/login");
      dispatch({ type: "HIDE_LOADING" });
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
          {/* <h1>Super Store Sight</h1> */}
          <h3 className="heading-xl">Register Page</h3>
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label={<span style={{ display: 'none' }}>Name</span>}>
              <Input placeholder="Name" prefix={<UserOutlined className="svg-input"/>} className="input-field"/>
            </Form.Item>
            <Form.Item name="email" label={<span style={{ display: 'none' }}>Email</span>}>
              <Input placeholder="Email" prefix={<MailOutlined className="svg-input"/>}  className="input-field"/>
            </Form.Item>
            <Form.Item name="password" label={<span style={{ display: 'none' }}>Password</span>}>
              <Input type="password"  placeholder="Password" prefix={<LockOutlined className="svg-input"/>} className="input-field"/>
            </Form.Item>

            <div className="d-flex justify-content-between not-a-user">
              <p>
                Already Registered?
                <Link to="/login"> Login Here !</Link>
              </p>
              <Button type="primary" htmlType="submit">
                Register
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Register;
