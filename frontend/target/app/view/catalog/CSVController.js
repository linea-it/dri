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
    baseProperties: ['id', 'ra', 'dec'],

    addCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            values, data, name, release, isPublic, csvData;

        // if (form.isValid()) {

        values = form.getValues();

        me.validateCSVDAta(values.csvData);

        // Criando um internal name
        name = values.displayName.split(' ').join('_');
        name = name.toLowerCase().trim();

        release = values.release !== '' ? [values.release] : [];

        isPublic = values.isPublic === 'on' ? true : false;

        data = {
            products: [{
                type: 'catalog',
                class: values.classname,
                name: name,
                display_name: values.displayName,
                releases: release,
                is_public: isPublic,
                description: values.description,
                csvData: values.csvData
            }]
        };

        view.setLoading(true);
        // }
    },

    validateCSVDAta: function (csvData) {
        console.log('validateCSVDAta');

        var me = this,
            lines = csvData.split('\n');

        // lines nao pode ser 0
        if (lines.length === 0) {
            // TODO marcar o campo como invalido
            return false;
        }

        // Checar se tem header
        headers = me.getHeaders(lines[0]);

        // checar se tem pelo menos id, ra, dec

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            console.log('line [%o] : %s', i, line);
        }

    },

    getHeaders: function (line) {
        console.log('getHeaders(%o)', line);
        var me = this,
            hdrs = [],
            bases = [];

        properties = line.split(me.separator);

        Ext.each(properties, function (property) {
            console.log(property);
            console.log(parseInt(property));
            a = property;
            if (isNaN(parseInt(a))) {

                console.log('property: %o e string', property);
                property = property.toLowerCase().trim();

                hdrs.push(property);
                if (me.baseProperties.indexOf(property)) {
                    bases.push(property);
                }
            } else {
                console.log('nao e uma string');
            }
        }, me);

        console.log(hdrs);

        if (me.baseProperties.length === bases.length) {
            return hdrs;
        } else {
            return [];
        }
    },

    onCancelAddCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            win = view.up('window');

        form.reset();
        win.close();

    }

    // getAddedCatalog: function (name) {
    //     var me = this,
    //         store = Ext.create('Target.store.Catalogs',{}),
    //         catalog;
    //
    //     store.filter({
    //         property: 'prd_name',
    //         value: name
    //     });
    //
    //     store.load({
    //         callback: function (records, operations, success) {
    //             if ((success) && (records.length == 1)) {
    //                 catalog = store.first();
    //
    //                 alert('Rodando em background');
    //             }
    //         }
    //     });
    // }

});
