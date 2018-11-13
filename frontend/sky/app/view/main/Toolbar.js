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
                            {
                                name:'tile', text: 'Tile ID'
                            },
                            {
                                name:'tli_tilename', text: 'Tile Name'
                            },
                        ],
                        listeners : {
                            click: function(button,item) {
                                let textfield, button

                                if (item){
                                    button = this.up('button')
                                    textfield = me.getReferences().txtCoordinateSearch

                                    // define o texto do botão e o emptytext da caixa de texto
                                    button.setText(item.text)
                                    textfield.setEmptyText(item.text)
                                    
                                    me.fireEvent('changeCoordinateSystem', {name:item.name, textfield:textfield});
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
