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
//Establish connection to mySQL database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    fs.writeFile("bamazonCart.txt", "", function(err) {
        if ( err ) return console.log(err);
        console.log("You have $0 in your cart. Start shopping!");
    }); 
    shop();
});
function shop() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (let m = 0; m < res.length; m++) {
            itemid = res[m].item_id;
        }
        inquirer.prompt([
            {
                type: "list",
                name: "choices",
                message: "Which item would you like to buy?",
                choices: function () { 
                    return res.map(item => `${item.item_id} | ${item.product_name} | $${item.price} | ${item.stock_quantity} available`);
                    console.log('user choices',user.choices)
                }
            },
            {
                type: "input",
                name: "units",
                message: "How many units would you like to buy?",
            },
            
        ]).then(function (user) {
            let itemSelected;
//Matches user's choice to the appropriate item in the database    
            for (let p = 0; p < res.length; p++) {
                if (res[p].item_id + " | " + res[p].product_name + " | $" + res[p].price + " | " + res[p].stock_quantity + " available" === user.choices) {
                    itemSelected = res[p];
//Returns whether the quantity is sufficient - the user is notified either way
                    if (itemSelected.stock_quantity < user.units) {
                        console.log('Not enough in stock!');
                        shop();
                    }
                    else {
                        console.log('Plenty in stock!');
                        console.log('Item Selected: ', user.choices);
                        let newQty = itemSelected.stock_quantity - user.units;
                        connection.query(
                            "UPDATE products SET stock_quantity = " + newQty + "WHERE product_name = " + itemSelected.product_name,
                            function (err, res) {
                                let userPrice = itemSelected.price*user.units;
                                //Adds userPrice to bamazonCart.txt
                                fs.appendFile("bamazonCart.txt", ", " + userPrice, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log('Added to cart!')
                                    inquirer.prompt([
                                        {
                                            type: "list",
                                            name: "complete",
                                            message: "Will this complete your order?",
                                            choices: ['Done shopping', 'Continue Shopping']
                                        }
                                    ]).then(function(checkout) {
                                        //Displays totals as user adds items to the cart, and when the user checks out
                                    if (checkout.complete === 'Done shopping') {
                                        fs.readFile("bamazonCart.txt", "utf8", function (err, data) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                            data = data.split(", ");
                                            let result = 0;
                                            for (let i = 0; i < data.length; i++) {
                                                if (parseFloat(data[i])) {
                                                    result += parseFloat(data[i]);
                                                }
                                            }
                                            console.log("Thanks for shopping with Bamazon! Your total is $" + result.toFixed(2)+".");
                                            //Exits so new commands can be entered in the terminal
                                            process.exit()
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
                                    })
                                });
                                console.log('New Quantity is '+newQty+' units.')
                            }
                        );
                    }
                }
            }
        });
    });
}