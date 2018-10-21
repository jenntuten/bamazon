let mysql = require("mysql");
let inquirer = require('inquirer');
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
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
        ]).then(function (user) {
            let itemSelected;
            for (var p = 0; p < res.length; p++) {
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
                                console.log('That will be $' + (itemSelected.price * user.units));
                                //console.log('New Quantity is '+newQty+' units.')
                                shop();
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