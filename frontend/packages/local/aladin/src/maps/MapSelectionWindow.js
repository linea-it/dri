Ext.define('aladin.maps.MapSelectionWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'aladin.maps.MapSelectionController'
    ],

    xtype: 'aladin-maps-mapselectionwindow',

    controller: 'mapselection',
    viewModel: 'mapselection',

    config: {
        aladin: null
    },

    initComponent: function () {
        var me = this,
            vm = me.getViewModel();

        Ext.apply(this, {
            title: 'Map viewer',
            closeAction: 'hide',
            bodyPadding: 5,
            items: [
                {
                    xtype: 'checkbox',
                    reference: 'chkOnOff',
                    boxLabel: 'Display Map',
                    handler: 'onClickBtnOnOff',
                    bind: {
                        disabled: '{!aladin_switchable}',
                        value: '{map_selected}'
                    }
                },
                {
                    xtype: 'combobox',
                    reference: 'cmbType',
                    fieldLabel: 'Map Type:',
                    labelAlign: 'top',
                    emptyText: '<Types>',
                    displayField: 'pgr_display_name',
                    valueField: 'pgr_group',
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    listeners: {
                        select: 'onSelectMapType'
                    },
                    editable: false,
                    queryMode: 'local'
                },
                {
                    xtype: 'combobox',
                    reference: 'cmbClass',
                    fieldLabel: 'Map Class:',
                    labelAlign: 'top',
                    emptyText: '<Classes>',
                    displayField: 'pcl_display_name',
                    valueField: 'prd_class',
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    listeners: {
                        select: 'onSelectMapClass'
                    },
                    editable: false,
                    queryMode: 'local',
                },
                {
                    xtype: 'combobox',
                    reference: 'cmbFilter',
                    fieldLabel: 'Filter:',
                    labelAlign: 'top',
                    emptyText: '<Filters>',
                    displayField: 'prd_filter',
                    valueField: 'id',
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    listeners: {
                        select: 'onSelectMapFilter'
                    },
                    editable: false,
                    queryMode: 'local',
                }
            ]
        });

        me.callParent(arguments);
    },

    setRelease: function(release) {
        //console.log('setRelease(%o)', release);

        var me = this,
            vm = me.getViewModel();

        if (release != vm.get('release')) {
            vm.set('release', release);
            me.fireEvent('changerelease', release);
        }
    }

});
