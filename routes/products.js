const express = require('express');
const router = express.Router();
const multer = require('multer');
const {database} = require('../config/helpers');



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req,file,cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
});

const filefilter =  (req,file,cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
        cb(null,true);
    } else {
        cb(null,false);
    }

};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6
    },
    fileFilter: filefilter,
});

/* GET All Products */
router.get('/', function(req, res) {


  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; // Set the limit to 10 per page


  let startValue;
  let endValue;


  if (page > 0) {
    startValue = (page * limit) - limit;
    endValue = page * limit;
  }else {
    startValue = 0;
    endValue = 10;
  }

  database.table('products as p')
      .join([{
        table: 'categories as c',
        on: 'c.CatID = p.CatID'
      }])
      .withFields([
          'c.CatName as category',
          'p.Title as name',
          'p.price',
          'p.quantity',
          'p.PID',
          'p.featuredImage',
          'p.images',
      ])
      .slice(startValue, endValue)
      .sort({PID: .1})
      .getAll()
      .then(prods => {
        if (prods.length > 0 ) {
          res.status(200).json({
            count: prods.length,
            products: prods
          });
        } else {
          res.json({message: 'No Products were found'});
        }
      }).catch( err => console.log(err));

});


/* Get Single Product*/

router.get('/:pid', (req, res) => {

    let productID = req.params.pid;
    console.log(productID);

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: 'c.CatID = p.CatID'
        }])
        .withFields([
            'c.CatName as category',
            'p.Title as name',
            'p.price',
            'p.quantity',
            'p.PID',
            'p.featuredImage',
            'p.images',
        ])
        .filter({'p.PID': productID})
        .get()
        .then(prods => {
            if (prods) {
                res.status(200).json(prods);
            } else {
                res.json({message: 'No Product was found matching this product ID'});
            }
        }).catch( err => console.log(err));
})


/* Fetch products from Category */

router.get('/category/:catName', (req, res) => {



    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; // Set the limit to 10 per page


    let startValue;
    let endValue;

    let category_title = req.params.catName;

    if (page > 0) {
        startValue = (page * limit) - limit;
        endValue = page * limit;
    }else {
        startValue = 0;
        endValue = 10;
    }

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.CatID = p.CatID WHERE c.CatName LIKE '%${category_title}%'`
        }])
        .withFields([
            'c.CatName as category',
            'p.Title as name',
            'p.price',
            'p.quantity',
            'p.PID',
            'p.featuredImage',
            'p.images',
        ])
        .slice(startValue, endValue)
        .sort({PID: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0 ) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: `No Products were found from ${category_title}`});
            }
        }).catch( err => console.log(err));


});


router.post('/new', upload.array('images', 20), (req, res) => {
    const allImages = req.files;
    
    const featuredImage = allImages[0].path;
    
    // console.log('Featured image : ' + allImages[0].path);

    let remainingImages = '';
    for(let i = 1; i < allImages.length; i++) {
        remainingImages += allImages[i].path;
        if (i === allImages.length - 1) {
        } else {remainingImages += ',,,';}
    }
    console.log('remaining Images : ' + remainingImages);

    // All Above are working perfect;  Feautured image, and remaining images;

    //Insert into Database

    database 
        . table ( 'products' ) 
            . insert ( { 
                Title : req.body.title , 
                Description : req.body.description , 
                featuredImage : featuredImage ,
                images: remainingImages,
                Price: req.body.price,
                Quantity: req.body.qty,
                CatID: req.body.CID,
                CO2: req.body.co2,
            } ) 
        . then ( lastId  =>  { 
            console.log(lastId);
            res.json({
                message: `Product create was a success, your Product ID is : ${lastId}`,
                success: true,
            });

        } )

});

module.exports = router;
