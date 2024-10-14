import React, { useState, useEffect } from "react";
import DefaultLayout from "./../components/DefaultLayout";
import axios from "axios";
import { Row, Col, Modal, Button, Form, Input } from "antd";
import { useDispatch } from "react-redux";
import ItemList from "../components/ItemList";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";


const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("drinks");
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // For updating
  const dispatch = useDispatch();

  // Fetch items data
  useEffect(() => {
    const getAllItems = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const { data } = await axios.get("/api/items/get-item");
        setItemsData(data);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        console.log(error);
      }
    };
    getAllItems();
  }, [dispatch]);
  const getCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories/get-categories");
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };
  // Fetch categories data
  useEffect(() => {
   
    getCategories();
  }, []);

  // Handle category addition
  const handleAddCategory = async (values) => {
    try {
      const newCategory = {
        name: values.name,
        // description: values.description,
        // slug: values.slug,
        // image: values.imageUrl,
      };
      const { data } = await axios.post("/api/categories/add-categories", newCategory);
      setCategories((prev) => [...prev, data]); // Update state with new category
      setIsModalVisible(false);
    } catch (error) {
      console.log(error);
    }
    getCategories()
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.post(`/api/categories/delete-categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id)); // Update state to remove deleted category
      if (selectedCategory === id) {
        setSelectedCategory(categories[0]?.name || "drinks"); // Reset to first category
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle category update
  const handleUpdateCategory = async (values) => {
    try {
      const updatedCategory = {
        name: values.name,
        // description: values.description,
        // slug: values.slug,
        // image: values.imageUrl,
      };
      const { data } = await axios.put(`/api/categories/edit-categories/${currentCategory._id}`, updatedCategory);
      setCategories((prev) =>
        prev.map((cat) => (cat._id === currentCategory._id ? data : cat))
      );
      setIsModalVisible(false);
      setCurrentCategory(null);
    } catch (error) {
      console.log(error);
    }
    getCategories()
  };

  const showModal = (category = null) => {
    setCurrentCategory(category);
    setIsModalVisible(true);
  };

  return (
    <DefaultLayout>
      <div className="d-flex">
        {categories.map((category) => (
          <div
            key={category._id} 
            className={`d-flex  category ${
              selectedCategory === category.name && "category-active"
            }`}
            onClick={() => setSelectedCategory(category.name)}
          >
            <h4>{category.name}</h4>
            {/* <img
              src={category.image}
              alt={category.name}
              height="40"
              width="60"
            /> */}
            <DeleteOutlined onClick={() => handleDeleteCategory(category._id)}/>
              <EditOutlined onClick={() => showModal(category)}/>
            </div>
        ))}
        <Button onClick={() => showModal()}>Add Category</Button>
      </div>
      <Row>
        {itemsData
          .filter((i) => i.category === selectedCategory)
          .map((item) => (
            <Col xs={24} lg={6} md={12} sm={6} key={item.id}>
              <ItemList item={item} />
            </Col>
          ))}
      </Row>

      <Modal
        title={currentCategory ? "Update Category" : "Add Category"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={currentCategory || { name: ''}}
          onFinish={currentCategory ? handleUpdateCategory : handleAddCategory}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {currentCategory ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default Homepage;
