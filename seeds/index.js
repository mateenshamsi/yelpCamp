const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


const sample = array => array[Math.floor(Math.random() * array.length)];

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log(" Mongo Connection open!!")
    })
    .catch(err=>{
        console.log("Oh no Mongo Error")
        console.log(err)
    })
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author:'64d3c109f2bddd7ca872e4be',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dscqcrl32/image/upload/v1691774355/YELPCAMP/mt80tz6exrfewww5wgbq.jpg',
               
                },
                {
                  url: 'https://res.cloudinary.com/dscqcrl32/image/upload/v1691774354/YELPCAMP/ki1ikrrzugpwcss7yq06.jpg',
               
                }
              ],
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque sit eveniet, commodi vero sed, aperiam deserunt obcaecati, magni quaerat excepturi eaque dignissimos! Consequatur doloribus molestiae quam, explicabo repudiandae commodi impedit.",
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})