import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector for accessing cart from Redux
import { DeleteOutlined, EditOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { Modal, Button, Table, Form, Input, Select, message } from "antd";

const ItemPage = () => {
  const dispatch = useDispatch();
  const [itemsData, setItemsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groupedItems, setGroupedItems] = useState({}); // Grouped items by category
  const [popupModal, setPopupModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Cart state management using Redux (optional)
  const cart = useSelector((state) => state.cart); // Access cart from Redux store

  // Fetch categories dynamically
  const getCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories/get-categories");
      setCategories(data);
      console.log("Categories",data)
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  // Fetch items
  const getAllItems = async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get("/api/items/get-item");
      setItemsData(data);
      dispatch({ type: "HIDE_LOADING" });
      console.log("items",data)
      // Group items by category
      groupItemsByCategory(data);
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.log(error);
    }
  };

  // Group items by category
  const groupItemsByCategory = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const categoryId = item.category; // Assuming category is the ID field
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });
    setGroupedItems(grouped);
  };

  useEffect(() => {
    getCategories();
    getAllItems();
    //eslint-disable-next-line
  }, []);

  // Handle delete
  const handleDelete = async (record) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.post("/api/items/delete-item", { itemId: record._id });
      message.success("Item Deleted Successfully");
      getAllItems();
      setPopupModal(false);
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Something Went Wrong");
      console.log(error);
    }
  };

  // Handle form submit for adding/editing item
  const handleSubmit = async (value) => {
    console.log("the value is this",value)
    if (editItem === null) {
      try {
        dispatch({ type: "SHOW_LOADING" });
        await axios.post("/api/items/add-item", value);
        message.success("Item Added Successfully");
        getAllItems();
        setPopupModal(false);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        message.error("Something Went Wrong");
        console.log(error);
      }
    } else {
      try {
        dispatch({ type: "SHOW_LOADING" });
        await axios.put("/api/items/edit-item", {
          ...value,
          itemId: editItem._id,
        });
        message.success("Item Updated Successfully");
        getAllItems();
        setPopupModal(false);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        message.error("Something Went Wrong");
        console.log(error);
      }
    }
  };

  // Handle adding to cart
  const handleAddToCart = (item) => {

    // dispatch({ type: "ADD_TO_CART", payload: { ...item, quantity: 1 } }); // Dispatch action to add to cart
    dispatch({ type: "ADD_TO_CART", payload: { 
      ItemName : item.ItemName, 
      quantity: 1,
      categoryId: item.categoryId,
      price: item.price,
      _id: item._id 
    } });
    message.success(`${item.ItemName} added to cart`);
  };

  // Table columns with Add to Cart button
  const columns = [
    { title: "Name", dataIndex: "ItemName" },
    // {
    //   title: "Image",
    //   dataIndex: "image",
    //   render: (image, record) => (
    //     <img src={image} alt={record.name} height="60" width="60" />
    //   ),
    // },
    { title: "Price", dataIndex: "price" },
    { title: "Count", dataIndex: "count" },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <Button
            type="primary"
            onClick={() => handleAddToCart(record)}
            icon={<ShoppingCartOutlined />}
            style={{ marginRight: 10 }}
          >
            Add to Cart
          </Button>
          <EditOutlined
            style={{ cursor: "pointer", marginRight: 10 }}
            onClick={() => {
              setEditItem(record);
              setPopupModal(true);
            }}
          />
          <DeleteOutlined
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleDelete(record);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h1>Products </h1>
        <Button type="primary" onClick={() => setPopupModal(true)}>
          Add Item
        </Button>
      </div>

      {/* Render items category-wise */}
      {/* {itemsData.map((item) => {
        // const itemsInCategory = groupedItems[category._id] || [];
        return ( */}
          <div >
            {/* <h2>{item.name}</h2> */}
            <Table
              columns={columns}
              dataSource={itemsData} // Use the grouped items
              bordered
              pagination={false} // Disable pagination for each category
            />
          </div>
        {/* ) */}
      {/* })} */}

      {/* Modal for Add/Edit Item */}
      {popupModal && (
        <Modal
          title={`${editItem !== null ? "Edit Item" : "Add New Item"}`}
          visible={popupModal}
          onCancel={() => {
            setEditItem(null);
            setPopupModal(false);
          }}
          footer={false}
        >
          <Form
            layout="vertical"
            initialValues={editItem}
            onFinish={handleSubmit}
          >
            <Form.Item name="ItemName" label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="price" label="Price">
              <Input />
            </Form.Item>
            <Form.Item name="count" label="Item Count">
              <Input />
            </Form.Item>
            {/* <Form.Item name="image" label="Image URL">
              <Input />
            </Form.Item> */}
            <Form.Item name="categoryId" label="Category">
              <Select>
                {categories.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="d-flex justify-content-end">
              <Button type="primary" htmlType="submit">
                SAVE
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default ItemPage;
