import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Table, Spinner, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [filters, setFilters] = useState({
    customerName: "",
    category: "",
    product: "",
    startDate: "",
    endDate: "",
  });
  const [orders, setOrders] = useState([]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/orders", {
        params: filters,
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Filter Orders</h2>
      <Form className="row g-3">
        <Form.Group className="col-md-4">
          <Form.Control type="text" name="customerName" placeholder="Customer Name" onChange={handleChange} />
        </Form.Group>
        <Form.Group className="col-md-4">
          <Form.Control type="text" name="category" placeholder="Category" onChange={handleChange} />
        </Form.Group>
        <Form.Group className="col-md-4">
          <Form.Control type="text" name="product" placeholder="Product" onChange={handleChange} />
        </Form.Group>
        <Form.Group className="col-md-4">
          <Form.Control type="date" name="startDate" onChange={handleChange} />
        </Form.Group>
        <Form.Group className="col-md-4">
          <Form.Control type="date" name="endDate" onChange={handleChange} />
        </Form.Group>
        <div className="col-md-4 d-flex align-items-end">
          <Button variant="primary" onClick={fetchOrders} className="w-100">
            Search
          </Button>
        </div>
      </Form>

      <Table striped bordered hover responsive className="mt-4">
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Category</th>
            <th>Product</th>
            <th>Order Date</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.category}</td>
                <td>{order.product}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>${order.total_price}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};


export default App;