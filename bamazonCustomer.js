let mysql = require("mysql");
let inquirer = require('inquirer');
let fs = require('fs');
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "monday10",
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    fs.writeFile("bamazonCart.txt", "", function(err) {
        if ( err ) return console.log(err);
        console.log("You have $0 in your cart. Start shopping!");
    }); 
    shop();
});
//node bamazonCustomerConnection
//The app should then prompt users with two messages.

//The first should ask them the ID of the product 
//they would like to buy.

//The second message should ask how many units 
//of the product they would like to buy.*/

function shop() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //console.log('results',res)
        for (let m = 0; m < res.length; m++) {
            // console.log('Item ID: ', res[m].item_id);
            itemid = res[m].item_id;
        }
        inquirer.prompt([
            {
                type: "rawlist",
                name: "choices",
                message: "Which item would you like to buy?",
                choices: function () {
                    return res.map(function (item) {
                        return item.product_name;
                    });
                }
            },
            {
                type: "input",
                name: "units",
                message: "How many units would you like to buy?",
            },
            {
                type: "list",
                name: "complete",
                message: "Will this complete your order?",
                choices: ['Done shopping', 'Continue Shopping']
            }
        ]).then(function (user) {
            let itemSelected;
            for (let p = 0; p < res.length; p++) {
                if (res[p].product_name === user.choices) {
                    itemSelected = res[p];
                    //console.log('chosen Item name',itemSelected.product_name);
                    if (itemSelected.stock_quantity < user.units) {
                        console.log('Not enough in stock!');
                        shop();
                    }
                    else {
                        console.log('Plenty in stock!');
                        let newQty = itemSelected.stock_quantity - user.units;
                        connection.query(
                            "UPDATE products SET stock_quantity = " + newQty + "WHERE product_name = " + itemSelected.product_name,
                            function (err, res) {
                                let userPrice = itemSelected.price*user.units;
                                console.log('That will be $' + userPrice);
                                fs.appendFile("bamazonCart.txt", ", " + userPrice, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log('Added to cart!')
                                    if (user.complete === 'Done shopping') {
                                        fs.readFile("bamazonCart.txt", "utf8", function (err, data) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            //console.log(data)
                                            data = data.split(", ");
                                            let result = 0;
                                            for (let i = 0; i < data.length; i++) {
                                                if (parseFloat(data[i])) {
                                                    result += parseFloat(data[i]);
                                                }
                                            }
                                            console.log("Thanks for shopping with Bamazon! Your total is $" + result.toFixed(2)+".");
                                        });
                                    }
                                    else {
                                        fs.readFile("bamazonCart.txt", "utf8", function (err, data) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            data = data.split(", ");
                                            let result = 0;
                                            for (let i = 0; i < data.length; i++) {
                                                if (parseFloat(data[i])) {
                                                    result += parseFloat(data[i]);
                                                    console.log("You have a total of $" + result.toFixed(2)+" in your cart.");
                                                }
                                            }
                                        });
                                        shop();
                                    }
                                });
                                //console.log('New Quantity is '+newQty+' units.')
                            }
                        );
                    }
                }
            }
            console.log('Item Selected: ', user.choices);
            let qty = user.units;
            console.log('Qty: ', qty)
        });
    });
}