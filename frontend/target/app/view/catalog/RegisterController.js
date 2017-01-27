/**
 *
 */
Ext.define('Target.view.catalog.RegisterController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.register',

    winAddCatalog: null,

    addCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form').getForm(),
            values, data, name, release;

        if (form.isValid()) {

            values = form.getValues();

            name = values.display_name.split(' ').join('_');
            release = values.release !== '' ? [values.release] : [];

            data = {
                // process: {
                //     owner_username: window.dri_username,
                products: [{
                    type: 'catalog',
                    class: values.classname,
                    name: name.toLowerCase().trim(),
                    display_name: values.display_name,
                    database: 'dessci',
                    schema: values.schema,
                    table: values.table,
                    releases: release,
                    description: values.description
                }]
                // }
            };

            // Submit Catalog
            Ext.Ajax.request({
                cors: true,
                method: 'POST',
                url: '/dri/api/importexternalprocess/',
                success: function () {
                    // Fechar a janela de registro
                    view.close();
                    Ext.toast('Data saved');

                },
                failure: function (response, opts) {
                    // TODO MENSAGEM DE ERRO E FECHAR A JANELA
                    view.close();
                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                },
                // Headers necessarios para fazer um Post Autheticado no Django
                headers: {
                    'Accept': 'application/json',
                    'Application': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
                },
                params: Ext.util.JSON.encode(data)
            });
        }
    }

});
