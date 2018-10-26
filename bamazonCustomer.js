let mysql = require("mysql");
let inquirer = require('inquirer');
let confirm = require('inquirer-confirm');
let chalk = require('chalk');
let fs = require('fs');
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "monday10",
    database: "bamazon"
});
//Establishes connection to mySQL database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    fs.writeFile("bamazonCart.txt", "", function (err) {
        if (err) return console.log(err);
        console.log("You have $0 in your cart. Start shopping!");
    });
    shop();
});
//Displays items from database for user to choose from
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
                }
            },
            {
                type: "input",
                name: "units",
                message: "How many would you like to buy?",
            },
        ]).then(function (user) {
            let itemSelected;
            //Matches user's choice to the appropriate item in the database    
            for (let p = 0; p < res.length; p++) {
                if (res[p].item_id + " | " + res[p].product_name + " | $" + res[p].price + " | " + res[p].stock_quantity + " available" === user.choices) {
                    itemSelected = res[p];
                    //Returns whether the quantity is sufficient - the user is notified either way
                    if (itemSelected.stock_quantity < user.units) {
                        console.log(chalk.red('Not enough in stock!'));
                        //Returns to list of items available for purchase
                        shop();
                    }
                    else {
                        console.log(chalk.green('Plenty in stock!'));
                        console.log('Item Selected: ', user.choices);
                        let newQty = itemSelected.stock_quantity - user.units;
                        //Updates database with new quantity
                        connection.query(
                            "UPDATE products SET stock_quantity = " + newQty + " WHERE product_name = " + '"' + itemSelected.product_name + '"',
                            function (err, res) {
                                let userPrice = itemSelected.price * user.units;
                                //Adds userPrice to bamazonCart.txt
                                fs.appendFile("bamazonCart.txt", ", " + userPrice, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    console.log('Added to cart!')
                                    //Asks customer if they would like to continue shopping (y/n)
                                    confirm('Would you like to buy more items?')
                                        .then(function confirmed() {
                                            //Allows customer to continue shopping and displays total price of the items they've chosen so far
                                            fs.readFile("bamazonCart.txt", "utf8", function (err, data) {
                                                if (err) {
                                                    return console.log(err);
                                                }
                                                data = data.split(", ");
                                                let result = 0;
                                                for (let i = 0; i < data.length; i++) {
                                                    if (parseFloat(data[i])) {
                                                        result += parseFloat(data[i]);
                                                        console.log("You have a total of $" + result.toFixed(2) + " in your cart.");
                                                    }
                                                }
                                            });
                                            shop();
                                        }, function cancelled() {
                                            //Checks out customer and displays final total
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
                                                console.log("Thanks for shopping with Bamazon! Your total is $" + result.toFixed(2) + ".");
                                                //Exits so new commands can be entered in the terminal
                                                process.exit()
                                            });
                                        });
                                });
                            }
                        );
                    }
                }
            }
        });
    });
}