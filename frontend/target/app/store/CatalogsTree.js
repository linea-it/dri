Ext.define('Target.store.CatalogsTree', {
    extend: 'Ext.data.TreeStore',

    alias: 'store.catalogs-tree',

    requires: [
        'Target.model.Catalog'
    ],

    model: 'Target.model.Catalog',

    autoLoad: false,

    remoteFilter: true,

    proxy: {
        type: 'ajax',
        api: {
            read: '/PRJSUB/TargetViewer/getTargetCatalogs',
            destroy: '/PRJSUB/TargetViewer/removeCatalogByUser'
        },
        reader: {
            type: 'json',
            messageProperty : 'msg'
        },
        writer: {
            type: 'json',
            rootProperty: 'data',
            writeAllFields: false,
            encode: true,
            allowSingle: true
        }
    },

    // Verificar se a store recebeu success=false e trata mostrando a mensagem
    // Usado para quando o request funciona mas o model python retorna falso um
    // Exemplo e erro de sessao. e necessario colocar no proxy reader o atributo
    // messageProperty
    listeners: {
        load: function (store, records, successful, eOpts) {
            if (!successful) {
                try {
                    var error = eOpts.getError();

                    // recuperar o valor que esta na propriedade messageProperty
                    Ext.MessageBox.show({
                        title: 'Sorry!',
                        msg: 'But there was a failure and it was not possible to load the data.</br>' + error.status + ' - ' + error.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });

                    console.log(error.response.responseText);

                }
                catch (e) {
                    Ext.Msg.alert('Sorry!', 'There was a failure and it was not possible to load the data.');
                }
            }
        }
    }
});
