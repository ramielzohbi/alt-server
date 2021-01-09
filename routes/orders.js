const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');


router.get('/', (req,res) => {

   database.table('orderDetails as OD')
       .join([
           {
               table: 'orders as O',
               on: 'O.OID = OD.OID'

           },
           {
               table: 'products as P',
               on: 'P.PID = OD.PID'
           },
           {
               table: 'users as U',
               on: 'U.UID = O.UID'
           }
       ])
       .withFields([
           'O.OID',
           'P.Title as name',
           'P.Description',
           'P.Price',
           'U.FullName',
           'U.BusinessName',
       ])
       .sort({OID : -1})
       .getAll()
       .then( orders => {
           if (orders.length > 0) {
               res.status(200).json(orders)
           } else {
               res.json({message: 'No Orders Found'})
           }
       }) .catch(err => console.log(err));

});


router.get('/:order_id', (req,res) => {

    let order_id = req.params.order_id;

    database.table('orderDetails as OD')
        .join([
            {
                table: 'orders as O',
                on: 'O.OID = OD.OID'

            },
            {
                table: 'products as P',
                on: 'P.PID = OD.PID'
            },
            {
                table: 'users as U',
                on: 'U.UID = O.UID'
            }
        ])
        .withFields([
            'O.OID',
            'P.Title as name',
            'P.Description',
            'P.Price',
            'U.FullName',
            'U.BusinessName',
        ])
        .filter({'O.OID' : order_id})
        .getAll()
        .then( orders => {
            if (orders) {
                res.status(200).json(orders)
            } else {
                res.json({message: `Order number ${order_id} is not found`})
            }
        }) .catch(err => console.log(err));

});

/* Place a new Order */

router.post('/new', (req,res) => {
   let {userID, products} = req.body;

   console.log(`user ID is : ${userID}, and products are ${products.toJSON()}`);

   
   
   if (userID !== 0 && userID > 0 && !isNaN(userID)) {
       database.table('orders')
           .insert({
               UID: userID,
           }).then(newOrderID => {
   
               if (newOrderID > 0) {
                   products.forEach( async (p) => {
                       let data = await database.table('products').filter({id: p.PID}) .withFields(['Quantity']).get();
   
   
   
                       // Deduct from qty
                       let inCart = p.QtyInCart;
   
                       if (data.Quantity > 0) {
                           data.Quantity = data.Quantity - inCart;
   
                           if (data.Quantity < 0 ) {
                               data.Quantity = 0;
                           }
   
                       } else {
                           data.Quantity = 0;
   
                       }
                    // Insert into Order Details
   
                        database.table('orderDetails')
                            .insert({
                                OID: newOrderID,
                                PID: p.PID,
                                quantity: inCart
   
                            }).then(newID => {
                                database.table('products')
                                     .filter({PID: p.PID})
                                    .update({Quantity: data.Quantity})
                                    .then(successNum => {})
                                    .catch(err => console.log(err))
   
                        }).catch(err => console.log(err));
                   });
   
               } else {
                   res.json({message: 'New Order failed while adding your order details', success: false});
               }
               res.json({
                   message: `Order was a success, your order ID is : ${newOrderID}`,
                   success: true,
                   order_id: newOrderID,
                   products: products,
               });
   
       }).catch(err => console.log(err));
   }
    else{
        res.json({message: 'New Order Failed', success: false})
   }

});



module.exports= router;