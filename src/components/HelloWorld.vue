<template>
  <div class="row">
    <h1>Polymarket Analyzer and Tax Form Generator</h1>
    <p>Tool to show better profit and loss stats for your polymarket bets</p>

    <p>Coming soon: Polymarket tax filings. Easy way to download a sheet for filing Polymarket winnings on your taxes</p>

<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSexM3QKVdcrdIfVG3Y7Oka5K_JtRwfZ2XUNR0t-PZdnqidlwA/viewform?embedded=true" width="640" height="475" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
       
<p></p>
      <div class="col-10">
        <input v-model="address" type="text" class="form-control form-control-lg" placeholder="Enter Your Polymarket Wallet Address (not working yet)" name="address">
      </div>

      <!-- submit button -->
      <div class="col-auto">
        <button v-on:click="findTransactions" type="submit" class="btn btn-lg btn-primary">Find</button>
      </div>
      <div v-if="resa" >
        <h3>Redemption History </h3>
        <table class="table table-striped">
          <thead>
            <tr>

              <th scope="col">Description</th>
              <th scope="col">Num Tokens</th>
              <th scope="col">Value</th>
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
        <h3>Transaction History </h3>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Type</th>
              <th scope="col">Num Tokens</th>
              <th scope="col">Value (USDC)</th>
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
  </div>
</template>

<script>
import gql from 'graphql-tag'
import moment from 'moment'
import stub_account1 from '../../testdata/account1.json'
import markets from '../../testdata/allmarkets.json'


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
//query
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
    transactions {
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
  //context.resa = stub_account1
  context.$apollo.provider.defaultClient.query({query: q2, variables: {id: addr}}).then(res => {context.resa = res; console.log(res)})

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
    }
  },
  methods: {
    async findTransactions() {
      //let res = await this.$apollo.provider.defaultClient.query({query})
      //this.resa = res;
      getTransactionsAndRedemptions(this)
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
        let normalizedUSDC =  value / 1000000
        return '$' + normalizedUSDC.toFixed(5)
      }      
    },
    formatTokenQty: function (value) {
      if (value) {
        return  value / 1000000
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
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
