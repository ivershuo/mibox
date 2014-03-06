(function(){
	var mix = function(des, src, map){
		map = map || function(d, s, i){
			if(!(des[i] || (i in des))){
				return s;
			}
			return d;
		}
		if(map === true){
			map = function(d,s){
				return s;
			}
		}
		for (i in src) {
			des[i] = map(des[i], src[i], i, des, src);
			if(des[i] === undefined) delete des[i];
		}
		return des;
	};

	var when = (function(){
		function Promise(){
			this._resolves = [];
			this._readyState = Promise.PENDING;
			this._data = null;
		}

		mix(Promise.prototype, {
			then: function(onFulfilled, onRejected){
				var deferred = new Defer(),
					self = this;

				function fulfill(data){
					var ret, readyState = self._readyState;

					if(readyState === Promise.FULFILLED){
						ret = onFulfilled ? onFulfilled(data) : data;
					}else if(readyState === Promise.REJECTED){
						ret = onRejected ? onRejected(data) : data;
					}

					if(Promise.isPromise(ret)){
						//如果是Promise，往下传递
						ret.then(function(data){
							deferred.resolve(data);
						}, function(data){
							deferred.reject(data);
						});
					}else{
						//不是Promise，处理返回值
						if(readyState !== Promise.REJECTED || onRejected){
							//没有异常或者已经处理了异常，返回值当作正常值处理
							deferred.resolve(ret);
						}else{
							//丢给后续的Promise处理
							deferred.reject(ret);
						}
					}
					return ret;
				}

				if(this._readyState === Promise.PENDING){
					this._resolves.push(fulfill);
				}else{
					setTimeout(function(){
						fulfill(self._data);
					});
				}

				return deferred.promise;
			},
			otherwise: function(onRejected){
				return this.then(undefined, onRejected);
			}
		});

		mix(Promise, {
			PENDING   : 0,
			FULFILLED : 1,
			REJECTED  : 2,
			isPromise: function(obj){
				return obj != null && typeof obj['then'] == 'function';
			}
		});

		function _resolve(promise, data, state){
			var state = state || Promise.FULFILLED;

			if(promise._readyState != Promise.PENDING){
				return;
			}
			
			promise._readyState = state;
			promise._data = data;

			for(var i = 0; i < promise._resolves.length; i++){
				var handler = promise._resolves[i];
				setTimeout(function(){
					handler(data);
				});		
			}
		}

		function Defer(){
			this.promise = new Promise();
		}

		mix(Defer.prototype,{
			resolve: function(data){
				return _resolve(this.promise, data, Promise.FULFILLED);
			},
			reject: function(reason){
				return _resolve(this.promise, reason, Promise.REJECTED);
			}
		});

		return {
			defer: function(){
				return new Defer();
			},
			isPromise: function(promiseOrValue){
				return Promise.isPromise(promiseOrValue);
			},
			all: function(promises){
				var deferred = qboot.when.defer();

				var n = 0, result = [];

				for(var i = 0; i < promises.length; i++){
					promises[i].then(function(ret){
						result.push(ret);
						n++;

						if(n >= promises.length){
							deferred.resolve(result);
						}
					});
				}

				return deferred.promise;
			},
			any: function(promises){
				var deferred = qboot.when.defer();

				for(var i = 0; i < promises.length; i++){
					promises[i].then(function(ret){
						deferred.resolve(ret);
					});
				}

				return deferred.promise;
			},
			join: function(){
				return qboot.when.all(arguments);
			}
		};
	})();

	var randomStr = function(length){
		var ret = [];
		length = length || 10;
		while(length--){
			ret.push(String.fromCharCode(97 + Math.floor(Math.random()*25)));
		}
		return ret.join('');
	};

	var utils = {
		mix  : mix,
		when : when,
		j2u  : encodeURIJson = function (json){
		    var s = [];
		    for( var p in json ){
		        if(json[p]==null) continue;
		        if(json[p] instanceof Array) {
		            for (var i=0;i<json[p].length;i++) s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
		        } else {
		            s.push( encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
		        }
		    }
		    return s.join('&');
		},
		jsonp : function(url, cb, opt){
			opt = mix({
				cbName : 'callback'
			}, opt, true);
			var s = document.createElement('script');
			if(cb){
				var fcName = randomStr();
				window[fcName] = function(data){
					cb(data);
					window[fcName] = null;
				};
				url += ((url.indexOf('?') === -1 ? '?' : '&') + opt.cbName + '=' + fcName);
			}
			s.src = url;
			document.head.appendChild(s);			
		}
	}

	if(typeof(module) != 'undefined' && module.exports){
		var http = require('http');
		utils.jsonp = function(url, cb, opt){
			opt = mix({
				cbName : 'callback'
			}, opt, true);
			var fcName = randomStr();
			url += ((url.indexOf('?') === -1 ? '?' : '&') + opt.cbName + '=' + fcName);
			http.get(url, function(res){
		        res.on('data', function(data){
		            var retData = data.toString('utf-8'),
		            	json = retData && retData.match(/{.*}/);
		            if(json){
		            	try{
		            		var data = JSON.parse(json);
		            		cb && cb(data);
		            	} catch(e){}
		            }
		        });
			});
		};
		module.exports = utils;
	} else {
		window.utils = utils;
	}	
})();