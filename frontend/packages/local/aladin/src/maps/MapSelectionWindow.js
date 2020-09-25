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
                    xtype: 'combobox',
                    reference: 'cmbType',
                    fieldLabel: 'Map Type:',
                    labelAlign: 'top',
                    emptyText: 'Types',
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
                    emptyText: 'Classes',
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
                    emptyText: 'Filters',
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
                },
                {
                    xtype: 'checkbox',
                    reference: 'chkOnOff',
                    boxLabel: 'Display Map',
                    handler: 'onDisplayOnOff',
                    bind: {
                        disabled: '{!aladin_switchable}',
                        value: '{map_selected}'
                    }
                },
                {
                    xtype: 'button',
                    text: 'Picker Signal',
                    iconCls: 'x-fa fa-eyedropper',
                    enableToggle: true,
                    toggleHandler: 'onTogglePickerMapSignal',
                    reference: 'btnPicker',
                    bind: {
                        disabled: '{!aladin_last_map_survey}',
                        pressed: '{wait_picker}'
                    }
                },
                // TODO: Só para testes.
                {
                    xtype: 'textfield',
                    label: 'Signal',
                    labelWidth: 50,
                    // labelAlign: 'lef',
                    bind: {
                        value: '{map_signal}'
                    }
                },
                {
                    xtype: 'button',
                    text: 'Teste MAP',
                    handler: 'testeMap'
                },
            ]
        });

        me.callParent(arguments);
    },

    setRelease: function (release) {
        //console.log('setRelease(%o)', release);

        var me = this,
            vm = me.getViewModel();

        if (release != vm.get('release')) {
            vm.set('release', release);
            me.fireEvent('changerelease', release);
        }
    },

    setAladin(aladin) {
        // console.log("setAladin(%o)", aladin);
        var me = this;

        // Adiciona um listener ao Aladin, para ouvir o evendo de picker que foi adicionado 
        // pela ação do botão Picker.
        aladin.addListener('mappickersignal', 'onPickerMapSignal', me.getController());

        // Lister no right click no aladin, usa este evento para desabilitar a ação de picker.
        aladin.addListener('contextmenu', 'onAladinContextMenu', me.getController());


        me.aladin = aladin;

    }

});
