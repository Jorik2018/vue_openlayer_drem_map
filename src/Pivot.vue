<template>
<ion-content :scroll-events="true">
	<div>
  <vue-pivottable-ui
    :data="data"
  >
  </vue-pivottable-ui>
  </div>
</ion-content>
</template>

<script>
import { VuePivottableUi } from 'vue-pivottable'
import 'vue-pivottable/dist/vue-pivottable.css'
export default {
	data(){
		return {
			data:[
				{distrito: 'huaraz', tipo: 'robo',cantidad:112},
				{distrito: 'casma', tipo: 'robo',cantidad:12},
				{distrito: 'santa', tipo: 'robo',cantidad:12},
				{distrito: 'huary', tipo: 'robo',cantidad:23},
				{distrito: 'casma', tipo: 'violacion',cantidad:92},
				{distrito: 'santa', tipo: 'violacion',cantidad:72},
				{distrito: 'santa', tipo: 'violacion',cantidad:55},
				{distrito: 'huary', tipo: 'violacion',cantidad:39},
				{distrito: 'casma', tipo: 'estfa',cantidad:32},
				{distrito: 'santa', tipo: 'estfa',cantidad:3},
				{distrito: 'santa', tipo: 'estfa',cantidad:7},
				{distrito: 'huary', tipo: 'estfa',cantidad:2}
			]
		}
	},
  components: {
    VuePivottableUi
  }
}
</script>
<style>
	.pvtRenderers{
		width: 200px;
	}
	.pvtVals select{
		width: -webkit-fill-available;
	}
	.pvtVals a{
		display: none;
	}
	.pvtTable th{
		color:black;
	}
	.pvtUi{
		text-transform: uppercase;
		max-height: -webkit-fill-available;
	}
</style>