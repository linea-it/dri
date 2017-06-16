Ext.define('Home.view.pages.Home', {
    extend: 'Ext.panel.Panel',
    xtype: 'pages-home',
    requires: [
        // 'Home.view.widget.Wsky',
        // 'Home.view.widget.Wrelease',
        // 'Home.view.widget.Wtile',
        // 'Home.view.widget.Wtarget',
        // 'Home.view.widget.Wsquery',
        // 'Home.view.widget.Wupload',
        // 'Home.view.widget.Wcutout',
        // 'Home.view.widget.Wcatalog',
        // 'Home.view.widget.Wlist'
    ],
    layout: 'column',
    addMenu: function (store) {
        var me = this;
        store.each(function (record) {
            me.add({
                xtype: 'panel',
                layout: 'vbox',
                frame: true,
                width: 260,
                margin: '0 10 10 0',
                items: [{
                    xtype: 'panel',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'image',
                            src: record.get('app_icon_src'),
                            width: 130,
                            height: 114
                        },{
                            html: '<br>' + record.get('app_short_description'),
                            width: 128
                        }
                    ]
                },{
                    xtype: 'button',
                    text : 'Tutorial',
                    margin: '0 3 3 190',                    
                    disabled : record.get('app_disabled'),
                    handler: function() {
                        Ext.getCmp('tab_panel_id').setActiveTab(record.get('id'));  
                    },
                    
                },{
                    xtype: 'button',                    
                    text    : record.get('app_display_name'),
                    width: 260,
                    scale: 'large',
                    disabled : record.get('app_disabled'),
                    handler : function () {
                        window.open(record.get('app_url'),'_self');
                    }
                }]

            });
        },this);
    },

    initComponent: function () {
        var me = this;
        var pluginExpanded = true;
        var store = Ext.create('home.store.Menu');

        store.load({
            callback: function (records, options, success) {
                if (success) {
                    me.addMenu(store);
                }
            }
        });
        this.callParent();
    }
});
