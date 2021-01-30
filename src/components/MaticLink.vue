
<template>
  <a :href=maticUrl target=_blank>
    Matic <i class='bi bi-arrow-up-right-square-fill'></i>
  </a>
</template>

<script>
export default {
  name: 'MaticLink',
  props: {
    id: String
  },
  computed: {
    maticUrl: function() {
      return "https://explorer-mainnet.maticvigil.com/tx/"+this.id
    }
  }
}

</script>
