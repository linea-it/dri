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
            //layout: 'hbox',
            items: [
                {
                    xtype: 'combobox',
                    reference: 'cmbType',
                    fieldLabel: 'Choose the Map\'s Type',
                    labelAlign: 'top',
                    emptyText: '<Types>',
                    displayField: 'pgr_display_name',
                    valueField: 'pgr_group',
                    // bind: {
                    //     store: '{types_store}'
                    // },
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    // store: new Ext.data.ArrayStore({
                    //     fields: [
                    //         'pgr_group',
                    //         'pgr_display_name'
                    //     ]
                    // }),
                    listeners: {
                        select: 'onSelectMapType'
                    },
                    editable: false,
                    queryMode: 'local'
                },
                {
                    xtype: 'combobox',
                    reference: 'cmbClass',
                    fieldLabel: 'Choose the Map\'s Class',
                    labelAlign: 'top',
                    emptyText: '<Classes>',
                    displayField: 'pcl_display_name',
                    valueField: 'prd_class',
                    // bind: {
                    //     store: '{classes_store}',
                    //     disabled: '{!cmbType.selection}'
                    // },
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    // store: new Ext.data.ArrayStore({
                    //     fields: [
                    //         'prd_class',
                    //         'pcl_display_name'
                    //     ]
                    // }),
                    listeners: {
                        select: 'onSelectMapClass'
                    },
                    editable: false,
                    queryMode: 'local',
                },
                {
                    xtype: 'combobox',
                    reference: 'cmbBand',
                    fieldLabel: 'Choose the Map\'s Band',
                    labelAlign: 'top',
                    emptyText: '<Bands>',
                    displayField: 'prd_filter',
                    valueField: 'id',
                    store: {
                        type: 'maps',
                        autoLoad: false,
                        remoteFilter: false
                    },
                    listeners: {
                        select: 'onSelectMapBand'
                    },
                    editable: false,
                    queryMode: 'local',
                }
            ]//,
            // buttons: [
            //     {text: 'g', band: 'g', handler: 'onClickBtnMap'},
            //     {text: 'r', band: 'r', handler: 'onClickBtnMap'},
            //     {text: 'i', band: 'i', handler: 'onClickBtnMap'},
            //     {text: 'z', band: 'z', handler: 'onClickBtnMap'},
            //     {text: 'Y', band: 'Y', handler: 'onClickBtnMap'},
            //     {text: 'griz', band: 'griz', handler: 'onClickBtnMap'},
            //     {text: 'grizY', band: 'grizY', handler: 'onClickBtnMap'},
            // ]
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
