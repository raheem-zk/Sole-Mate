const orderSchema = require('../../models/user/orderModel');

const sales = async (req, res)=>{
    try {
        res.render('sales/sales',{message:''});
    } catch (error) {
        console.log(error);
    }
}

const get_date = async (req, res)=>{
    try {
        const firstDate = req.body.first;
        const secondDate = req.body.second;
        if (!firstDate || !secondDate) {
            res.render('sales/sales', { message: 'All fields are required' });
            return; 
        }
        console.log(req.body);
    
        const salesdata = await orderSchema.find({
            status: 'delivered',
            date: { $gte: new Date(firstDate), $lte: new Date(secondDate) }
        }).populate({
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
              })
        console.log(req.body);
        console.log(salesdata);
        // res.send(salesdata)
        // res.render('sales/test_pdf_download',{salesdata})
        return res.render('sales/sales_reports',{salesdata})
    } catch (error) {
        console.log(error);
    }
    
}
const sales_report = async (req, res)=>{
    try {
        const salesdata = await orderSchema.find({status: 'delivered'})
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
          })
        return res.render('sales/sales_reports',{salesdata})
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    sales_report,
    sales,
    get_date
}