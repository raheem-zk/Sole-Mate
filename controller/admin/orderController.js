const orderSchema = require('../../models/user/orderModel');
const userSchema = require('../../models/user/userModel');


const order_management = async (req, res) =>{
    try {
        const order = await orderSchema.find()
        .populate({
            path: 'userId',
            model: 'users',
              localField: 'userId',
              foreignField: 'userId'
            }).sort({ date: -1 });
        res.render('order/order_management',{ order });
    } catch (error) {
        console.log(error);
    }
}


const oreder_action = async (req, res)=>{
    try {
        const orderId = req.query.orderId;
        const action = req.query.action;

        await orderSchema.updateOne({ orderId: orderId}, {$set: {status : action}}) 
        const orderData = await orderSchema.findOne({orderId: orderId});
        if(action=='refunded'){
          await userSchema.updateOne({userId: orderData.userId}, {$inc:{wallet: orderData.total}})
        }

        res.redirect('/admin/dashboard/order');
        } catch (error) {
        console.log(error);
    }
}

const order_info = async (req,res)=>{
    try {
        console.log(req.params);
        const orderId = req.params.id;
        const data  = await orderSchema.findOne({orderId : orderId})
        .populate({
            path: 'userId',
            model: 'users',
              localField: 'userId',
              foreignField: 'userId'
            })
            .populate({
                path: 'product.productId',
                model: 'products',
                localField: 'product.productId',
                foreignField: 'productId'
              })
              .populate({
                path: 'product.bannerId',
                model: 'banner',
                localField: 'product.bannerId',
                foreignField: 'bannerId'
            });

            let product =[], banner=[];
            if (data.product.length> 0 ){
              data.product.forEach((x)=>{
                console.log(x);
                if (x.bannerId){
                  banner.push(x);
                }else if (x.productId){
                  product.push(x);
                }
              })
            }

        return res.render('order/more_details',{data ,banner, product  });
    } catch (error) {
        console.log(error);
    }
}

module.exports ={
    order_management,
    oreder_action,
    order_info,
}