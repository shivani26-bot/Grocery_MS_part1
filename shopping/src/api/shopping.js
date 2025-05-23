const ShoppingService = require("../services/shopping-service");
// const UserService = require("../services/customer-service");
const UserAuth = require("./middlewares/auth");
const { PublishCustomerEvent } = require("../utils");
module.exports = (app) => {
  const service = new ShoppingService();
  //   const userService = new UserService();

  //   change /shopping/order to /order
  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    try {
      const { data } = await service.PlaceOrder({ _id, txnNumber });

      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");
      PublishCustomerEvent(payload);

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  //   /shopping/orders to /orders
  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      //user service doesn't belong to this service
      //   const { data } = await userService.GetShopingDetails(_id);
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
      //   return res.status(200).json(data.orders);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    console.log(_id);
    try {
      //   const { data } = await userService.GetShopingDetails(_id);
      const { data } = await service.GetCart({ _id });
      if (!data) {
        // If no data is found, return a 404 or appropriate status code
        return res.status(404).json({ error: "Cart not found" });
      }

      // Return successful response with the cart data
      return res.status(200).json(data);
      //   return res.status(200).json(data);
      //   return res.status(200).json(data.cart);
    } catch (err) {
      throw err;
    }
  });
};
