const controlCash = (() => {
    //Constructor to create expense
    const Expense = function (id, descr, val, calendar) {
        this.id = id;
        this.descr = descr;
        this.val = val;
        this.calendar = calendar
    }
    //Constructor to create income
    const Income = function (id, descr, val, calendar) {
        this.id = id;
        this.descr = descr;
        this.val = val;
        this.calendar = calendar
    }

    const calculateTotal = (type) => {
        //0 for start
        let sum = 0;
        //taking all items and add val to previous - sum = sum +cur.val
        data.allItems[type].forEach(cur => sum += cur.val);
        //assign to data .total[type]
        data.total[type] = sum;
    }

    //All necessary data here
    let data = {
        allItems: {
            //arrays
            inc: [],
            exp: []
        },
        total: {
            //totals
            inc: 0,
            exp: 0,
        },
        budget: 0,
        percentage: -1
    }
    //particular methods to operate on data
    return {
        addItem: (type, descr, val, calendar) => {
            //newItem variable - every item added after click, ID will be set as id(constructor function argument).
            let newItem, ID
            //setting unique ID (++)
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Incomes - ID used as id from constuctor function. Descr and val used as descr and val from constuctor
            if (type === "inc") {
                newItem = new Income(ID, descr, val, calendar)
                //Expenses
            } else if (type === "exp") {
                newItem = new Expense(ID, descr, val, calendar)
            }
            //push to array and return 
            data.allItems[type].push(newItem);
            return newItem
        },

        deleteItem: (type, id) => {
            //ids for setting all elements in array and later map it. index is a variable to get indexOf specific id.
            let ids, index
            ids = data.allItems[type].map((cur) => {
                return cur.id
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                //deleting specific item - now we have an array without deleted item (splice)
                data.allItems[type].splice(index, 1);
            }
        },

        calculateSum: () => {
            //calculate sum of incomes and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate budget
            data.budget = data.total.inc - data.total.exp;
        },

        getSum: () => {
            return {
                //creating variables to be used in controllApp.updateSummary function
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp

            }
        },


        persistData: () => {
            //localSorage typical use (name for item, item stored - array in this case)
            localStorage.setItem('inc', JSON.stringify(data.allItems['inc']));
            localStorage.setItem('exp', JSON.stringify(data.allItems['exp']))
        },

        readStorage: () => {
            const incomesStorage = JSON.parse(localStorage.getItem('inc'));
            const expensesStorage = JSON.parse(localStorage.getItem('exp'));
            // Restoring from the localStorage by "name for item"
            if (incomesStorage) data.allItems['inc'] = incomesStorage;
            if (expensesStorage) data.allItems['exp'] = expensesStorage;
            // DO NOT DELETE - It will loose localStorage :(
        }
    }


})();




const controlUI = (() => {
    //all elements renamed to use it in querySelectors
    const elementsDOM = {
        //inputs
        inputType: '.add-type',
        inputDescr: '.description',
        inputVal: '.amount',
        inputBtn: '.add-position',
        //lists of items
        incomesList: '.incomes-list',
        expensesList: '.expenses-list',
        positions: '.positions',
        //total budgets
        totalBudget: '.budget-total',
        totalIncomes: '.budget-incomes',
        totalExpenses: '.budget-expenses',
        //deleteLocalStorage Button
        delStorage: '.localStorageDelete',
        //calendar
        inputCalendar: '.date'
    }

    return {
        getInput: () => {
            return {
                //renaming and getting inputs 
                type: document.querySelector(elementsDOM.inputType).value, // Will be inc and exp - both
                descr: document.querySelector(elementsDOM.inputDescr).value,
                val: parseFloat(document.querySelector(elementsDOM.inputVal).value), //To return a number, not string
                calendar: document.querySelector(elementsDOM.inputCalendar).value

            }
        },


        addListedItem: (obj, type) => {
            let html, newHtml, element;
            //html is html for list item, newHtml is to change templates (i.e. %val%), element is to put new item in correct place
            if (type === "inc") {
                element = elementsDOM.incomesList;
                //html to be put in relevant place
                html = '<div class = "itemContInc" id="inc-%id%">  <h4 class="numbers">%val% PLN</h4> <p>%descr%</p>  <div>  <button class = "deleteBtn ui inverted purple button mini">X</button></div> <p>%cal%</p></div>'
            } else if (type === "exp") {
                element = elementsDOM.expensesList;
                html = '<div class = "itemContExp" id="exp-%id%">  <h4 class="numbers">%val% PLN</h4> <p>%descr%</p>   <div> <button class = "deleteBtn ui inverted purple button mini">X</button></div> <p>%cal%</p> </div>'
            }
            //putting exact data in template
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%descr%', obj.descr); //newHtml.replace to change everything, not html.replace
            newHtml = newHtml.replace('%val%', obj.val);
            //If there is no date provided, there is "===" as a date
            obj.calendar !== "" ? newHtml = newHtml.replace('%cal%', obj.calendar) : newHtml = newHtml.replace('%cal%', "===");
            //code to execute it (element = exp or inc list, beforeend - end of list, newHtml - exact list item)
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

        },

        delListedItem: (selected) => {
            //selected will be Item ID
            let el = document.getElementById(selected);
            //One up in controlDel, that is why removeChild is used.
            el.parentNode.removeChild(el);

        },

        clearInput: () => {
            //clearing both input places
            document.querySelector(elementsDOM.inputDescr).value = "";
            document.querySelector(elementsDOM.inputVal).value = ""

        },

        displaySums: (obj) => {

            //putting text content as per getSum variables - budget - data.budget (as per data in controlCash)
            document.querySelector(elementsDOM.totalBudget).textContent = "Reszta: " + Math.round(obj.budget * 100) / 100 + " PLN";
            document.querySelector(elementsDOM.totalIncomes).textContent = "Przychody: " + Math.round(obj.totalInc * 100) / 100 + " PLN";
            document.querySelector(elementsDOM.totalExpenses).textContent = "Wydatki: " + Math.round(obj.totalExp * 100) / 100 + " PLN";
        },

        getElementsDOM: function () {
            //to have elementsDOM list also in controlApp section
            return elementsDOM;

        }
    }

})();




const controlApp = ((controlCash, controlUI) => {
    const handles = () => {
        //invoking function to get elementsDOM
        const DOM = controlUI.getElementsDOM();
        //inputBtn - Adding
        document.querySelector(DOM.inputBtn).addEventListener('click', controlAdd);
        //To make "enter" key working
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                controlAdd();
            }
        });
        //delete button (position in the bracket, because we will step down - parent node) to delete
        document.querySelector(DOM.positions).addEventListener('click', controlDelete);
        //simple deleteStorage and reload functions added to deleteStorage button
        document.querySelector(DOM.delStorage).addEventListener('click', deleteStorage);

    }

    const updateLists = () => {
        let inputInc, inputExp
        //for both types
        inputInc = JSON.parse(localStorage.getItem('inc'));
        inputExp = JSON.parse(localStorage.getItem('exp'));
        //if (inputInc) - if there is any localStorage for "inc"
        if (inputInc)
            for (i = 0; i < inputInc.length; i++) {
                //same function used to add List Items
                controlUI.addListedItem(inputInc[i], "inc");
            }
        //as mentioned before
        if (inputExp)
            for (i = 0; i < inputExp.length; i++) {
                controlUI.addListedItem(inputExp[i], "exp");
            }


    }

    const updateSummary = () => {
        // exact information how to count budget, expenses and incomes
        controlCash.calculateSum();
        // returning exact numbers from data and rename relevant data. fields + saving everything in "const =budget"
        const budget = controlCash.getSum();
        //displaing everything with const=budget as an argument
        controlUI.displaySums(budget)
    }


    const controlAdd = () => {
        let input, newItem
        //input to get input (control UI - enterred data), newItem to add it to arrays
        input = controlUI.getInput();

        //for test purposes
        console.log(input);
        if (input.descr !== '' && !isNaN(input.val) && input.val > 0) {
            //adding Item
            newItem = controlCash.addItem(input.type, input.descr, input.val, input.calendar);
            console.log(newItem)
        }
        //Add Item to the list
        controlUI.addListedItem(newItem, input.type);
        //clear List
        controlUI.clearInput();
        //update Sums
        updateSummary();
        //saving in LocalStorage
        controlCash.persistData();
    }

    const deleteStorage = () => {
        //If there is a confirmation deleteLocalStorage and reload to see the result rightaway
        if (confirm("Chcesz usunąć wszystkie zapisane dane?")) {
            localStorage.clear();
            window.location.reload()
        }
        else { alert("Dane nie zostały usunięte") }
    }

    const controlDelete = (e) => {
        let itemID, splitID, type, ID
        //1 container up - to delete full container
        itemID = e.target.parentNode.parentNode.id;
        if (itemID) {
            if (confirm("Usunąć wpis?")) {
                //If there is a confirmation
                //searching for ID - parts from class of parentNode container
                splitID = itemID.split("-");
                type = splitID[0];
                ID = parseInt(splitID[1]);
                //deleteItem (from data), not from UI
                controlCash.deleteItem(type, ID)
                //deleteitem from UI
                controlUI.delListedItem(itemID);
                //update Sums
                updateSummary();
                ////save in LocalStorage
                controlCash.persistData();
            } else {
                alert("Wpis nie został usunięty")
            }
        }
    }
    //setting all handles
    return {
        initialize: () => {
            //readStorage needed to keep sums and added items in place.
            controlCash.readStorage();
            updateLists();
            updateSummary();
            handles();
        }
    }

})(controlCash, controlUI);

//setting all handles - must be invoked outside
controlApp.initialize();

