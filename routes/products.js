const express = require('express');
const router = express.Router();

const {database} = require('../config/helpers');

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


module.exports = router;
