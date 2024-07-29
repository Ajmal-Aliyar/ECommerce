const User = require('../model/userModel')
const isLogin = async (req, res, next) => {
    try{
        if(req.session.user_id){
            const userId = req.session.user_id
            const user = await User.findById(userId)

            if(!user.isBlocked){
                
                return next()
            }else{
                req.session.destroy()
                res.redirect('/signIn')
            }
        }else{
            res.redirect('/signIn')
        }

    }catch(error){
        console.error(error.message);
    }
}
const isLogout =  async (req,res,next)=>{
    try{
        if(!req.session.user_id){
            next() 
        }else{
            res.redirect('/')
        }
        
    }catch(error){
        console.error(error.message);
    }
}


module.exports ={ isLogin, isLogout}
