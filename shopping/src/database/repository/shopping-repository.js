const { OrderModel, CartModel } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { APIError, BadRequestError } = require("../../utils/app-errors");

//Dealing with data base operations
class ShoppingRepository {
  // payment

  async Orders(customerId) {
    try {
      // const orders = await OrderModel.find({customerId }).populate('items.product');
      const orders = await OrderModel.find({ customerId });

      return orders;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Orders"
      );
    }
  }

  //add cart and addcartitem
  async Cart(customerId) {
    const cartItems = await CartModel.find({ customerId: customerId });

    if (cartItems) {
      return cartItems;
    }

    throw new Error("Data Not found!");
  }

  async AddCartItem(customerId, item, qty, isRemove) {
    // return await CartModel.deleteMany();

    const cart = await CartModel.findOne({ customerId: customerId });

    const { _id } = item;

    if (cart) {
      let isExist = false;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        cartItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.unit = qty;
            }
            isExist = true;
          }
        });
      }

      if (!isExist && !isRemove) {
        cartItems.push({ product: { ...item }, unit: qty });
      }

      cart.items = cartItems;

      return await cart.save();
    } else {
      return await CartModel.create({
        customerId,
        items: [{ product: { ...item }, unit: qty }],
      });
    }
  }
  //txnId -transaction Id, once the payment is done
  async CreateNewOrder(customerId, txnId) {
    //check transaction for payment Status

    try {
      //no customer model there, perform based on cart model
      //   const profile = await CustomerModel.findById(customerId).populate(
      //     "cart.product"
      //   );
      //   if (profile) {
      //     let amount = 0;

      //     let cartItems = profile.cart;

      //     if (cartItems.length > 0) {
      //       //process Order
      //       cartItems.map((item) => {
      //         amount += parseInt(item.product.price) * parseInt(item.unit);
      //       });

      //       const orderId = uuidv4();

      //       const order = new OrderModel({
      //         orderId,
      //         customerId,
      //         amount,
      //         txnId,
      //         status: "received",
      //         items: cartItems,
      //       });

      //       profile.cart = [];

      //       order.populate("items.product").execPopulate();
      //       const orderResult = await order.save();

      //       profile.orders.push(orderResult);

      //       await profile.save();

      //       return orderResult;
      //     }
      //   }
      const cart = await CartModel.findOne({ customerId: customerId });
      if (cart) {
        let amount = 0;

        let cartItems = cart.items;

        if (cartItems.length > 0) {
          //process Order

          cartItems.map((item) => {
            amount += parseInt(item.product.price) * parseInt(item.unit);
          });

          const orderId = uuidv4();

          const order = new OrderModel({
            orderId,
            customerId,
            amount,
            status: "received",
            items: cartItems,
          });

          cart.items = [];

          const orderResult = await order.save();
          await cart.save();
          return orderResult;
        }
      }
      return {};
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Category"
      );
    }
  }
}

module.exports = ShoppingRepository;
