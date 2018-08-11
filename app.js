
// Budget Controller

var budgetController = (function() {

    //  expense constructor 

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentages = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    };

    // income constructor 

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        })
        data.totals[type] = sum;

    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    }
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            // create new id
                // last id plus one
                if(data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0
                }
            

            // create inc or exp type
            if(type === 'exp') {
                newItem = new Expense(ID,  des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // push type to data arrays

            data.allItems[type].push(newItem)

            // return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id
            });
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            // calculate total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate budget

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
           
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentages(data.totals.inc);
            });

        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
    
        testing: function() {
            console.log(data)
        }
    }
        
    
})();

// UI Controller

var UIController = (function() {

    var UIDOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        button: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        exenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type) {
        //  + or - before number
        //  2 decimal points
        //  comma separating the thousands
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : '+')+ ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0;  i < list.length; i++) {
            callback(list[i], i)
        };
    };
     return {
         getInputVal: function() {
             return {
                type: document.querySelector(UIDOMstrings.inputType).value, //exp or inc
                des: document.querySelector(UIDOMstrings.inputDescription).value,
                val: parseFloat(document.querySelector(UIDOMstrings.inputValue).value),
             }
         },
         displayPercentages: function(percentage) {
            var fields = document.querySelectorAll(UIDOMstrings.expensesPerLabel);


            nodeListForEach(fields, function(current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent =   '---';
                }
            });
         },
    
         getUIDOMStrings: function() {
            return UIDOMstrings; 
         },
   
         addListItem: function(obj, type) {
             var html, newHtml, element;

             if(type === 'inc') {
         
                 element = UIDOMstrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
             } else if (type === 'exp') {
                 element = UIDOMstrings.expenseContainer;
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
             }

             newHtml = html.replace('%id%', obj.id);
             newHtml = newHtml.replace('%description%', obj.description);
             newHtml = newHtml.replace('%value%', formatNumber( obj.value, type));
             
             document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

         },

         clearFields: function() {
             var fields, fieldsArr;

             fields = document.querySelectorAll(UIDOMstrings.inputDescription + ', ' + UIDOMstrings.inputValue);

             fieldsArr = Array.prototype.slice.call(fields);

             fieldsArr.forEach(function(current, index, array) {
                 current.value = "";
             })

             fieldsArr[0].focus()
         },

         displayMonth: function() {
             var now, year;
            
             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();

             var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

             var totMon = months[month];


             document.querySelector(UIDOMstrings.dateLabel).textContent = totMon + ' ' + year;
         },
         changedType: function() {
           var fields = document.querySelectorAll( UIDOMstrings.inputType + ',' + UIDOMstrings.inputDescription + ',' + UIDOMstrings.inputValue);

           nodeListForEach(fields, function(cur) {
               cur.classList.add('red-focus');
           });
           document.querySelector(UIDOMstrings.button).classList.toggle('red')
         },

         deleteListItem: function(selectedID) {
             var el = document.getElementById(selectedID);
             el.parentNode.removeChild(el);
         },
         displayBudget: function(obj) {

            obj.budget > 0 ? type = 'inc': type = 'exp';
             document.querySelector(UIDOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             document.querySelector(UIDOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
             document.querySelector(UIDOMstrings.exenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

             if(obj.percentage > 0) {
                document.querySelector(UIDOMstrings.percentageLabel).textContent = obj.percentage + '%';
             } else {
                document.querySelector(UIDOMstrings.percentageLabel).textContent = '---'; 
             }
             
         }


        
         
     }
})();

// App Controller

var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
  
    var DOM = UIController.getUIDOMStrings();
    document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {
        if(e.keyCode === 13 || e.which === 13) {
            ctrlAddItem();
        }
    })
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  }
   
    var updateBudget = function() {
        // calculate the budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        // display in UI
        UICtrl.displayBudget(budget)
    }
    var calculatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();
        // read percentages
        var percentages = budgetCtrl.getPercentages();
        // update UI
        UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem = function() {

        var input, newItem;
        //  get input data 
        input = UICtrl.getInputVal();
      
        if(input.des !== "" && !isNaN(input.val) && input.val > 0) {
            // add data to budgetcontroller
            newItem = budgetCtrl.addItem(input.type, input.des, input.val)
                    
            // display data
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            // update percentages
            calculatePercentages();
        }
       
    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID)
            // delete item from UI
            UICtrl.deleteListItem(itemID);
            // update and show new budget
            updateBudget();
            // update percentages
            calculatePercentages();
        }
        
        
    }

    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();