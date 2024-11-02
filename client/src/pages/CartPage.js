import React, { useState, useEffect ,useRef} from "react";
import DefaultLayout from "../components/DefaultLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Table, Button, Modal, message, Form, Input, Select,Divider, Row, Col  } from "antd";

const CartPage = () => {
  const invoiceRef = useRef(null);
  const [subTotal, setSubTotal] = useState(0);
  const [billPopup, setBillPopup] = useState(false);
  const [currentBillPopup, setCurrentBillPopup] = useState(false); 
  const [BillsData, setBillsData] = useState([])
  const [currentBill, setcurrentBill] = useState()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);
  
useEffect(() => {
   if (cartItems && cartItems.length > 0) {
    localStorage.setItem("flag", 1);
    setBillPopup(true)
  } else {
    localStorage.removeItem("flag"); // Optionally remove the flag if the cart is empty
  }
}, [])
const getAllBills = async () => {
  try {
    dispatch({
      type: "SHOW_LOADING",
    });
    const { data } = await axios.get("/api/bills/get-bills");
    setBillsData(data);
    dispatch({ type: "HIDE_LOADING" });
  } catch (error) {
    dispatch({ type: "HIDE_LOADING" });
    console.log(error);
  }
};
  const handleIncrement = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };
  const showCurrentBill = () => {
    setCurrentBillPopup(true);
    setBillPopup(false); // Close the invoice modal
  };
const handlePrint = () => {
  const printContent = invoiceRef.current.innerHTML;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none'; // Hide the iframe
  document.body.appendChild(iframe); // Append the iframe to the body

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          @media print {
            body {
              margin: 0; 
              padding: 0; 
              font-family: 'Courier New', Courier, monospace; // Monospace font for a receipt feel
              font-size: 16px; // Increased font size for better readability
            }
            @page {
              margin: 20px; // Add margin for printing
            }
            h3, h4, h5, p { 
              margin: 0; 
              padding: 0;
            }
            ul { 
              padding: 0; 
              list-style-type: none; 
            }
            /* Styles for receipt */
            .receipt {
              width: 100%; 
              max-width: 400px; // Set a width for the receipt
              margin: auto;
              text-align: left; // Align text to the left
              padding: 10px; // Add padding to the receipt content
            }
            .total {
              font-weight: bold; 
              font-size: 18px; // Make the total stand out with a larger font size
              margin-top: 10px; 
            }
            .footer {
              margin-top: 20px; 
              text-align: center; // Center footer
              font-size: 12px; // Smaller font for footer
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${printContent}
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe); 
    navigate('/');  
  };
};

  
  


  // Handle decrement
  const handleDecrement = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const columns = [
    { title: "Name", dataIndex: "ItemName" },
    { title: "Price", dataIndex: "price" },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <PlusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleIncrement(record)}
          />
          <b>{record.quantity}</b>
          <MinusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleDecrement(record)}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer" }}
          onClick={() =>
            dispatch({
              type: "DELETE_FROM_CART",
              payload: record,
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    let temp = 0;
    cartItems.forEach((item) => (temp += item.price * item.quantity));
    setSubTotal(temp);
  }, [cartItems]);

  // Handle submit
  const handleSubmit = async (value) => {
    try {
      const newObject = {
        customerName: "-",  
        customerNumber: 0, 
        paymentMode: value.paymentMode || "cash", 
        cartItems,
        subTotal,
        tax: Number(((subTotal / 100) * 10).toFixed(2)),
        totalAmount: Number(
          Number(subTotal) + Number(((subTotal / 100) * 10).toFixed(2))
        ),
      };


      // Update inventory
      await axios.put("/api/items/edit-count", cartItems);

      // Create bill
      await axios.post("/api/bills/add-bills", newObject);
      dispatch({
        type: "Empty_CART",
      });
      message.success("Bill Generated");

    } catch (error) {
      message.error("Something went wrong");
      console.log(error.data);
    }
    await getAllBills()
    
  };
useEffect(() => {
  console.log(BillsData,"billsdata")
  if (BillsData.length > 0) {
    setcurrentBill(BillsData[BillsData.length - 1]);
  }
}, [BillsData]);  
console.log(currentBill,"current bill")
return (
  <DefaultLayout>
    <h1>Cart Page</h1>
    <Table columns={columns} dataSource={cartItems} bordered />
    <div className="d-flex flex-column align-items-end">
      <hr />
      <h3>
        SUB TOTAL: $ <b>{subTotal}</b> /-
      </h3>
      <Button type="primary"    disabled={cartItems.length === 0}  onClick={() => setBillPopup(true)}>
        Create Invoice
      </Button>
    </div>
    
    <Modal
      title="Create Invoice"
      visible={billPopup}
      onCancel={() => setBillPopup(false)}
      footer={false}
    >
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="paymentMode" label="Payment Method" required>
          <Select placeholder="Select Payment Method">
            <Select.Option value="EasyPaise">EasyPaisa</Select.Option>
            <Select.Option value="Jazzcash">Jazzcash</Select.Option>
          </Select>
        </Form.Item>
        <div className="bill-it">
          <h5>
            Sub Total: <b>{subTotal}</b>
          </h5>
          <h4>
            TAX
            <b> {((subTotal / 100) * 10).toFixed(2)}</b>
          </h4>
          <h3>
            GRAND TOTAL -{" "}
            <b>
              {Number(subTotal) + Number(((subTotal / 100) * 10).toFixed(2))}
            </b>
          </h3>
        </div>
        <div className="d-flex justify-content-end">
          <Button type="primary" htmlType="submit" onClick={showCurrentBill}>
            Generate Bill
          </Button>
        </div>
      </Form>
    </Modal>

    <Modal
  title="Invoice Details"
  visible={currentBillPopup}
  onCancel={() => setCurrentBillPopup(false)}
  footer={null}
  style={{ maxWidth: '400px', width: '100%' }} // Set a smaller maximum width
  bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px' }} // Reduce padding in body
>
  <div ref={invoiceRef} style={{ padding: "0" }}> {/* Attach the ref here */}
    {currentBill && (
      <>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {currentBill.cartItems.map((item) => (
            <li key={item._id} style={{ fontSize: "0.8rem", marginBottom: "2px" }}>
              {item.ItemName} - Quantity: {item.quantity}
            </li>
          ))}
        </ul>
        <Divider style={{ margin: '10px 0' }} />
        <p style={{ fontSize: "0.8rem", margin: "2px 0" }}><strong>Bill ID:</strong> {currentBill._id}</p>
        <p style={{ fontSize: "0.8rem", margin: "2px 0" }}><strong>Sub Total:</strong> ${currentBill.subTotal.toFixed(2)}</p>
        <p style={{ fontSize: "0.8rem", margin: "2px 0" }}><strong>Tax:</strong> ${currentBill.tax.toFixed(2)}</p>
        <p style={{ fontSize: "0.8rem", margin: "2px 0" }}><strong>Total Amount:</strong> ${currentBill.totalAmount.toFixed(2)}</p>
      </>
    )}
  </div>
  <div style={{ textAlign: "right" }}>
    <Button onClick={handlePrint}>Print Invoice</Button>
  </div>
</Modal>






  </DefaultLayout>
);

};

export default CartPage;
