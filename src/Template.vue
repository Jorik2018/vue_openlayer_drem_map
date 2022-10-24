<template>
	<ion-page>
		<ion-router-outlet id="main"></ion-router-outlet>
		<ion-header vif="!iconoClick">
			<div class="primary center" style="font-size: 24px;height:38px;padding-top: 3px;padding-bottom: 7px;z-index:20;border-bottom: 1px solid #a9acb1;">
			{{app.title}}
				<span  style="position: absolute;right: 0px;padding: 5px 13px;display: inline-block;font-size: 15px;">
					<div style="font-size: 17px;" v-html="icono" ></div> 
				</span>
			</div>	
		</ion-header>		
		<router-view></router-view>
	</ion-page>
</template>
<script>
var app=window.app;
export default window.ui({
	watch: {
		$route() {
			window._.resize();
			var me=this;
			me.resultVisible=false;
			me.mask=window._.unmask(me.mask);
		}
	},
	mounted(){
		this.$on('close', (m) => {
			//console.log("CLOSE ")
			window.Vue.unmask(this.mask);
			console.log(m);
			this.$ionic.modalController.dismiss();
			});
		app.bindLinks(this.$el,this.hide);

	},
	updated(){
		//	console.log("ENTRO A UPDATE")	
		app.bindLinks(this.$el,this.hide);
		window.app.bindLinks(this.$el);
		window.Vue.resize();
		//this.$refs.dataview.load(true); 
		//this.categoria = this.app.idcategoria;
	},
	created(){
		window.logo=require('@/fs/images/shami-icon-blue.svg');
		//console.log("ENTRO A CREATED "+this.id)
		this.categoria = this.id;
		var me=this;
		//console.log(me.app);
		me.app.cccc=function(){
			me.resultVisible=false;
			me.mask=window._.unmask(me.mask);
		};
	},
	methods:{
		toggleMenu(){
			//console.log("menu")
			//console.log(this.$refs.menu)
			this.$ionic.menuController.open("menuprincipal");
			//this.$refs.menu.toggle();
		},
		find(ev){
			//console.log(ev)
			var valor = ev.target.value;
			this.query = valor;
			console.log(valor);
			this.$refs.dataview.load(true);			
		},
	},
	computed:{
		cart(){return window.app.cart;},
		title(){return this.app.title;},
		icono(){return this.app.icono;},
		iconoClick(){return this.app.iconoConClick;},
	},
	data(){return {data:[],mode:0,query:null,mask:null,path:process.env.BASE_URL}},
});
</script>
<style>
	.toolbar{
		font-size: 12px;
	}
	.fade-enter-active, .fade-leave-active {
		transition: opacity .5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
	.v-input-field svg{
		margin: 5px;
		opacity:.5;
	}
	.v-form input,.v-form select,.v-form textarea{
		border-radius: 8px !important;
	}
	.v-input-field input{
		width: calc(100% - 31px) !important;
		border-radius: 8px !important;
		padding-left: 26px !important;
	}
	.v-tab-content > span{
		text-align:justify;
		padding:5px 0px;
	}
	.v-accordion > div:not(:last-child) > .v-tab-content{
		padding-bottom:20px;
	}
	.v-accordion > div:not(:last-child){
		border-bottom:1px solid gray;
	}
	.v-accordion > * > .expanded{
		font-weight: bolder;
	}
	.v-cart{
		border-radius: 50%;
		background-color: #0f62ac;
		position: fixed;
		border: #0f62ac;
		right: 15px;
		bottom: 15px;
		padding: 14px;
		display: inline-block;
		box-shadow: 1px 2px 2px #535353a3; /*agregando sombra*/
	}
	.v-cart svg{
		margin-right: 0px;
	}
	a{
		display:inline-block;
	}
	.controls a:not(:last-child){
		display:inline-block;
		margin-right:0px;
	}
	.store .img{
		min-height:120px;
		width: 50%;
	}
	.store{
		position:relative;
		width: calc(100% - 0px);
	}
	.v-dataview div.store-info{
		width: calc(50% - 10px);
		margin-left: 10px;
	}
	.store-info .controls{
		position:absolute;
		top:0px;
		right:-10px;
	}
	.v-dataview > :not(:last-child){
		margin-bottom: 0px;
	}
	.sc-ion-input-md-h {
		--padding-top: 5px;
		--padding-right: 0px;
		--padding-left: 0px;
		--padding-end: 0;
		--padding-bottom: 5px;
		--padding-start: 8px;
		font-size: inherit;
	}
	.searchionic{
		--icon-color: #f39200;
		--clear-button-color: #f39200;
		--cancel-button-color: #f39200;
		padding-right: 5px;
		padding-left: 5px;
		padding-top: 0px;
		padding-bottom: 0px;
		margin-top: -10px;
	}
	.searchbar-input-container.sc-ion-searchbar-ios {
		height: 36px;
		contain: strict;
		border: 1px solid rgb(187, 187, 187);
		/* width: calc(100% - 60px); */
		/* background-color: rgb(232, 232, 232); */
		/* padding: 5px 30px; */
		border-radius: 10px;
	}
	.dataviewres{      
		margin-left: 10px;
		margin-right: 10px;
	}
</style>