var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306, //8889,
    user: 'root',
    password: 'password',
    database: 'bamazon_DB'
});

connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  displayItems();
});



function displayItems(){
    connection.query("SELECT * FROM bamazon_DB.items", function(err, res){
        if (err) throw err;
        console.log('These are the items in our inventory');

        for(i=0; i<res.length; i++){
            console.log(`${res[i].id} | ${res[i].product_name} | ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity}`);
        }
        getItemInfo();
    })
    
}




function getItemInfo(){
        inquirer.prompt([
            {
            name: "selectedId",
            type: "input",
            message: "enter the id number of the item you would like to purchase"
            },
            {
            name: "quantity",
            type: "input",
            message: "Please enter the number of items you would like to purchase"
            }
        ]).then(function(answer){
            connection.query("SELECT * FROM bamazon_DB.items", function(err, res){
            if (err) throw err;
            
            var selectedItem;
            var quantity;
            //console.log(res);
            for(var i=0; i<res.length; i++){

                if(parseInt(answer.selectedId) === res[i].id){
                    selectedItem = res[i];
                    if(selectedItem.stock_quantity < answer.quantity){
                        
                        inquirer.prompt({
                        name: "revisePurchase",
                        type: "confirm",
                        message: "We do not have enough in stock, Would you like to revise your purchase?"
                        }).then(function(answer){
                            if(answer.revisePurchase === true){
                                displayItems();
                            }else{
                                console.log('Thanks for shopping at Bamazon!');
                            }
                        });
                }else{
                    
                quantity = res[i].stock_quantity - answer.quantity;
                updateDb(quantity, selectedItem.id);
                inquirer.prompt({
                    name: "anotherPurchase",
                    type: "confirm",
                    message: "Would you like to make another purchase?"
                }).then(function(answer){
                    if(answer.anotherPurchase === true){
                        displayItems();
                    }else{
                        console.log('Thanks for shopping at Bamazon!');
                    }
                })
                }
                }    
            }
            
        });
});
}

function updateDb(quantity, selectedId){
    connection.query(
        "UPDATE items SET ? WHERE ?",
        [
            {
                stock_quantity: quantity
            },
            {
                id: selectedId
            }
        ]
    )
    console.log('your order has been placed');
   
}

   




