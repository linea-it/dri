Ext.define('Sky.view.main.Toolbar', {
    extend: 'common.header.Toolbar',

    requires: [
        'common.header.Toolbar'
    ],

    xtype: 'dri-header-sky',

    viewItems: function() {
        var items = this.callParent();

        items.splice(3, 0, {
            xtype: 'textfield',
            emptyText: 'RA (deg), Dec (deg)',
            width: 150,
            triggers: {
                goto: {
                    cls: 'x-form-search-trigger',
                    scope: this,
                    tooltip: 'Go To position. 356.0085, 0.5168 or 23 44 2.040 +00 31 0.48',
                    handler: function(e){
                        this.fireEventGotoPosition( e.getValue() );
                    },
                }
            },
            listeners: {
                scope: this,
                specialkey: function (f, e) {
                    if (e.keyCode == 13) {
                        this.fireEventGotoPosition( f.getValue() );
                    }
                }
            }
        });
         
        return items;
    },

    fireEventGotoPosition: function(value){
        var position = this.parsePosition( value );

        if (position){
            this.fireEvent('dosearch', position);
        }
    },

    parsePosition: function (position) {
        var ra, dec, newposition;

        if (position) {
            // Fix if value in degrees need a space between values
            if (position.indexOf(',') != -1) {
                position = position.split(',');
                ra = position[0].trim();
                dec = position[1].trim();
                newposition = [ra, dec];
                position = newposition.join(', ');
            } else {
                position = newposition;
            }

            return newposition;
        }
    }
});