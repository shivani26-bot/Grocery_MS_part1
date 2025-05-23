const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/customer", proxy("http://localhost:8001/"));
app.use("/shopping", proxy("http://localhost:8003/"));
app.use("", proxy("http://localhost:8002/")); //products

app.listen(8000, () => {
  console.log("Gateway is listening to port 8000");
});

//The API Gateway here is going to hook up all our services based on the endpoints to different services. This aggregator or service will play a role in redirecting or routing the entire request flow based on the endpoint to the appropriate service.
// This proxy will redirect the request that comes to the gateway based on the endpoints
// to other services. If the request is related to the customer, it will redirect to the customer
// service. If it is related to product or shopping, it will redirect the request to the product
// or shopping service. This redirection will be handled by the proxy.
