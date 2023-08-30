if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
} 
console.log(process.env.SECRET)
const express = require('express')
const path= require('path') 
const mongoose = require('mongoose')
const app = express()
const catchAsync = require('./utils/catchAsync')
const Campground = require('./models/campground')
const flash= require('connect-flash')
const ExpressError = require('./utils/ExxpressError')
const userRoutes = require('./routes/users')
const engine = require('ejs-mate')
const methodOverride = require('method-override')
const Joi = require('joi')
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const Review = require('./models/review')
const campgroundRoutes= require('./routes/campground')
const session = require('express-session')
const{isLoggedIn,isReviewAuthor} = require('./middleware')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const review = require('./models/review')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log(" Mongo Connection open!!")
    })
    .catch(err=>{
        console.log("Oh no Mongo Error")
        console.log(err)
    })
  
    const validateReview=(req,res,next)=>{
        const{error}=reviewSchema.validate(req.body)
        if(error)
        { 
           const msg = error.details.map(el=>
            el.message).join(',')
           
            throw new ExpressError(msg,400)
        }
        else
        { 
            next()
        } 
    }
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))


app.engine('ejs',engine)
app.use(express.static(path.join(__dirname,'public')))


app.get('/',(req,res)=>{
    res.render('home')
})
const sessionConfig ={ 
    secret:'thisisabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{ 
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.get('/fakeUser',async(req,res)=>{
    const user = new User({email:'matin@gmail.com',username:'mattttin'})
    const newUser = await User.register(user,'chicken')
    res.send(newUser) 
})
app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.post('/campgrounds/:id/reviews',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author=req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))
app.delete('/campgrounds/:id/reviews/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))
app.all('*',(req,res,next)=>{

    next(new ExpressError('PAge Not found',404))
}) 
app.use((err,req,res,next)=>{
    if(!err.message) err.message="OH NO !!!!!"
    res.render('error',{err}) 
   
   
})
app.listen(3000,(req,res)=>{
    console.log('Serving on port 3000')
})