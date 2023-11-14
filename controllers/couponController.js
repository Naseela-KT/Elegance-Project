const Coupon=require("../models/coupon")


//ADMIN
const loadCoupons = async (req, res) => {
    try {
        const couponData = await Coupon.find({});
        res.render('coupons', { couponData, couponData });
    } catch (error) {
        console.error(error.message);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


const addCoupons = async (req, res) => {
    try {
        const couponcode = req.body.couponcode;
        const couponDescription = req.body.coupondescription;
        const discount = req.body.discount;
        const MaximumAmount = req.body.maximumAmount;
        const MinimumAmount = req.body.minimumAmount;
        const couponexpiry = req.body.couponexpiry;

        const coupon = new Coupon({
            MinimumAmount: MinimumAmount,
            MaximumAmount: MaximumAmount,
            Description: couponDescription,
            Expiry: couponexpiry,
            Code: couponcode,
            Discount: discount
        });

        const success = await coupon.save();
        if (success) {
            couponData = await Coupon.find({});
            res.status(201).redirect('/admin/coupons');
        } else {
            res.status(500).json({ message: 'Error saving coupon to the database.' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: 'Invalid request. Please check your input data.' });
    }
};




const loadEditCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        const coupon = await Coupon.findOne({ _id: couponId });
        if (coupon) {
            res.status(200).render("editCoupon", { coupon: coupon });
        } else {
            res.status(404).render("error", { message: "Coupon not found." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render("error", { message: "Internal Server Error" });
    }
};





const updateCoupon = async (req, res) => {
    try {
        const couponId = req.body.couponId;
        const couponcode = req.body.couponcode;
        const couponDescription = req.body.coupondescription;
        const discount = req.body.discount;
        const MaximumAmount = req.body.maximumAmount;
        const MinimumAmount = req.body.minimumAmount;
        const couponexpiry = req.body.couponexpiry;

        const coupon = await Coupon.findOne({ _id: couponId });

        if (coupon) {
            const success = await Coupon.updateOne({ _id: couponId }, {
                $set: {
                    MinimumAmount: MinimumAmount,
                    MaximumAmount: MaximumAmount,
                    Description: couponDescription,
                    Expiry: couponexpiry,
                    Code: couponcode,
                    Discount: discount
                }
            });
            if (success.modifiedCount > 0) {
                res.status(200).json({success});
            } else {
                res.status(200).json({ message: 'Coupon not modified.' });
            }
        } else {
            res.status(404).json({ message: 'Coupon not found.' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




const deletecoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;
        const deletecoupon = await Coupon.deleteOne({ _id: couponId });

        if (deletecoupon.deletedCount > 0) {
            res.status(204).redirect("/admin/coupons");
        } else {
            res.status(404).json({ message: "Coupon not found." });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};





//USER


const applycoupon = async (req, res) => {
    try {
        const user_id = res.locals.user._id;
        const { couponcode, total } = req.body;
        const coupon = await Coupon.findOne({ Code: couponcode });
    
        if (!coupon){
            return res.json({ message: 'Invalid Coupon Code' });
        }

        const currentDate = new Date();
        if (coupon.Expiry < currentDate) {
            return res.json({ message: 'Coupon has expired' });
        }

        const appliedUser = await Coupon.findOne({
            _id: coupon._id,
            Customers: { $in: [user_id.toString()] } 
        });

        if (appliedUser) {
            return res.json({ message: 'Coupon already used!' });
        }

        const discountAmount = Math.ceil((total * coupon.Discount) / 100);
        const minimumAmount = coupon.MinimumAmount;
        const maximumAmount = coupon.MaximumAmount;

        if (total < minimumAmount || total > maximumAmount) {
            return res.json({ message: 'Total amount does not meet coupon requirements' }).status(400);
        }

        req.session.coupon = coupon._id;
        console.log(discountAmount);
        res.status(200).json({ discount: discountAmount });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




module.exports={
    loadCoupons,
    addCoupons,
    loadEditCoupon,
    updateCoupon,
    deletecoupon,
    applycoupon
}