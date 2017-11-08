var cacheStorage = sessionStorage;

Ext.define('UserQuery.view.service.ApiBase', {
    cache: location.href.includes('/dev/'),

    _proxy: {},

    proxy: function(name, callback){
        this._proxy[name] = callback;
    },

    responseAnalyse: function(error, result, definition){
        var proxy;

        if (typeof(definition)=='function'){
            definition(error, result);
        }else{
            proxy = this._proxy[definition.proxy] || (typeof(definition.proxy)=='function' ? definition.proxy : null);

            if (!error && proxy){
                result = proxy(result);
            }
            
            definition.response(error, result);
        }
    },

    getCache: function(url, force){
        var cache;
        
        if (!this.cache && !force){
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

    send: function(method, url, definition){
        var r;
        var me = this;
        var params = definition.params;
        var id = 'api'+hash(method + '|' + url + (params ? JSON.stringify(params) : ''));

        r = me.getCache(id, definition.cache);
        if (r){
            return me.responseAnalyse(null, r, definition);
        }

        if (typeof(definition.request)=='function'){
            definition.request();
        }

        Ext.Ajax.request({
            url: url,
            method: method,
            params: params,
            success: function (response) {
                var json;
                
                try {
                    json = JSON.parse(response.responseText);
                } catch (error) {
                    json = {error:true, message:'Invalidate JSON Response'};
                }

                if (!json.error){
                    me.setCache(id, json, definition.cache);
                }

                me.responseAnalyse(json.error ? json : null, json.error ? response : json, definition);
            },
            failure: function (response, opts) {
                me.responseAnalyse(response, null, definition);
            }
        });
    },
});