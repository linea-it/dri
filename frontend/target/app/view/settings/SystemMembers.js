Ext.define('Target.view.settings.SystemMembers', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.SystemMembersController',
        'Target.view.settings.SystemMembersModel'
    ],

    xtype: 'targets-system-members',

    controller: 'system_members',

    viewModel: 'system_members',

    config: {
        currentCatalog: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    // region: 'north',
                    height: 80,
                    bodyPadding: 10,
                    html: [
                        'TEXTO Explicativo'
                        // '</br>' + 'The list can be public or private in this case only the users selected or who are part of a group can access it.' +
                        // '</br>' + 'You can create workgroups.'
                    ]
                },
                {
                    xtype: 'form',
                    bodyPadding: 10,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            items: [
                                {
                                    xtype: 'combobox',
                                    itemId: 'cmbAvailableMembers',
                                    reference: 'cmbAvailableMembers',
                                    publishes: 'id',
                                    fieldLabel: 'Available Cluster Members',
                                    displayField: 'prd_display_name',
                                    bind: {
                                        store: '{products}',
                                        selection: '{membersCatalog}'
                                    },
                                    listeners: {
                                        select: 'onSelectMembersCatalog'
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    editable: false,
                                    readOnly: false,
                                    width: 400,
                                    labelAlign: 'top'
                                },
                                {
                                    xtype: 'combobox',
                                    itemId: 'cmbMembersProperties',
                                    reference: 'cmbMembersProperties',
                                    publishes: 'id',
                                    fieldLabel: 'Choose the property that links members to their clusters',
                                    displayField: 'display_name',
                                    bind: {
                                        store: '{availableContents}',
                                        selection: '{crossIdentification}'
                                    },
                                    listeners: {
                                        select: 'onSelectCrossIdentification'
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    editable: false,
                                    readOnly: false,
                                    width: 400,
                                    labelAlign: 'top'
                                    // tpl: Ext.create('Ext.XTemplate',
                                    //     '<ul class="x-list-plain"><tpl for=".">',
                                    //         '<li role="option" class="x-boundlist-item">{column_name} - {name}</li>',
                                    //     '</tpl></ul>'
                                    // ),
                                    // // template for the content inside text field
                                    // displayTpl: Ext.create('Ext.XTemplate',
                                    //     '<tpl for=".">',
                                    //         '{abbr} - {name}',
                                    //     '</tpl>'
                                    // )
                                }
                            ]
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Finish',
                    ui: 'soft-green',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentCatalog: function (catalog) {
        var me = this,
            vm = me.getViewModel();

        me.currentCatalog = catalog;

        vm.set('currentCatalog', catalog);

        me.fireEvent('changecatalog', catalog, me);

    }
});
