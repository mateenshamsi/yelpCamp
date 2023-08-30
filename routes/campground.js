const  express = require('express')
const router = express.Router(); 

const catchAsync=require('../utils/catchAsync')
const Campground = require('../models/campground')
const{isLoggedIn} = require('../middleware')
const {validateCampground}= require('../middleware')
const {isAuthor} = require('../middleware')
const campgrounds = require('../controllers/campground')
const multer  = require('multer')
const {storage} = require('../cloudinary/index')
const upload = multer({storage})
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))

   
   
   router.get('/new',isLoggedIn,campgrounds.renderNewForm)
   
  
   
   router.get('/:id',catchAsync(campgrounds.showCampground))
   
   router.get('/:id/edit',isLoggedIn,isAuthor,campgrounds.renderEditForm)
  
   router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground)) 
   router.delete('/:id',isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
  
   module.exports = router ; 