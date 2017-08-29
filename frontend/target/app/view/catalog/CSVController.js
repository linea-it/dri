/**
 *
 */
Ext.define('Target.view.catalog.CSVController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.csvform',

    requires: [
        'Target.store.Catalogs',
        'Target.view.association.Panel'
    ],

    separator: ',',
    baseProperties: ['ra', 'dec'],

    addCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            values, data, name, release, isPublic, csvData;

        if (form.isValid()) {

            values = form.getValues();

            // headers = me.validateCSVDAta(values.csvData);
            // console.log(headers);

            // Criando um internal name
            name = values.displayName.split(' ').join('_');
            name = name.toLowerCase().trim();

            release = values.release !== '' ? [values.release] : [];

            isPublic = values.isPublic === 'on' ? true : false;

            data = {
                mime: 'csv',
                type: 'catalog',
                class: values.classname,
                name: name,
                displayName: values.displayName,
                releases: release,
                isPublic: isPublic,
                description: values.description,
                csvData: values.csvData
            };

            me.importTargetList(data);
        }
    },

    importTargetList: function (data) {
        var me = this,
            view = me.getView();

        view.setLoading(true);

        Ext.Ajax.request({
            cors: true,
            method: 'POST',
            url: '/dri/api/import_target_list/',
            success: function (response) {
                var data = JSON.parse(response.responseText);
                if (data.success) {
                    //Fechar a janela de registro
                    view.fireEvent('newproduct', data.product);

                    view.setLoading(false);

                } else {
                    view.setLoading(false);

                    Ext.MessageBox.show({
                        msg: data.message,
                        buttons: Ext.MessageBox.OK
                    });
                }
            },
            failure: function (response, opts) {
                view.setLoading(false);
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
    },

    // validateCSVDAta: function (csvData) {
    //     // console.log('validateCSVDAta');
    //
    //     var me = this,
    //         lines = csvData.split('\n');
    //
    //     // lines nao pode ser 0
    //     if (lines.length === 0) {
    //         // TODO marcar o campo como invalido
    //         return false;
    //     }
    //
    //     // Checar se tem header
    //     headers = me.getHeaders(lines[0]);
    //
    //     // checar se tem pelo menos id, ra, dec
    //
    //     for (var i = 0; i < lines.length; i++) {
    //         var line = lines[i];
    //
    //         if (line != '') {
    //             console.log('line [%o] : %s', i, line);
    //         }
    //     }
    //
    // },
    //
    // getHeaders: function (line) {
    //     // console.log('getHeaders(%o)', line);
    //     var me = this,
    //         hdrs = [],
    //         bases = [];
    //
    //     properties = line.split(me.separator);
    //
    //     Ext.each(properties, function (property) {
    //         console.log(property);
    //         console.log(parseInt(property));
    //         a = property;
    //         // Se a propriedade for uma string ela entra na lista de headers
    //         if (isNaN(parseInt(a))) {
    //             // console.log('property: %o e string', property);
    //             property = property.toLowerCase().trim();
    //
    //             hdrs.push(property);
    //             if (me.baseProperties.indexOf(property)) {
    //                 bases.push(property);
    //             }
    //         }
    //     }, me);
    //
    //     // Verifica se tem as headers obrigatorias.
    //     if (me.baseProperties.length === bases.length) {
    //         return hdrs;
    //     } else {
    //         return [];
    //     }
    // },

    onCancelAddCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            win = view.up('window');

        form.reset();
        win.close();

    }
});
