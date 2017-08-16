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
  startPage();
});



function startPage(){
    inquirer.prompt({
        name: "start",
        type: "list",
        message: "What would you like to do?",
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'] 
    }).then(function(answer){
        switch(answer.start){
            case 'View Products for Sale':
                displayItems();
                break;
           
            case 'View Low Inventory':
                viewLowInventory();
                break;
            
            case 'Add to Inventory':
                addToInventory();
                break;
            
            case 'Add New Product':
                addNewProduct();
                break;
        }
        })     
    }
   


function displayItems(){
    connection.query("SELECT * FROM bamazon_DB.items", function(err, res){
        if (err) throw err;
        console.log('These are the items in our inventory');

        for(i=0; i<res.length; i++){
            console.log(`${res[i].id} | ${res[i].product_name} | ${res[i].department_name} | $ ${res[i].price} | ${res[i].stock_quantity}`);
        }
    })
}


function viewLowInventory(){
     connection.query("SELECT * FROM bamazon_DB.items", function(err, res){
        if (err) throw err;
        console.log('These Items are running low');

        for(i=0; i<res.length; i++){
            if(res[i].stock_quantity < 5){
            console.log(`${res[i].id} | ${res[i].product_name} | ${res[i].department_name} | $ ${res[i].price} | ${res[i].stock_quantity}`);
            }
        }
    })
    returnHome();
}

function addToInventory(){
   
    displayItems();
    inquirer.prompt([
            {
            name: "selectedId",
            type: "input",
            message: "enter the id number of the item you would like to add"
            },
            {
            name: "quantity",
            type: "input",
            message: "Please enter the number of items you would like to add to the inventory"
            }
        ]).then(function(answer){
            connection.query("SELECT * FROM bamazon_DB.items", function(err, res){
            if (err) throw err;

            var selectedItem;
            var quantity;

            for(var i=0; i<res.length; i++){
                if(parseInt(answer.selectedId) === res[i].id){
                    selectedItem = res[i];
                    quantity = parseInt(res[i].stock_quantity) + parseInt(answer.quantity);
                }
            }

            updateDb(quantity, selectedItem.id);
            returnHome();

            })
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
    console.log(`you have succesfully updated the inventory`);
    
}


function addNewProduct(){
    inquirer.prompt([
        {
        name: "productName",
        type: "input",
        message: "enter the name of the item you would like to add"
        },
        {
        name: "productDepartment",
        type: "input",
        message: "enter the Department of the item you would like to add"
        },
        {
        name: "productPrice",
        type: "input",
        message: "enter the price of the item you would like to add"
        },
         {
        name: "productQuantity",
        type: "input",
        message: "enter the number of items you would like to add"
         }
    ]).then(function(answer){
        var sql = "INSERT INTO items(product_name, department_name, price, stock_quantity) VALUES ?"
        var values = [
            [
            answer.productName,
            answer.productDepartment,  
            answer.productPrice,  
            answer.productQuantity
            ]
        ];
       
        connection.query(sql, [values], function(err, res){
            if(err) throw err;
            console.log("Item added");
            returnHome();
        }

          
        )
    })
}

function returnHome(){
    inquirer.prompt({
        name: 'return',
        type: 'confirm',
        message: 'would you like to return to the start page?'
    }).then(function(answer){
        if(answer.return === true){
            startPage();
        }else{
            console.log('have a nice day');
        }
    })
}