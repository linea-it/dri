Ext.define('common.data.proxy.CrsfToken', {
    singleton: true,

    constructor: function () {
        Ext.Ajax.on('beforerequest', function (conn, options) {
            /**
             * Glauber 23/01/2020
             * Alteração para resolver problema no ambiente de desenvolvimento usando containers.
             * apos colocar os apps Extjs em containers as requisições pararam de enviar o Header X-CSRFToken
             * por nao atenderem a regra de http e https. 
             * a solução é considerar que sempre vai ser necessário enviar os headers
             */
            if (typeof (options.headers) == 'undefined') {
                options.headers = {
                    'Accept': 'application/json',
                    'Application': 'application/json',
                    'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
                };
            } else {
                options.headers['Accept'] = 'application/json';
                options.headers['Application'] = 'application/json';
                options.headers['X-CSRFToken'] = Ext.util.Cookies.get('csrftoken');
            }
        }, this);
    }
});
