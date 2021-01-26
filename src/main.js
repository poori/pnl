import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// GRAPHQL STUFF
import VueCompositionApi, { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createHttpLink } from 'apollo-link-http'
import {ApolloClient, gql} from 'apollo-boost'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

const POLYMARKET_URL = "https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"
// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: POLYMARKET_URL,
})

// Cache implementation
const cache = new InMemoryCache()

// client apollo client
const defaultClient = new ApolloClient({
  link: httpLink,
  cache: cache,
  fetchOptions: { mode: 'no-cors' },
})



Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: defaultClient
});
// defaultClient.query({query}).then(res => console.log(res))


new Vue({
  el: '#app',
  // inject apolloProvider here like vue-router or vuex
  apolloProvider,
  render: h => h(App),
})
