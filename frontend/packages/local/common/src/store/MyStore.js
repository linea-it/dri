Ext.define('common.store.MyStore', {
    extend: 'Ext.data.Store',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django'
    },

    // Verificar se a store recebeu success=false e trata mostrando a mensagem
    // Usado para quando o request funciona mas o model python retorna falso um
    // Exemplo e erro de sessao.
    listeners: {
        load: function (store, records, successful, eOpts) {
            if (successful === false) {

                var proxy = store.proxy;
                var reader = proxy.reader;

                if (reader.jsonData) {
                    var jsonData = reader.jsonData;

                    if (jsonData != 'undefined') {
                        console.log('Load Failure: %o', jsonData);
                        Ext.Msg.alert('Status', jsonData.msg);
                    }

                } else {
                    var error = eOpts.getError();

                    switch (error.status) {
                        case 403:
                            // 403 - Forbidden
                            var response = JSON.parse(error.response.responseText);
                            Ext.MessageBox.show({
                                title: error.status + ' - ' + error.statusText,
                                msg: response.detail,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.WARNING,
                                closable: false,
                                scope: this,
                                fn: function () {
                                    var pathname = window.location.pathname,
                                        hostname = window.location.hostname,
                                        location;

                                    location = Ext.String.format('http://{0}/dri/api/api-auth/login/?next={1}', hostname, pathname);

                                    window.location.assign(location);

                                }
                            });

                            break;

                        default:
                            Ext.MessageBox.show({
                                header: false,
                                closable: false,
                                msg: 'Error ' + error.status + ' - ' + error.statusText,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.WARNING,
                                scope: this
                            });
                    }
                }
            }
        }
    }
});
