import { useState } from "react";
import axios from "axios";
import { Form, Button, Table, Spinner, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [filters, setFilters] = useState({
    customerEmail: "", // Add customer email filter
    categoryName: "", // Add category name filter
    productName: "", // Add product name filter
    startDate: "", // Start date for date range
    endDate: "", // End date for date range
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchOrders = async () => {
    setLoading(true); // Start loading
    try {
      const { data } = await axios.get("http://localhost:3000/orders", {
        params: filters,
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Filter Orders</h2>
      <Form className="row g-3">
        {/* Customer Email Filter */}
        <Form.Group className="col-md-4">
          <Form.Control
            type="email"
            name="customerEmail"
            placeholder="Customer Email"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Category Name Filter */}
        <Form.Group className="col-md-4">
          <Form.Control
            type="text"
            name="categoryName"
            placeholder="Category Name"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Product Name Filter */}
        <Form.Group className="col-md-4">
          <Form.Control
            type="text"
            name="productName"
            placeholder="Product Name"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Start Date Filter */}
        <Form.Group className="col-md-4">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            onChange={handleChange}
          />
        </Form.Group>

        {/* End Date Filter */}
        <Form.Group className="col-md-4">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            onChange={handleChange}
          />
        </Form.Group>

        {/* Search Button */}
        <div className="col-md-4 d-flex align-items-end">
          <Button variant="primary" onClick={fetchOrders} className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Search"}
          </Button>
        </div>
      </Form>

      {/* Orders Table */}
      <Table striped bordered hover responsive className="mt-4">
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Customer Email</th>
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
                <td>{order.customerEmail}</td>
                <td>{order.categoryName}</td>
                <td>{order.productName}</td>
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
}

export default App;