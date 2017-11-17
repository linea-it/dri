var cacheStorage = sessionStorage;
var requestIdIndex = 0;

Ext.define('UserQuery.view.service.ApiBase', {
    cache: location.href.includes('/dev/'),

    _proxy: {},
    _complete:{},

    constructor: function () {
        Ext.Ajax.on('beforerequest', function (conn, options) {
            if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
                if (typeof(options.headers) == 'undefined') {
                    options.headers = {
                        'Accept': 'application/json',
                        'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
                    };
                } else {
                    options.headers['Application'] = 'application/json';
                    options.headers['X-CSRFToken'] = Ext.util.Cookies.get('csrftoken');
                }
            }
        }, this);
    },
    
    proxy: function(name, callback){
        this._proxy[name] = callback;
    },

    responseComplete: function(requestId, callback){
        this._complete[requestId] = callback;
    },

    responseAnalyse: function(error, result, definition, requestId){
        var proxy;
        var me = this;

        if (typeof(definition)=='function'){
            definition(error, result);
        }else{
            proxy = this._proxy[definition.proxy] || (typeof(definition.proxy)=='function' ? definition.proxy : null);

            if (!error && proxy){
                result = proxy(result);
            }
            
            definition.response(error, result);
        }

        setTimeout(function(){
            if (me._complete[requestId]){
                me._complete[requestId]();
            }
            delete(me._complete[requestId]);
        },10)
    },

    parallel: function(apis, callback){
        var i, q = apis.length;
        
        for (i=0; i<q; i++){
            this.responseComplete(apis[i], function(){
                q--;
                if (q==0) callback();
            });
        }
    },

    sequence: function(apis){
        var me = this; 
        var index = 0; 
        var q = apis.length;
        
        next();

        function next(p1,p2,p3){
            apis[index++](next, p1, p2, p3);
        }
    },

    getCache: function(url, useCache){
        var cache;
        
        if ( (!this.cache && !useCache) || useCache===false ){
            return null;
        }

        try {
            cache = JSON.parse(cacheStorage.getItem(url));
        } catch (error) {
            cache= null;
        }

        return cache;
    },

    setCache: function(url, value, force){
        if (this.cache || force){
            cacheStorage.setItem(url, JSON.stringify(value));
        }
    },

    prepareUrl: function(url, obj){
        var i, d, s, a;

        for (i in obj){
            d = obj[i];
            if (d===null || d===undefined || (typeof(d)!='string' && typeof(d)!='number' && typeof(d)!='boolean') ){
                d = '';
            }
            url = url.replace('{'+i+'}', d);
        }

        a = url.split('://');
        return a.length>1 ? (a[0] + '://' + a[1].split('//').join('/')) : (a[0].split('//').join('/'));
    },

    hash: function(str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },

    send: function(api, definition){
        var i, d, r, id;
        var me = this;
        var params = definition.params || {};
        var requestId = 'ri_'+(++requestIdIndex)
        
        api = typeof(api)=='string' ? {method:'GET', url:api} : Object.assign({}, api);
        api.method = api.method || 'GET';
        api.url = this.prepareUrl(api.url, params);

        id = 'api' + this.hash(api.method + '|' + api.url + (params ? JSON.stringify(params) : ''));

        r = me.getCache(id, definition.cache);
        if (r){
            me.responseAnalyse(null, r, definition, requestId);
            return requestId
        }

        if (typeof(definition.request)=='function'){
            definition.request();
        }

        Ext.Ajax.request({
            url: api.url,
            method: api.method,
            params: params,
            success: function (response) {
                var json;
                
                try {
                    json = JSON.parse(response.status == 204 ? '{}' : response.responseText);
                } catch (error) {
                    json = {error:true, message:'Invalidate JSON Response'};
                }

                if (!json.error){
                    me.setCache(id, json, definition.cache);
                }

                me.responseAnalyse(json.error ? json : null, json.error ? response : json, definition, requestId);
            },
            failure: function (response, opts) {
                if (definition.errorMessage!==false){
                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText, // + '<br>' + response.responseText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING,
                        fn: function(){
                            me.responseAnalyse(response, null, definition, requestId);
                        }
                    });
                }else{
                    me.responseAnalyse(response, null, definition, requestId);
                }
            }
        });

        return requestId;
    },

    insert: function(url, definition){
        var api = {
            method:'POST', 
            url:url
        };

        return this.send(api, definition);
    },

    update: function(url, definition){
        var api = {
            method:'PUT', 
            url:url + (definition.params ? definition.params.id || 'id' : 'id') + '/'
        };

        return this.send(api, definition);
    },

    delete: function(url, definition){
        var api = {
            method:'DELETE', 
            url:url + (definition.params ? definition.params.id || 'id' : 'id') + '/'
        };

        return this.send(api, definition);
    }
});
