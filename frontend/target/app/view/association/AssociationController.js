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
        var me = this,
            vm = me.getViewModel(),
            association = vm.getStore('fakeassociation'),
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
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            classContents = vm.getStore('classcontent');

        // Carregar as propriedades associadas a classe
        classContents.removeAll();
        classContents.clearFilter(true);
        classContents.filter([
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
                property: 'pcl_product_id',
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

    },

    onSearchClassContent: function (value) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            classContents = vm.getStore('classcontent');

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

    },

    onCancelClassContent: function () {
        console.log('onCancelClassContent');
        this.loadClassContents();
    },

    onSearchAssociation: function () {
        console.log('onSearchAssociation');

    },

    onCancelAssociation: function () {
        console.log('onCancelAssociation');

    },

    onCellDrop: function (target, dragData) {
        var tRecord = target.record,
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
                console.log('update associacao');

            }
        }
    },

    addAssociation: function (record, target) {
        console.log('addAssociation(%o, %o)', record, target);

        record.save({
            callback: function (saved, operation, success) {
                if (success) {
                    // recupera o objeto inserido no banco de dados
                    var obj = Ext.decode(operation.getResponse().responseText);

                    console.log('success');

                    // Seta ao os id que foi adicionado para não precisar fazer reload na grid
                    target.set('id', obj.id);
                    target.set('pca_class_content', obj.pca_class_content);
                    target.commit(true);
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
    }

});
