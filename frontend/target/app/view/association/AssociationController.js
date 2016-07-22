Ext.define('Target.view.association.AssociationController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Target.model.CatalogColumn'
    ],

    alias: 'controller.association',

    listen: {
        component: {
            'targets-association': {
                changeproduct: 'onChangeProduct'
            }
        },
        store: {
            '#ClassContent': {
                load: 'onLoadClassContent'
            },
            '#ProductContent': {
                load: 'onLoadProductContent'
            },
            '#ProductAssociation': {
                load: 'onLoadProductAssociation'
            }
            // '#objects': {
            //     update: 'onUpdateObject'
            // }
        }

    },

    onChangeProduct: function (product) {
        console.log('onChangeProduct');
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('association'),
            currentCatalog = vm.get('currentCatalog');

        // Limpar a store de associacao usada na grid
        association.removeAll();

        currentCatalog.set('id', product);

        currentCatalog.load({
            callback: function () {
                me.loadClassContents();
            }
        });
    },

    loadClassContents: function () {
        console.log('loadClassContents');
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            classContents = vm.getStore('classcontent');

        // Carregar as propriedades associadas a classe
        // Todo filtrar por classe trazer os com classe null
        classContents.load();

    },

    onLoadClassContent: function () {
        console.log('onLoadClassContent()');
        var me = this;

        me.loadProductContent();

    },

    loadProductContent: function () {
        console.log('loadProductContent');
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            productContents = vm.getStore('productcontent');

        // Carregar as propriedades do catalogo.
        productContents.filter([
            {
                property: 'pcl_product_id',
                value: currentCatalog.get('id')
            }
        ]);
    },

    onLoadProductContent: function () {
        console.log('onLoadProductContent()');
        var me = this;

        me.loadAssociations();

    },

    loadAssociations: function () {
        console.log('loadAssociations');
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            productAssociations = vm.getStore('productassociation');

        // Carregar as propriedades associadas.
        productAssociations.filter([
            {
                property: 'pca_product',
                value: currentCatalog.get('id')
            }
        ]);
    },

    onLoadProductAssociation: function () {
        console.log('onLoadProductAssociation');
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('association'),
            productContents = vm.getStore('productcontent'),
            productAssociations = vm.getStore('productassociation');

        // Para cada propriedade que o produto possui adicionar a store que está na associada a grid
        productContents.each(function (record) {
            console.log(record);
            var a = productAssociations.findRecord('pca_product_content', record.get('id'));

            // Se houver associacao adicionar o elemento a store.
            if (!a) {
                // nao tem associacao criar uma vazia.
                console.log('record: %o', record);
                a = Ext.create('Target.model.CatalogColumn', {
                    'pca_product_id': record.get('pcn_product_id'),
                    'pca_product_content': record.get('id'),
                    'pcn_column_name': record.get('pcn_column_name')
                });
            }

            association.add(a);

        },this);

    }

});
