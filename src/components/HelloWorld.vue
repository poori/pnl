<template>
  <div class="py-5 px-3">
    <div  class="row">
      <h1>Polymarket Analyzer and Tax Form Generator</h1>
      <p>Tool to show better profit and loss stats for your polymarket bets</p>

      <p>Coming soon: Polymarket tax filings. Easy way to download a sheet for filing Polymarket winnings on your taxes</p>
<!--
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSexM3QKVdcrdIfVG3Y7Oka5K_JtRwfZ2XUNR0t-PZdnqidlwA/viewform?embedded=true" width="640" height="475" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
      -->
    </div>
    <div class="row">
      <div class="col-10">
        <input v-model="address" type="text" class="form-control form-control-lg" placeholder="Enter Your Polymarket Wallet Address" name="address">
        <div id="emailHelp" class="form-text">Try 0x896e5e594ddf322cd180f01df263e0f22ac07a83 as an example.</div>
      </div>

      <!-- submit button -->
      <div class="col-auto">
        <div v-if="loading">
          <button class="btn btn-lg btn-primary" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
          </button>
        </div>
        <div v-else>
          <button v-on:click="findTransactions" type="submit" class="btn btn-lg btn-primary">Find</button>
        </div>
      </div>
    </div>
    <div v-if="true || resa" class="row justify-content-md-center">
      <div class="col col-md-auto mt-5 mb-5">
        <button v-on:click="calcTax" class="btn btn-secondary">Calculate Gains for Taxes</button>
      </div>
    </div>
      <div v-if="pnl" class="mb-5">
        <h3>Profit Loss Summary</h3>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Proceeds</th>
              <th>Cost basis</th>
              <th>Proceeds</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Redemptions </td>
              <td>{{redemption_pnl.cost_basis | formatUSDC}}</td>
              <td>{{redemption_pnl.proceeds | formatUSDC}}</td>
              <td>{{redemption_pnl.net | formatUSDC}}</td>
            </tr>
            <tr>
              <td>FIFO Matched Trades</td>
              <td>{{fifo_pnl.cost_basis | formatUSDC}}</td>
              <td>{{fifo_pnl.proceeds | formatUSDC}}</td>
              <td>{{fifo_pnl.net | formatUSDC}}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total </td>
              <td>{{pnl.cost_basis | formatUSDC}}</td>
              <td>{{pnl.proceeds | formatUSDC}}</td>
              <td>{{pnl.net | formatUSDC}}</td>
            </tr>
          </tfoot>
          
        </table>
      </div>

      <div v-if="fifo_table" class="mt-6">
        <h5>FIFO matched trade details</h5>

        <table class="table table-striped">
          <thead>
            <tr>


              <th scope="col">Num Shares</th>
              <th scope="col">Cost basis</th>
              <th scope="col">Proceeds</th>            
              <th scope="col">Buy ID</th>
              <th scope="col">Sell ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sell_record in fifo_table" :key="sell_record.sell_id">

              <td>{{ sell_record.shares | formatTokenQty }}</td>
              <td>{{ sell_record.cost_basis | formatUSDC }}</td>
              <td>{{ sell_record.proceeds | formatUSDC }}</td>
              <td>{{ sell_record.buy_id }}</td>
              <td>{{ sell_record.sell_id }}</td>

            </tr>
          </tbody>
          <tfoot v-if="fifo_pnl">
            <tr>
              <td>Totals</td>
              <td>{{fifo_pnl.cost_basis | formatUSDC}}</td>
              <td>{{fifo_pnl.proceeds | formatUSDC}}</td>
              <td>Total: {{fifo_pnl.net | formatUSDC}}</td>
              <td></td>
              <td></td>

            </tr>
          </tfoot>
        </table>
      </div>
      <div v-if="resa" >
        <br /><br />
        <h2> Transaction History</h2>
        <h3>Redemptions</h3>
        <table class="table table-striped">
          <thead>
            <tr>

              <th scope="col">Description</th>
              <th scope="col">Num Tokens</th>
              <th scope="col">Proceeds</th>
              <th scope="col">Date</th>
              <th scope="col">Tx hash</th>            
            </tr>
          </thead>
          <tbody>
            <tr v-for="redemption in resa.data.account.redemptions" :key="redemption.id">

              <td>{{ redemption.condition.id | getMarketNameByConditionId }}</td>
              <td>{{ redemption.payout | formatTokenQty }}</td>
              <td>{{ redemption.payout | formatUSDC }}</td>
              <td>{{ redemption.condition.resolutionTimestamp | formatDate }}</td>
              <td>{{redemption.id}}</td>
            </tr>
          </tbody>
        </table>
        <h3>Trades</h3>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Type</th>
              <th scope="col">Num Tokens</th>
              <th scope="col">Proceeds (USDC)</th>
              <th scope="col">Date</th>
              <th scope="col">Tx Hash</th>
              
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in resa.data.account.transactions" :key="transaction.id">

              <td>{{ transaction.market.id | getMarketName}}</td>
              <td>{{ transaction.type }}</td> 
              <td>{{ transaction.outcomeTokensAmount | formatTokenQty }}</td>
              <td>{{ transaction.tradeAmount | formatUSDC }}</td>
              <td>{{ transaction.timestamp | formatDate }}</td>
              <td>{{transaction.id}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="mt-5">
        
        Note:<br />
        <ul>
          <li><strong>This is a beta product. Accuracy not guaranteed.</strong></li>
          <li>FIFO matching for realized gains and losses</li>
          <li>Liquidity pools currently unsupported</li>
          <li>Share merging untested</li>
          <li>only 2020 tax year supported</li>
        </ul>

      </footer>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import stub_account1 from '../../testdata/account1.json'
import markets from '../../testdata/allmarkets.json'

const USDC_DIVISOR = 1000000

//preprocess markets into a hash datastructure for faster name lookup
var markets_hash = {}
markets.forEach(function (el, i, arr) {
    let normalized_id = el.marketMakerAddress.toLowerCase()
    markets_hash[normalized_id] = el; //need to do lowercase b/c for some reason upper and lower are mixed in this file
})

//preprocess markets into a hash datastructure for faster name lookup
var markets_conditionid_hash = {}
markets.forEach(function (el, i, arr) {
    let normalized_id = el.conditionId.toLowerCase()
    markets_conditionid_hash[normalized_id] = el; //need to do lowercase b/c for some reason upper and lower are mixed in this file
})

//util 

function conditionIdToMarketId(conditionId) {
  return markets_conditionid_hash[conditionId].marketMakerAddress.toLowerCase()
}

//calculate net gains for 2020
//Redemption markets:
//1. get all redemptions to total income. keep track of listof markets
function redemptionTotal(redemptions_json) {
  let total = 0
  redemptions_json.forEach((el, i, arr) => {
    total += parseInt(el.payout)
  })
  return total
}

//2. get all sells to total that income. keep track of list of markets
function sellTransactionTotal(transactions_json) {
  let total = 0
  transactions_json.forEach((el, i, arr) => {
    if (el.type == "Sell") {
      total += el.tradeAmount
    }
  })
  return total
}

//3. get all buy transactions for all markets from above. 
function getRealizedMarketIds(transactions_json, redemptions_json) {
  let market_ids = []
  transactions_json.forEach((el, i, arr) => {
    market_ids << el.market.id
  })
  redemptions_json.forEach((el, i, arr) => {
    if (el.type == "Sell") {
      market_ids << el.condition.id
    }
  })
}
//4. subtract out any sell transactions from before 2020 (not necessary)

//5. subtract 3 from (1+2)

function profitLossCalc(q2_json, context) {
  let redemptions_total = redemptionTotal(q2_json.data.account.redemptions)
  let redemption_market_ids = []
  q2_json.data.account.redemptions.forEach((el, i, arr) => { redemption_market_ids.push(conditionIdToMarketId(el.condition.id))})
  //get sell type txs that are part of any redeemed markets
  let redemption_market_sells = q2_json.data.account.transactions.filter(tx => redemption_market_ids.includes(tx.market.id)).filter(tx => tx.type == "Sell")
  let redemption_market_sell_total = 0
  redemption_market_sells.forEach((tx) => { redemption_market_sell_total += parseInt(tx.tradeAmount)})
  //redemption totals
  let total_redemption_market_sell_revenue = redemptions_total + redemption_market_sell_total

  //find redemption buys
  let redemption_market_buys = q2_json.data.account.transactions.filter(tx => redemption_market_ids.includes(tx.market.id)).filter(tx => tx.type == "Buy")
  let redemption_market_buy_total = 0
  redemption_market_buys.forEach((tx) => { redemption_market_buy_total += parseInt(tx.tradeAmount)})
  
  //net profit from redemption markets
  let redemption_market_net_profit = total_redemption_market_sell_revenue + redemption_market_buy_total

  //calculate pnl from buys and sells not in the redemption markets (TODO: need to be more complex if we are supporting other years..currently assumping polymarket started in 2020)
  let floating_market_sells = q2_json.data.account.transactions.filter(tx => !redemption_market_ids.includes(tx.market.id)).filter(tx => tx.type == "Sell")
  // for each market, match sell to buy to get cost by bridging through outcomeTokensAmount
  //console.log(floating_market_sells)
  let floating_market_ids = [...new Set(floating_market_sells.map(tx => tx.market.id))]

  //FIFO match trades
  //for each market, get all transactions and sort them. 
  let gains_table = []
  floating_market_ids.forEach((market_id) => {
      let tx_history = q2_json.data.account.transactions
          .filter(tx => tx.market.id == market_id)
          .sort((a, b) => {return parseInt(a.timestamp) - parseInt(b.timestamp)})
      let buys = []
      let sells = []
      tx_history.forEach((tx) => ((tx.type == "Buy") ? buys : sells).push(tx)) //split into buy and sell arrays
      //for each sell, loop through each buy and match prices
      console.log(buys)
      console.log(sells)
      sells.forEach((sell_tx) => {
        let buy_index = 0
        let buy_order_shares = parseInt(buys[buy_index].outcomeTokensAmount)
        let sell_order_shares = parseInt(sell_tx.outcomeTokensAmount)
        while (sell_order_shares > 0) {

          if (buy_order_shares >= sell_order_shares) { //if buy order (or remaining buy order shares) is bigger
            console.log(buys[buy_index])
            let cost = parseInt(buys[buy_index].tradeAmount) * (sell_order_shares / buy_order_shares)
            let sell_record = {'sell_id': sell_tx.id, 'shares': sell_order_shares, 'buy_id': buys[buy_index].id, 'cost_basis': cost, 'proceeds': parseInt(sell_tx.tradeAmount)}
            console.log(sell_record)
            gains_table.push(sell_record)
            buy_order_shares = buy_order_shares - sell_order_shares
            if (buy_order_shares == 0) {buy_index++; buy_order_shares = parseInt(buys[buy_index].outcomeTokensAmount)}
            sell_order_shares = 0
          } else { // if sell order is bigger
            let cost = parseInt(buys[buy_index].tradeAmount) 
            let sell_record = {'sell_id': sell_tx.id, 'shares': buy_order_shares, 'buy_id': buys[buy_index].id, 'cost_basis': cost, 'proceeds': parseInt(sell_tx.tradeAmount)}
            console.log(sell_record)
            gains_table.push(sell_record)
            sell_order_shares =- buy_order_shares
            buy_index++
            buy_order_shares = parseInt(buys[buy_index].outcomeTokensAmount)
            
          }

        }
      })

  })    
  let fifo_total_cost = 0
  let fifo_total_proceeds = 0
  gains_table.forEach((row) => {fifo_total_cost += row.cost_basis})
  gains_table.forEach((row) => {fifo_total_proceeds += row.proceeds})
  let fifo_total_net =  fifo_total_proceeds + fifo_total_cost

  context.redemption_pnl = {'proceeds': total_redemption_market_sell_revenue, 'cost_basis': redemption_market_buy_total, 'net': redemption_market_net_profit}
  context.fifo_table = gains_table
  context.fifo_pnl = {'proceeds': fifo_total_proceeds, 'cost_basis': fifo_total_cost, 'net': fifo_total_net}
  context.pnl = {'proceeds': total_redemption_market_sell_revenue + fifo_total_proceeds, 'cost_basis': redemption_market_buy_total + fifo_total_cost, 'net': redemption_market_net_profit + fifo_total_net}
}

//queries
const q_test = gql`
query {
  account(id: "0x896e5e594ddf322cd180f01df263e0f22ac07a83") {
    id
  }
}
`
const q2 = gql`
query account($id: String) {
  account(id: $id) {
    id
      transactions(orderBy: timestamp, orderDirection: desc) {
      id
      type
      timestamp
      market { id }
      tradeAmount
      outcomeIndex
      outcomeTokensAmount
      feeAmount
    }
    redemptions {
      id     
      collateralToken {
        id
      }
      condition {
        resolutionTimestamp
        id
      }
      indexSets
      payout     
    }
  }
}
`

async function getTransactionsAndRedemptions(context) {
  let addr = context.address
  //console.log(stub_account1)
  // context.resa = stub_account1
  //refactor later -- this is clearly not the right way to do it
  context.loading = 1
  context.$apollo.provider.defaultClient.query({query: q2, variables: {id: addr}}).then(res => {context.resa = res; console.log(res)})
  let res =  await context.$apollo.provider.defaultClient.query({query: q2, variables: {id: addr}})
  context.resa = await res
  context.resa.data.account.transactions.forEach((el, i, arra) => {
    if ((el.type == "Buy") && (!el.tradeAmount.startsWith('-'))){
      //if its not already added -- when its cached its already there
      el.tradeAmount = "-"+el.tradeAmount
      console.log(el)
    }
  })
  context.loading = 0
}

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() { 
    return {
      resa: '',
      address: '',
      loading: 0,
      pnl: null,
      fifo_table: null,
      redemption_pnl: null,
      fifo_pnl: null,
    }
  },
  methods: {
    async findTransactions() {
      //let res = await this.$apollo.provider.defaultClient.query({query})
      //this.resa = res;
      getTransactionsAndRedemptions(this)
    },
    async calcTax() {
      profitLossCalc(this.resa, this)
    }
  },
  filters: {
    formatDate: function (value) {
      if (value) {
        return moment.unix(String(value)).format('MM/DD/YYYY hh:mm')
      }
    },
    formatUSDC: function (value) {
      if (value) {
        let normalizedUSDC =  parseFloat(value) / USDC_DIVISOR
        return normalizedUSDC.toFixed(2)
      }      
    },
    formatTokenQty: function (value) {
      if (value) {
        return  value / USDC_DIVISOR
      }     
    },
    getMarketName: function (hash) {
      let name = markets_hash[hash]
      if (name) {
        return name.question
      }
      return hash
    },
    getMarketNameByConditionId: function (hash) {
      let name = markets_conditionid_hash[hash]
      if (name) {
        return name.question
      }
      return hash
    },
    
  }
  // apollo: {
  //   account: {
  //     query: query
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
tfoot {
  font-weight:bold;
}
</style>
