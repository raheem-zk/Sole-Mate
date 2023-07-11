const userSchema = require('../models/user/userModel');
const isLogin = async (req,res,next)=>{
    try {
        if(req.session.userId){
            let blocked = await userSchema.findOne({userId :req.session.userId, status:false})
            if (blocked){
                req.session.userId = null;
                return res.redirect('/login');
            }
        }else{
            res.redirect('/login');
        }
        next();

    } catch (error) {
        console.log(error.message);
        
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.userId){
           res.redirect('/')
        }else{
          
        }
        next();
        
    } catch (error) {
        console.log(error.message);
        
    }
}


module.exports= {
    isLogin,
    isLogout
}