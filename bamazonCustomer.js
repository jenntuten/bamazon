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
console.log(chalk.cyan('Welcome to Bamazon!'));
//Establishes connection to mySQL database.
connection.connect(function (err) {
    if (err) {
        return console.log(err)
    }
    console.log("connected as id " + connection.threadId);
    fs.writeFile("bamazonCart.txt", "", function (err) {
        if (err) return console.log(err);
    });
    shop();
});
//Displays items from database for user to choose from.
function shop() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            return console.log(err);
        }
        for (let m = 0; m < res.length; m++) {
            let inventoryList = res[m];
            console.log(`${inventoryList.item_id} | ${inventoryList.product_name} | $${inventoryList.price.toFixed(2)} | ${inventoryList.stock_quantity} available`)
        }
        inquirer.prompt([
            {
                type: "input",
                name: "choices",
                message: "Which item ID would you like to buy?"
            },
            {
                type: "input",
                name: "units",
                message: "How many would you like to buy?",
            },
        ]).then(function (user) {
            let userId = user.choices
            connection.query("SELECT * FROM products WHERE ?", { item_id: userId }, function (err, res) {
                if (err) {
                    return console.log(err);
                }
                //Checks that the item ID entered is a valid item.
                if (res.length < 1) {
                    console.log(chalk.bold.magenta('Invalid item number. Please select a different item number.'));
                    shop();
                }
                else {
                    let productName = res[0].product_name;
                    let itemPrice = res[0].price.toFixed(2);
                    let quantity = res[0].stock_quantity;
                    if (quantity < user.units) {
                        console.log(chalk.red('Not enough in stock!'));
                        //Returns to list of items available for purchase.
                        shop();
                    }
                    else {
                        let newQty = quantity - user.units;
                        //Checks that the quantity entered is a valid number. 
                        //If this and the item number are invalid, only the error message for the invalid item number will be displayed.
                        if (isNaN(newQty)) {
                            console.log(chalk.bold.magenta('Please choose a quantity.'));
                            shop();
                        }
                        else {
                            console.log(chalk.green('Plenty in stock!'));
                            //Updates database with new quantity.
                            if (user.units < 2) {
                                console.log(chalk.magenta(`You have selected ${user.units} unit of ${productName}.`))
                            }
                            else {
                                console.log(chalk.magenta(`You have selected ${user.units} units of ${productName}.`))
                            }
                            connection.query(
                                "UPDATE products SET stock_quantity = " + newQty + " WHERE item_id = " + userId,
                                function (err, res) {
                                    let userPrice = itemPrice * user.units;
                                    //Adds userPrice to bamazonCart.txt.
                                    fs.appendFile("bamazonCart.txt", ", " + userPrice, function (err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        //Asks customer if they would like to continue shopping (y/n).
                                        keepShopping();
                                    });

                                });
                        }
                    }
                }
            })
        })
        function keepShopping() {
            confirm('Would you like to buy more items?')
                .then(function confirmed() {
                    //Allows customer to continue shopping and displays total price of the items they've chosen so far.
                    checkTotal();
                    shop();
                }, function cancelled() {
                    //Checks out customer and displays final total.
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
                        //Exits so new commands can be entered in the terminal.
                        process.exit();
                    })
                })
        }
    })
}
function checkTotal() {
    //This displays the current and previous totals each time an item is added to the cart until the user checks out.
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
}