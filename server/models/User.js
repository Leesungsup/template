const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const saltRounds=10
const jwt=require('jsonwebtoken')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type:Number,
        default:0
    },
    image : String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
},{    
    writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
}})
userSchema.pre('save',function(next){
    var user=this
    if(user.isModified('password')){
    bcrypt.genSalt(saltRounds,function(err,salt){
        if(err) return next(err)
        bcrypt.hash(user.password,salt,function(err,hash){
            if(err) return next(err)
            user.password=hash
            next()
        })
    })
    }else{
        next()
    }
})
userSchema.methods.comparePassword=function(plainPassword,callback){
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return callback(err);callback(null,isMatch)
    })
}
userSchema.methods.generateToken=function(callback){
    var user=this
    var token=jwt.sign(user._id.toHexString(),'leeToken')
    user.token=token
    user.save(function(err,user){
        if(err) return callback(err)
        callback(null,user)
    })
}
userSchema.statics.findByToken=function(token,callback){
    var user=this
    jwt.verify(token,'leeToken',function(err,decoded){
        user.findOne({"_id":decoded,"token":token},function(err,user){
            if (err) return callback(err);
            callback(null,user);
        })
    })
}
const User=mongoose.model('User',userSchema)
module.exports={User}