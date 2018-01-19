Ext.define('Sky.view.main.Toolbar', {
    extend: 'common.header.Toolbar',

    requires: [
        'common.header.Toolbar'
    ],

    xtype: 'dri-header-sky',

    viewItems: function() {
        var me = this,
            items = me.callParent();

        items.splice(3, 0, {
            xtype: 'container',
            reference: 'searchGlobal',
            width: 290,
            layout: {
                type: 'hbox',
                align: 'left'
            },
            items:[
                {
                    xtype: 'button',
                    text: 'RA, Dec (Deg)',
                    width: 120,
                    queryMode:'local',
                    store:['',''],
                    menu: {
                        xtype: 'menu',
                        items: [
                            {
                                name:'latlng', text: 'RA, Dec (Deg)'
                            },
                            // {
                            //     name:'HMS', text: 'RA, Dec (HMS)'
                            // }
                        ],
                        listeners : {
                            click: function(button,item) {
                                if (item){
                                    this.up('button').setText(item.text);
                                    me.fireEvent('changeCoordinateSystem', {name:item.name, textfield:me.getReferences().txtCoordinateSearch});
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'textfield',
                    emptyText: 'RA (deg), Dec (deg)',
                    reference: 'txtCoordinateSearch',
                    triggers: {
                        goto: {
                            cls: 'x-form-search-trigger',
                            scope: me,
                            tooltip: 'Go To position. 356.0085, 0.5168 or 23 44 2.040 +00 31 0.48',
                            handler: function(e){
                                me.fireEventGotoPosition( e.getValue() );
                            },
                        }
                    },
                    listeners: {
                        scope: me,
                        specialkey: function (f, e) {
                            if (e.keyCode == 13) {
                                me.fireEventGotoPosition( f.getValue() );
                            }
                        }
                    }
                }
            ]
        });

        return items;
    },

    fireEventGotoPosition: function(value){
        this.lookup('txtCoordinateSearch').reset();
        this.fireEvent('dosearch', value);
    },

});
