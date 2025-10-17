const Coupon = require("../model/couponModel");
const { paginate } = require("../utils/paginate");

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0"); // Add leading zero if needed
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
const generateCouponCode = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let couponCode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }
  return couponCode;
};

const couponPage = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 6;

    const coupons = await paginate(Coupon, {}, { page, limit, sort: { _id: -1 } });

    res.render("coupon", { coupons });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const editCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).send("Coupon not found");
    }
    const convertToISODate = (date) => {
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    };
    res.render("editCoupon", { coupon, convertToISODate });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const updateCoupon = async (req, res) => {
  try {
    const {
      couponId,
      couponStart,
      couponExpire,
      minimumAmount,
      couponDiscount,
      couponDescription,
      couponLimit,
    } = req.body;

    const start = formatDate(new Date(couponStart));
    const end = formatDate(new Date(couponExpire));
    const updatecoupon = await Coupon.updateOne(
      { _id: couponId },
      {
        couponStart: start,
        couponExpire: end,
        minimumAmount,
        couponDiscount,
        couponLimit,
        couponDescription,
      }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const addCouponPage = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const addCoupon = async (req, res) => {
  try {
    const {
      couponStart,
      couponExpire,
      minimumAmount,
      couponDiscount,
      couponDescription,
      couponLimit,
    } = req.body;

    const start = formatDate(new Date(couponStart));
    const end = formatDate(new Date(couponExpire));

    const newCouponCode = generateCouponCode(10);

    const saveNewCoupon = new Coupon({
      couponCode: newCouponCode,
      couponStart: start,
      couponExpire: end,
      minimumAmount,
      couponDiscount,
      couponDescription,
      couponLimit,
    });
    await saveNewCoupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const hideCoupon = async (req, res) => {
  try {
    const couponId = req.body.id;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).send("Coupon not found");
    }

    if (coupon.couponHide) {
      await Coupon.updateOne({ _id: couponId }, { couponHide: false });
    } else {
      await Coupon.updateOne({ _id: couponId }, { couponHide: true });
    }
    res.json({ route: "coupon" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.body.id;
    console.log(req.body);
    const result = await Coupon.deleteOne({ _id: couponId });
    if (result.deletedCount === 0) {
      return res.status(404).send("Coupon not found");
    }
    res.json({ route: "coupon" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  couponPage,
  editCoupon,
  addCoupon,
  addCouponPage,
  updateCoupon,
  hideCoupon,
  deleteCoupon,
};
