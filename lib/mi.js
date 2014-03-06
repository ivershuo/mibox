(function(isNode){
	if(isNode){
		utils = require('./utils.js');
	};
	var mix   = utils.mix,
		when  = utils.when,
		jsonp = utils.jsonp,
		j2u   = utils.j2u;

	function MI(srv, keyes){
		this.srv = (srv.search(/https?:\/\//i) === 0 ? '' : 'http://') + srv;
		keyes = ['menu', 'right', 'left', 'down', 'up', 'enter', 'volumeup', 'volumedown', 'home', 'back'].concat(keyes || []);
		this.addKeys(keyes);
	};
	MI.getTvs = function(){
		var defer = when.defer();
		jsonp('http://pds.duokanbox.com/peer/fetchbyipopen/?mac_address=1', function(data){
			if(data && data.status === 0){
				defer.resolve(data.data);
			}
		});
		return defer.promise;
	};

	mix(MI.prototype, {
		send : function(params, method){
			var defer = when.defer();
			method = method || 'controller';
			var url = this.srv + '/' + method + '?' + j2u(mix({
				action : 'keyevent'
			}, params, true));
			jsonp(url, function(data){
				if(data && data.status === 0){
					defer.resolve(data.data);
				} else {
					defer.reject(data && data.status);
				}
			});
			return defer.promise;
		},
		play : function(video, name){
			return this.send({
				action     : 'play',
				clientname : 'PC',
				url        : video,
				name       : name || 'unknow'
			}, 'video');
		},
		addKeys : function(keyes){
			var self = this;
			keyes.forEach(function(key){
				self[key] = function(){
					return self.send({
						keycode : key
					});
				}
			});
		},
		power : function(){
			var defer = when.defer();
			this.send({
				keycode : 'power'
			}).then(function(data){
				defer.resolve(data);
			}).otherwise(function(data){
				if(data.test(/\d/)){
					defer.reject();
				} else {
					defer.resolve();
				}
			});
			return defer.promise;
		},
		imequery : function(){
			return this.send({
				action : 'imequery'
			});
		},
		text : function(value){
			return this.send({
				action : 'imeconfirm',
				value  : value
			});
		},
		isActive : function(){
			return this.send({
				action : 'isAlive'
			}, 'request');
		}
	});

	if(isNode){
		module.exports = MI;
	} else {
		window.MI = MI;
	}
})(typeof(module) != 'undefined' && module.exports);
