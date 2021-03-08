
//selectors
const loginButton = document.querySelector('.login_button');

const todoInput = document.querySelector('.todo_input');
const todoButton = document.querySelector('.todo_button');
const todoList = document.querySelector('.todo_list');

const header = document.querySelector('.header');

const buyQuantity = document.querySelector('.buy_quantity');
const buyPrice = document.querySelector('.buy_price');
const sellQuantity = document.querySelector('.sell_quantity');
const sellPrice = document.querySelector('.sell_price');

//used to get hash of query string for SIGNED queries
const makeQueryString = q =>
  q
    ? `${Object.keys(q)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
        .join('&')}`
    : ''

// TEMPORARY
const sampleTrade = {
    "buyer": false,
    "commission": "-0.07819010",
    "commissionAsset": "USDT",
    "id": 698759,
    "maker": false,
    "orderId": 25851813,
    "price": "7819.01",
    "qty": "0.002",
    "quoteQty": "15.63802",
    "realizedPnl": "-0.91539999",
    "side": "SELL",
    "positionSide": "SHORT",
    "symbol": "BTCUSDT",
    "time": 1569514978020
  };

const sampleTradeList = [{
    "buyer": false,
    "commission": "-0.07819010",
    "commissionAsset": "USDT",
    "id": 698759,
    "maker": false,
    "orderId": 25851813,
    "price": "7819.01",
    "qty": "0.002",
    "quoteQty": "15.63802",
    "realizedPnl": "-0.91539999",
    "side": "SELL",
    "positionSide": "SHORT",
    "symbol": "BTCUSDT",
    "time": 1569514978020
  },{
    "buyer": false,
    "commission": "-0.07819010",
    "commissionAsset": "USDT",
    "id": 698759,
    "maker": false,
    "orderId": 25851813,
    "price": "7819.01",
    "qty": "0.002",
    "quoteQty": "15.63802",
    "realizedPnl": "-0.91539999",
    "side": "SELL",
    "positionSide": "SHORT",
    "symbol": "BTCUSDT",
    "time": 1569514978022
  },{
    "buyer": false,
    "commission": "-0.07819010",
    "commissionAsset": "USDT",
    "id": 698759,
    "maker": false,
    "orderId": 25851813,
    "price": "7819.01",
    "qty": "0.002",
    "quoteQty": "15.63802",
    "realizedPnl": "-0.91539999",
    "side": "SELL",
    "positionSide": "SHORT",
    "symbol": "BTCUSDT",
    "time": 1569514978023
  }

]

//event listeners
todoButton.addEventListener("click", addSymbol);


function addSymbol(event) {

    header.innerHTML = todoInput.value;
    todoInput.value = '';

}
function addTrade(newTrade){
    //todo DIV
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    //info_tiles
    const buySell = document.createElement('info');
    buySell.innerText = newTrade["side"];
    buySell.classList.add("info_tile");
    todoDiv.appendChild(buySell);

    const quantity = document.createElement('info');
    quantity.innerText = newTrade["qty"];
    quantity.classList.add("info_tile");
    todoDiv.appendChild(quantity);

    const price = document.createElement('info');
    price.innerText = newTrade["price"];
    price.classList.add("info_tile");
    todoDiv.appendChild(price);

    //Append to Actual LIST
    todoList.appendChild(todoDiv);
    //Clear todo input VALUE 
    todoInput.value = ""

    if(newTrade['side'] == 'BUY'){
        addBuyData(parseFloat(newTrade['price']),parseFloat(newTrade['qty']));
    } else if (newTrade['side'] == 'SELL'){
        addSellData(parseFloat(newTrade['price']),parseFloat(newTrade['qty']));
    }
}

function addBuyData(price,quantity){
    var current_q = parseFloat(buyQuantity.innerHTML);
    var current_p = parseFloat(buyPrice.innerHTML);

    buyQuantity.innerHTML = parseFloat((current_q + quantity).toPrecision(6));
    buyPrice.innerHTML = parseFloat((((current_q*current_p) + (price*quantity))/(current_q + quantity)).toPrecision(6)); 
}

function addSellData(price,quantity){
    var current_q = parseFloat(sellQuantity.innerHTML);
    var current_p = parseFloat(sellPrice.innerHTML);

    sellQuantity.innerHTML = parseFloat((current_q + quantity).toPrecision(6));
    sellPrice.innerHTML = parseFloat((((current_q*current_p) + (price*quantity))/(current_q + quantity)).toPrecision(6)); 
}


function openForm() {
    document.getElementById("myForm").style.display = "block";
}
openForm();

loginButton.addEventListener("click",closeForm);

var APIKEY, SECRETKEY;
var testing = 0;

function closeForm() {
    APIKEY = document.getElementById("API-KEY").value;
    SECRETKEY = document.getElementById("SECRET KEY").value;
    document.getElementById("myForm").style.display = "none";
    testing = 1;
}


//timestamp of last trade logged by helper
var timeUrl = new URL("https://fapi.binance.com/fapi/v1/time");
var timestamp_last_trade = 0;
fetch(timeUrl)
    .then(timeResponse => {
        return timeResponse.json();
    })
    .then(timeInfo => {
        timestamp_last_trade = timeInfo['serverTime'];
    });

time=setInterval(function(){

    var timeUrl = new URL("https://fapi.binance.com/fapi/v1/time");
    fetch(timeUrl)
        .then( timeResponse => {
            return timeResponse.json();
        })
        .then(timeInfo => {
            
            //Request for Account Trade List
            var url = new URL("https://fapi.binance.com/fapi/v1/userTrades")
            var time = timeInfo['serverTime'];
            var params = {symbol:header.innerHTML,startTime:timestamp_last_trade,timestamp:time};
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

            var hash = CryptoJS.HmacSHA256(makeQueryString(params), SECRETKEY);
            var hashInBase64 = CryptoJS.enc.Hex.stringify(hash);
            var signedParams = {signature:hashInBase64};
            Object.keys(signedParams).forEach(key => url.searchParams.append(key, signedParams[key]))

            fetch(url,{ 
                headers: {"X-MBX-APIKEY":APIKEY}
            })
            .then(response => {
                return response.json();
                //FOR DEBUGGING
                //return sampleTradeList;
            })
            .then(info => {
                info.forEach( function(trade,index){
                    if(trade['time']>timestamp_last_trade){
                            addTrade(trade);
                            timestamp_last_trade = trade['time'];
                    }
                })
                console.log(info);
            })
        })
    }
    ,2000);