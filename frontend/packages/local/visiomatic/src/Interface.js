Ext.define('visiomatic.Interface', {

    makeToolbar: function () {
        return Ext.create('Ext.toolbar.Toolbar', {
            items: [ ]
        });
    },

    makeToolbarButtons: function () {
        var me = this,
            auxTools = me.getAuxTools(),
            tools = [];

        // Shift Aladin/Visiomatic
        if (me.getEnableShift()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Switch between Visiomatic / Aladdin.',
                iconCls: 'x-fa fa-exchange',
                scope: me,
                handler: me.onShift
            });
        }

        // Get Link
        if (me.getEnableLink()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Get link',
                iconCls: 'x-fa fa-link',
                scope: me,
                handler: me.getLinkToPosition
            });
        }

        if (auxTools.length > 0) {
            Ext.each(auxTools, function (tool) {
                tools.push(tool);

            });
        }


        return tools;
    },

    makeContextMenu: function () {
        var me = this;
        var menuItens = [];
        
        if (me.getEnableComments()) {
            menuItens.push(
                {
                    text: 'Comment Position', 
                    handler(event){
                        me.onContextMenuPositionClick(event, this);
                    }
                }
            );
        }

        menuItens = menuItens.concat( me.getContextMenuItens() );

        return new Ext.menu.Menu({items: menuItens});
    },

    makeMousePosition: function(){
        var map = this.getMap();

        return Ext.DomHelper.append(map._controlCorners['topright'], {
            tag: 'div',
            cls: 'leaflet-right leaflet-control leaflet-control-wcs-dialog visiomatic-mouse-position',
            html:'<div class="visiomatic-mouse-position-label">'+
                    'Mouse RA, Dec (0,0)'+
                 '</div>'
        });
    }
});
