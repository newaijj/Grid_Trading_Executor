
//selectors
const loginButton = document.querySelector('.login_button');

const todoInput = document.querySelector('.todo_input');
const todoButton = document.querySelector('.todo_button');
const todoList = document.querySelector('.todo_list');

const header = document.querySelector('.header');

const spotPerpCheckbox = document.getElementById("Spot/perp");

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
const spotTrade = [
    {
      "symbol": "BNBBTC",
      "id": 28457,
      "orderId": 100234,
      "orderListId": -1, //Unless OCO, the value will always be -1
      "price": "4.00000100",
      "qty": "12.00000000",
      "quoteQty": "48.000012",
      "commission": "10.10000000",
      "commissionAsset": "BNB",
      "time": 1499865549590,
      "isBuyer": true,
      "isMaker": false,
      "isBestMatch": true
    }
  ];

const futuresTrade = {
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
    buySell.innerText = newTrade.get_isBuyer()?"BUY":"SELL";
    buySell.classList.add("info_tile");
    todoDiv.appendChild(buySell);

    const quantity = document.createElement('info');
    quantity.innerText = newTrade.get_quantity();
    quantity.classList.add("info_tile");
    todoDiv.appendChild(quantity);

    const price = document.createElement('info');
    price.innerText = newTrade.get_price();
    price.classList.add("info_tile");
    todoDiv.appendChild(price);

    //Append to Actual LIST
    todoList.appendChild(todoDiv);
    //Clear todo input VALUE 
    todoInput.value = ""

    if(newTrade.get_isBuyer()){
        addBuyData(newTrade);
    } else {
        addSellData(newTrade);
    }
}

function addBuyData(trade){
    var price = trade.get_price();
    var quantity = trade.get_quantity();
    var current_q = parseFloat(buyQuantity.innerHTML);
    var current_p = parseFloat(buyPrice.innerHTML);

    buyQuantity.innerHTML = parseFloat((current_q + quantity).toPrecision(6));
    buyPrice.innerHTML = parseFloat((((current_q*current_p) + (price*quantity))/(current_q + quantity)).toPrecision(6)); 
}

function addSellData(trade){
    var price = trade.get_price();
    var quantity = trade.get_quantity();
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

function base_url(){
    if(spotPerpCheckbox.checked){
        return "https://api.binance.com/api/v3/";
    } else {
        return "https://fapi.binance.com/fapi/v1/";
    }
}

function time_url(){
    return new URL(base_url()+"time");
}

function trade_list_url(){
    if(spotPerpCheckbox.checked){
        return new URL(base_url()+"myTrades");
    } else{
        return new URL(base_url()+"userTrades");
    }
}

//timestamp of last trade logged by helper

//var timestamp_last_trade = 1615853790000-10*24*60*60*1000;

fetch(time_url())
    .then(timeResponse => {
        return timeResponse.json();
    })
    .then(timeInfo => {
        timestamp_last_trade = timeInfo['serverTime']-1000*60*60;
    });

class Trade{
    constructor(info,spot_or_perp = true){
        this.spot_or_perp = spot_or_perp;
        this.info = info;
    }
    get_time(){
        return this.info.time;
    }
    get_isBuyer(){
        if(this.spot_or_perp){
            return this.info.isBuyer;
        } else {
            if(this.info.side=="SELL"){
                return false;
            } else {
                return true;
            }
        }
    }
    get_price(){
        return parseFloat(this.info.price);
    }
    get_quantity(){
        return parseFloat(this.info.qty);
    }
}

time=setInterval(function(){


    console.log(spotPerpCheckbox.checked);
    console.log(timestamp_last_trade);

    fetch(time_url())
        .then( timeResponse => {
            return timeResponse.json();
        })
        .then(timeInfo => {
            
            //Request for Account Trade List
            var url = trade_list_url();
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
                //console.log(timestamp_last_trade);
                //console.log(info)
                info.forEach( function(trade,index){
                    var new_trade = new Trade(trade,spotPerpCheckbox.checked);
                    if(new_trade.get_time()>timestamp_last_trade){
                            
                            addTrade(new_trade);
                            timestamp_last_trade = new_trade.get_time()+1;
                            console.log("here")
                            
                    }
                    console.log("timestamp_last_trade changed")
                    console.log(timestamp_last_trade);
                })
                console.log(info);
            })
        })
    }
    ,2000);