Ext.define('Target.view.association.AssociationController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Target.model.CatalogColumn',
        'Target.model.Association'
    ],

    alias: 'controller.association',

    listen: {
        component: {
            'targets-association': {
                changeproduct: 'onChangeProduct'
            }
        },
        store: {
            '#AuxCatalogs': {
                load: 'onLoadCatalogs'
            },
            '#ClassContent': {
                load: 'onLoadClassContent'
            },
            '#AuxProductContent': {
                load: 'onLoadProductContent'
            },
            '#ProductAssociation': {
                load: 'onLoadProductAssociation',
                datachanged: 'onAssociationChange'
            }
        }

    },

    onChangeProduct: function (product) {
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('fakeassociation'),
            catalogs = vm.getStore('catalogs');

        // Limpar a store de associacao usada na grid
        association.removeAll();

        catalogs.removeAll();
        catalogs.clearFilter(true);
        catalogs.filter([
            {
                property: 'id',
                value: product
            }
        ]);
    },

    onLoadCatalogs: function (store) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog;

        if (store.count() === 1) {
            currentCatalog = store.first();

            vm.set('currentCatalog', currentCatalog);

            me.loadClassContents();
        }

    },

    loadClassContents: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            classContents = vm.getStore('classcontent'),
            auxClassContents = vm.getStore('auxclasscontent');

        // Carregar as propriedades associadas a classe
        classContents.removeAll();
        classContents.clearFilter(true);
        classContents.filter([
            {
                property: 'pcc_class',
                value: currentCatalog.get('prd_class')
            }
        ]);

        // Carregar as propriedades associadas a classe
        auxClassContents.removeAll();
        auxClassContents.clearFilter(true);
        auxClassContents.filter([
            {
                property: 'pcc_class',
                value: currentCatalog.get('prd_class')
            }
        ]);
    },

    onLoadClassContent: function () {
        var me = this;

        me.loadProductContent();

    },

    loadProductContent: function () {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            grid = refs.productcontentgrid,
            currentCatalog = vm.get('currentCatalog'),
            productContents = vm.getStore('productcontent');

        grid.setLoading(true);

        // Carregar as propriedades do catalogo.
        productContents.filter([
            {
                property: 'pcn_product_id',
                value: currentCatalog.get('id')
            }
        ]);
    },

    onLoadProductContent: function () {
        var me = this;

        me.loadAssociations();

    },

    loadAssociations: function () {
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
        var me = this,
            view = me.getView(),
            refs = me.getReferences(),
            grid = refs.productcontentgrid,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            association = vm.getStore('fakeassociation'),
            productContents = vm.getStore('productcontent'),
            productAssociations = vm.getStore('productassociation');

        association.removeAll();

        // Para cada propriedade que o produto possui adicionar a store que está na associada a grid
        productContents.each(function (record) {
            var a = productAssociations.findRecord('pca_product_content', record.get('id'));

            // Se houver associacao adicionar o elemento a store.
            if (!a) {
                // nao tem associacao criar uma vazia.
                a = Ext.create('Target.model.CatalogColumn', {
                    'pca_product': currentCatalog.get('id'),
                    'pca_product_content': record.get('id'),
                    'pcn_column_name': record.get('pcn_column_name')
                });
            }

            association.add(a);

        },this);

        grid.setLoading(false);

        view.checkFinish();

    },

    onSearchClassContent: function (value) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            classContents = vm.getStore('auxclasscontent');

        if (value !== '') {

            classContents.removeAll();
            classContents.clearFilter(true);
            classContents.filter([
                {
                    property: 'pcc_class',
                    value: currentCatalog.get('prd_class')
                },
                {
                    property: 'search',
                    value: value
                }
            ]);
        } else {
            me.onCancelClassContent();
        }

    },

    onCancelClassContent: function () {
        this.loadClassContents();
    },

    onSearchAssociation: function (value) {
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('fakeassociation');

        if (value !== '') {
            association.clearFilter(true);

            association.filter([
                {
                    property: 'pcn_column_name',
                    value: value
                }
            ]);
        } else {
            me.onCancelAssociation();
        }

    },

    onCancelAssociation: function () {
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('fakeassociation');

        association.clearFilter();

    },

    onCellDrop: function (target, dragData) {
        var me = this,
            tRecord = target.record,
            previousValues = tRecord.previousValues.pcc_display_name,
            record;

        // Checar se a coluna que recebeu estava vazia
        if (previousValues == '') {
            // Criar um model Association
            record = Ext.create('Target.model.Association', {
                pca_product: tRecord.get('pca_product'),
                pca_class_content: dragData.record.get('id'),
                pca_product_content: tRecord.get('pca_product_content')
            });

            this.addAssociation(record, tRecord);

        } else {
            if (previousValues != dragData.record.pcc_display_name) {
                // TODO
            }
        }
    },

    addAssociation: function (record, target) {
        var me = this,
            view = me.getView();

        record.save({
            callback: function (saved, operation, success) {
                if (success) {
                    // recupera o objeto inserido no banco de dados
                    var obj = Ext.decode(operation.getResponse().responseText);

                    // Seta ao os id que foi adicionado para não precisar fazer reload na grid
                    target.set('id', obj.id);
                    target.set('pca_class_content', obj.pca_class_content);
                    target.commit(true);

                    view.checkFinish();
                }
            }
        });
    },

    onRemove: function () {
        var me = this,
            refs = me.getReferences(),
            grid = refs.productcontentgrid,
            fakeAssociation = grid.selection,
            record;

        record = Ext.create('Target.model.Association', {
            'id': fakeAssociation.get('id')
        });

        record.erase({
            callback: function (savedReject, operation, success) {
                if (success) {
                    me.loadProductContent();
                }
            }
        });
    },

    onRemoveAll: function () {

        Ext.MessageBox.confirm(
            'Confirm',
            'Are you sure you want to do that?',
            function (btn) {
                if (btn == 'yes') {
                    this.removeAll();
                }
            },
            this
        );
    },

    removeAll: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            store;

        store = Ext.create('Target.store.Association', {
            filters: [
                {
                    property: 'pca_product',
                    value: currentCatalog.get('id')
                }
            ]
        });
        store.load({
            scope: store,
            callback: function () {
                this.removeAll();
                this.sync({
                    scope: me,
                    callback: me.loadProductContent()
                });
            }
        });
        store = null;
    },

    onAssociationChange: function () {
        var me = this,
            view = me.getView();

        view.checkFinish();

    }

});
