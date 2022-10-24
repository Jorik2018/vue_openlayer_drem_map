import Vue from 'vue'
import Router from 'vue-router'
import './cdn/vue-ui.js'
import IsobitUI from 'isobit-ui'
import App from './App.vue'
import Ionic from '@ionic/vue';
import '@ionic/core/css/ionic.bundle.css';
import './cdn/isobit.css';

Vue.use(Router);
Vue.use(IsobitUI);
Vue.use(Ionic);
Vue.config.ignoredElements = [...window.Vue.config.ignoredElements||[],...[/^ion-/]];
Vue.config.productionTip = false;

const  router  =  new  Router({
	//mode: 'history',
	routes: [	
		{
			path:'/',
			component:  r => require.ensure([], () => r(require('./Template.vue')), 'template'),
			children:[
				{
					path:'',
					component:  r => require.ensure([], () => r(require('./Map.vue')), 'mapitas'),
				},
				{
					path:'/pivot',
					component:  r => require.ensure([], () => r(require('./Pivot.vue')), 'mapitas'),
				}
			],
			meta: {
				auth:true,
				title:'SICAMIF - ANCASH VERSIÓN 2.0'
			}
		}
	]
});

new Vue({
	data(){return {title:'SICAMIF ANCASH - 2.0'}},
	watch: {
		'$route' (to) {
			document.title = this.title+(to.meta.title?' - '+to.meta.title:'');
		}
	},
	create(){
		document.title=this.title;
	},
	router,
	render: h => h(App),
	created(){window.$app=this;console.log(this.$children[0]);
		//this.$children[0].title=this.title;
		
	},mounted(){
		this.$children[0].title=this.title;
	}
}).$mount('#app')
