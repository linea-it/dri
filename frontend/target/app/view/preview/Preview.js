Ext.define('Target.view.preview.Preview', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.preview.PreviewController',
        'Target.view.preview.PreviewModel',
        'Target.view.preview.Visiomatic',
        'Ext.ux.rating.Picker'
    ],

    xtype: 'targets-preview',

    controller: 'preview',

    viewModel: 'preview',

    config: {
        currentRecord: null
    },

    layout: 'fit',

    items: [
        {
            xtype: 'targets-visiomatic',
            reference: 'visiomatic',
            bind: {
                showCrosshair: '{BtnCrosshair.pressed}',
                hidden: '{is_empty}'
            },
            listeners: {
                objectMenuItemClick: 'onObjectMenuItemClickVisiomatic',
                imageMenuItemClick: 'onImageMenuItemClickVisiomatic'
            }
        }
    ],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [
            {
                xtype: 'combobox',
                reference: 'currentDataset',
                publishes: 'id',
                width: 250,
                displayField: 'release_tag',
                bind: {
                    store: '{datasets}',
                    disabled: '{!currentRecord._meta_id}'
                },
                queryMode: 'local',
                listConfig: {
                    itemTpl: [
                        '<div data-qtip="{release_display_name} - {tag_display_name}">{release_display_name} - {tag_display_name}</div>'
                    ]
                },
                listeners: {
                    change: 'onChangeDataset'
                }
            },
            {
                xtype: 'textfield',
                width: 120,
                readOnly: true,
                bind: {
                    value: '{currentDataset.tli_tilename}'
                }
            }
        ]
    },
    {
        xtype: 'toolbar',
        dock: 'top',
        items: [
            // Campo de Rating usando Number Field. troquei pelo componente Rating. 
            {
                xtype: 'numberfield',
                maxValue: 5,
                minValue: 0,
                width: 100,
                fieldLabel: 'Rating',
                labelWidth: 45,
                bind: {
                    value: '{currentRecord._meta_rating}',
                    disabled: '{is_empty}'
                }
            },
            // TODO: Provavelmente o update para versão 7.0 deve corrigir esse bug e este campo oculto
            // Componente Rating causa um erro por não ter o metodo disabled. e atrapalha os demais botões. 
            // {
            //     xtype: 'numberfield',
            //     hidden: true
            // },
            // {
            //     xtype: 'tbtext',
            //     html: 'Rating'
            // },
            // {
            //     xtype: 'rating',
            //     minimum: 0,
            //     scale: '120%',
            //     selectedStyle: 'color: rgb(96, 169, 23);',
            //     style: {
            //         'color': '#777777'
            //     },
            //     bind: {
            //         value: '{currentRecord._meta_rating}',
            //     }
            // },
            {
                xtype: 'checkboxfield',
                reference: 'btnReject',
                hideLabel: true,
                boxLabel: 'Reject',
                bind: {
                    value: '{currentRecord._meta_reject}',
                    disabled: '{is_empty}'
                }
            },
            {
                xtype: 'button',
                iconCls: 'x-fa fa-commenting',
                tooltip: 'Comments',
                bind: {
                    disabled: '{is_empty}'
                },
                handler: 'onClickComment'
            },
            '-',
            {
                xtype: 'button',
                text: 'Explorer',
                tooltip: 'See more information about this object in Explorer app',
                ui: 'soft-blue',
                iconCls: 'x-fa fa-info-circle',
                handler: 'onExplorer',
                reference: 'BtnExplorer',
                bind: {
                    disabled: '{is_empty}'
                }
            },
            '-',
            {
                xtype: 'button',
                iconCls: 'x-fa fa-arrows',
                tooltip: 'Center',
                handler: 'onCenterTarget',
                bind: {
                    disabled: '{is_empty}'
                }
            },
            {
                xtype: 'button',
                iconCls: 'x-fa fa-crosshairs',
                tooltip: 'Show/Hide Crosshair',
                enableToggle: true,
                pressed: true,
                handler: 'onToggleCrosshair',
                reference: 'BtnCrosshair',
                bind: {
                    disabled: '{is_empty}'
                }
            },
            // TODO: Refactoring funções relacionadas ao comentário por posição.
            // {
            //     xtype: 'button',
            //     reference: 'btnComments',
            //     iconCls: 'x-fa fa-comments',
            //     enableToggle: true,
            //     toggleHandler: 'showHideComments',
            //     tooltip: 'Show/Hide Comments',
            //     pressed: true,
            //     hidden: true,
            //     bind: {
            //         disabled: '{is_empty}'
            //     }
            // },
            {
                xtype: 'button',
                reference: 'btnCrop',
                iconCls: 'x-fa fa-crop',
                enableToggle: true,
                toggleHandler: 'showHideCrop',
                tooltip: 'Crop',
                bind: {
                    disabled: '{is_empty}'
                },
                pressed: true
            },
            // {
            //     xtype: 'button',
            //     reference: 'btnSave',
            //     iconCls: 'x-fa fa-download',
            //     handler: 'onSave',
            //     tooltip: 'Download',
            //     bind: {
            //         disabled: '{is_empty}'
            //     }
            // },
            '-',
            {
                xtype: 'button',
                reference: 'btnRadius',
                iconCls: 'x-fa fa-circle-o',
                tooltip: 'Show System Radius',
                enableToggle: true,
                toggleHandler: 'showHideRadius',
                pressed: true,
                hidden: true,
                bind: {
                    disabled: '{is_empty}'
                }
            },
            {
                xtype: 'button',
                reference: 'btnMembers',
                iconCls: 'x-fa fa-dot-circle-o',
                tooltip: 'Show System Members',
                enableToggle: true,
                toggleHandler: 'showHideMembers',
                pressed: true,
                hidden: true,
                bind: {
                    disabled: '{is_empty}'
                }
            }
        ]
    }],

    setCurrentRecord: function (record, catalog) {
        // console.log('setCurrentRecord(%o)', record)
        var me = this,
            vm = me.getViewModel();

        if ((record) && (record.get('_meta_catalog_id') != null)) {
            // Setar o currentRecord no Painel
            me.currentRecord = record;

            // Setar o currentRecord no viewModel
            vm.set('currentRecord', record);

            // Marcar no view model o atributo is_empty como false para habilitar os botoes
            vm.set('is_empty', false);

            // Setar o catalogo
            vm.set('currentCatalog', catalog);

            // Declarando se o Catalogo exibe single objects ou sistemas.
            vm.set('is_system', catalog.get('pcl_is_system'));

            // disparar evento before load
            me.fireEvent('changerecord', record, me);


            // Habilita o painel de preview. 
            // TODO: Esta ação lança um erro no console relacionado a um metodo enable missing. 
            // Erro causado pelo componente ux.rating que não tem esse metodo implementado.
            // Na atualização para versão ExtJS 7.0 este erro foi corrigido. 
            me.setDisabled(false);
        }
    },

    clear: function () {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            datasets = vm.getStore('datasets'),
            members = vm.getStore('members');

        // comments = vm.getStore('comments');

        // limpa o datasets e o texto da combo
        datasets.clearData();
        refs.currentDataset.clearValue();

        // Limpa o Record
        record = Ext.create('Target.model.Object', {});
        vm.set('currentRecord', record);

        // oculta o visiomatic e desabilita botões
        vm.set('is_empty', true);

        // Store de Membros do cluster
        members.removeAll();
        members.clearFilter(true);

        // comments.removeAll();
        // comments.clearFilter(true);

        // Desabilita totalmente o painel de preview para 
        // evitar ações do usuario sem que tenha um objeto selecionado.
        me.setDisabled(true);

        // Desabilita totalmente o painel de preview para 
        // evitar ações do usuario sem que tenha um objeto selecionado.
        me.setDisabled(true);

    }

});
