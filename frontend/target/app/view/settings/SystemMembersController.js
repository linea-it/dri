Ext.define('Target.view.settings.SystemMembersController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.system_members',

    listen: {
        component: {
            'targets-system-members': {
                changecatalog: 'onChangeCatalog'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            products = vm.getStore('products'),
            relateds = vm.getStore('productRelateds');

        if (currentCatalog.get('pcl_is_system')) {
            // Checar se ja existe uma relacao com o produto
            relateds.addFilter({
                property: 'prl_product',
                value: currentCatalog.get('id')
            });
            relateds.load({
                callback: function () {
                    me.onLoadRelateds(this);
                }
            });
        }
    },

    onLoadRelateds: function (relateds) {
        var me = this,
            vm = me.getViewModel(),
            related;

        if (relateds.count() > 0) {
            related = relateds.first();
            vm.set('productRelated', related);

        }

        me.loadAvailableMembersCatalog();

    },

    loadAvailableMembersCatalog: function () {
        var me = this,
           vm = me.getViewModel(),
           currentCatalog = vm.get('currentCatalog'),
           products = vm.getStore('products');

        products.addFilter({
            property: 'class_name',
            value: 'cluster_members'
        });

        if (currentCatalog.get('epr_original_id') !== null) {
            products.addFilter({
                property: 'process',
                value: currentCatalog.get('epr_original_id')
            });
        }

        products.load({
            callback: function () {
                me.onLoadAvailableMembersCatalog(this);
            }
        });
    },

    onLoadAvailableMembersCatalog: function (products) {
        var me = this,
            refs = me.getReferences(),
            cmb = refs.cmbAvailableMembers,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            related = vm.get('productRelated'),
            memberCatalog;

        // Se ja existir uma relacao entre os produtos
        if ((related) && (related.get('id') > 0)) {
            memberCatalog = products.getById(related.get('prl_related'));

        } else {
            // Varrer a lista de catalgos de membros disponiveis,
            // verificar se tem algum com o mesmo processo do current catalog
            if (currentCatalog.get('epr_original_id') !== null) {
                products.each(function (r) {
                    if (r.get('epr_original_id') == currentCatalog.get('epr_original_id')) {
                        memberCatalog = r;

                        return false;
                    }

                }, me);

            } else {
                // TODO tratar como vai ser com produtos que nao tem processo
            }
        }

        if (memberCatalog.get('id') !== 0) {
            // Seleciona o registro na combo
            cmb.select(memberCatalog);

            me.onSelectMembersCatalog(cmb, memberCatalog);
        }

    },

    onSelectMembersCatalog: function (combo, memberCatalog) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            related = vm.get('productRelated'),
            relateds = vm.getStore('productRelateds');

        if ((memberCatalog !== null) && (memberCatalog.get('id') > 0)) {

            vm.set('memberCatalog', memberCatalog);

            // Checar se existe um relate se nao existir criar um
            if (related.get('id') > 0) {
                // Ja existe related
                if (related.get('prl_related') != memberCatalog.get('id')) {
                    // O related e diferente do selecionado na combo
                    related.set('prl_related', memberCatalog.get('id'));
                    relateds.add(related);
                    relateds.sync({
                        callback: function () {
                            me.loadContents();
                        }
                    });

                } else {
                    // related selecioando e igual ao que esta no banco
                    // nao faz nada
                    me.loadContents();
                }

            } else {
                // Criar um novo related
                related.set('prl_product', currentCatalog.get('id'));
                related.set('prl_related', memberCatalog.get('id'));
                related.set('prl_cross_identification', null);

                relateds.add(related);
                relateds.sync({
                    callback: function () {
                        me.loadContents();
                    }
                });

            }
        }
    },

    loadContents: function () {
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('availableContents'),
            memberCatalog = vm.get('memberCatalog');

        // Carregar as propriedades do Catalogo de Membros.
        contents.addFilter([
            {
                property: 'pcn_product_id',
                value: memberCatalog.get('id')
            }
        ]);

        contents.load({
            callback: function () {
                me.preSelectCrossIdentification(this);
            }
        });

    },

    preSelectCrossIdentification: function (contents) {
        var me = this,
            refs = me.getReferences(),
            cmb = refs.cmbMembersProperties,
            vm = me.getViewModel(),
            related = vm.get('productRelated'),
            content;

        // Seleciona a propriedade baseada no UCD
        contents.each(function (c) {
            if (c.get('ucd') === 'meta.id.cross') {
                content = c;
                return false;
            }
        }, me);


        // SELECIONAR A PROPRIEDADE QUE JA ESTIVER NO RELATED
        if (related.get('id') > 0) {
            if (related.get('prl_cross_identification') > 0) {
                // Ja tem uma propriedade setada
                content = contents.getById(related.get('prl_cross_identification'));

            }
        }

        if (content) {
            cmb.select(content);
            me.onSelectCrossIdentification(cmb, content);
        }

    },

    onSelectCrossIdentification: function (combo, crossIdentification) {
        var me = this,
            vm = me.getViewModel(),
            related = vm.get('productRelated'),
            relateds = vm.getStore('productRelateds');

        if ((crossIdentification) && (crossIdentification.get('id') > 0)) {
            vm.set('crossIdentification', crossIdentification);

            // TODO verificar se precisa atualizar o related
            if (related.get('id') > 0) {
                // Ja existe cross_identification diferente da selecionada
                // Se for igual nao faz nada
                if (related.get('prl_cross_identification') !== crossIdentification.get('id')) {

                    console.log('TODO: UPDATE UM NOVO RELATED');

                    related.set('prl_cross_identification', crossIdentification.get('id'));
                    relateds.add(related);
                    relateds.sync();
                }
            }
        }
    }
});
