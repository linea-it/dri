/**
 *
 */

Ext.define('common.BandFilter',{
    extend: 'Ext.container.ButtonGroup',

    alias: 'widget.bandfilter',

    alternateClassName: ['Portal.BandFilter'],

    /**
    * @event onfilter
    * Fires when the "pressed" state of this button changes
    * @param {String} [filter] Selected filter
    * @param {Ext.button.Button} [button] button selected
    * @param {Ext.container.ButtonGroup} [buttongroup]
    */

    /**
     * @cfg {String} filters
     * An array of filters, all filters that appear in this buttongroup
     *
     */
    //filters: ["g","r","i","z","Y","gri","riz","izY","RGB"],
    filters: ['g','r','i','z','Y', 'RGB'],

    /**
     * @cfg {String} [defaultFilter="rgb"]
     * Default filter.
     */
    defaultFilter: 'rgb',

    /**
     * @cfg {Number} [buttonWidth=40]
     * Tamanho padrao para os botoes
     */
    buttonWidth: 30,

    config: {
        availableFilters: []
    },

    initComponent: function () {
        // console.log('BandFilter - initComponent(%o)', this)
        var me = this;

        if (!me.filters) {
            Ext.Error.raise('You must specify a filters config.');
        }

        me.items = this.createFilters();

        var toggleGroup = 'bands';

        if (me.itemId) {
            toggleGroup = 'bands_' + me.itemId;
        }

        me.layout = {
            type:'hbox',
            align:'stretch'
        };

        me.defaults = {

            allowDepress:false,

            enableToggle: true,

            toggleGroup: toggleGroup,

            toggleHandler: function (button) {
                if (button.pressed) {
                    var filter = button.value;
                    me.fireEvent('onfilter', filter, button, me);
                }
            }
        };

        me.callParent(arguments);
    },

    /**
     * Retorna um array de botoes
     * se tiver setado defaultFilter, o botao referente ao filtro sera pressed.
     * @return {Ext.button.Button/Ext.button.Button[]}
     */
    createFilters: function () {
        //console.log("BandFilter - createFilters()");
        var me = this,
            items = [],
            filter, value, btn;

        for (var i = 0; i < me.filters.length; i++) {
            filter = me.filters[i];
            value = Ext.util.Format.lowercase(filter);

            btn = {
                xtype: 'button',
                text: filter,
                value:value,
                width:me.buttonWidth
            };

            // Ajustar o tamanho dos botoes
            if (String(value).length > 1) {
                btn.width = 50;

            }

            if (me.defaultFilter == value) {
                btn.pressed = true;
                
            }

            items.push(btn);
        }
        return items;
    },

    /**
     * Retorna o filtro que esta pressionado
     * @return {String} filter
     */
    getFilter: function () {
        //console.log("BandFilter - getFilter()");

        var me = this,
            filter = null,
            filters, values, items;

        filters = this.filters;
        values = Array();
        items = this.items;

        for (var i = 0; i < filters.length; i++) {
            var f = Ext.util.Format.lowercase(filters[i]);
            values.push(f);
        }

        items.each(function (btn) {
            if (btn.pressed) {
                // Verificar se o botao esta desabilitado
                if (!btn.disabled) {
                    // Se estiver habilitado retornar o filter
                    filter = btn.value;
                }
            }
        });

        // Se nao tiver filtro
        if (!filter) {
            // Retornar o primeiro ativo
            items.each(function (btn) {
                if (!filter && (!btn.disabled)) {
                    filter = btn;
                    btn.toggle();
                }
            });
        }

        return filter;
    },

    /**
     * Seta um botao como pressionado,
     * @param {String} filter fitro a ser selecionado
     */
    setFilter: function (filter) {
        //console.log("BandFilter - setFilter(%o)",filter);

        this.items.each(function (btn) {
            if (btn.value == filter && !btn.disabled) {
                btn.toggle();
            }
        });
    },

    /**
     * Function description
     * @param {String} paramName parameter description
     * @return {String} Return value description
     */
    disableFilter: function (filter) {
        //console.log("BandFilter - disableFilter(%o)",filter);
        if (filter) {
            var filters = this.filters;
            var values = Array();
            for (var i = 0; i < filters.length; i++) {
                var f = Ext.util.Format.lowercase(filters[i]);
                values.push(f);
            }

            if (values.indexOf(filter) != -1) {
                this.items.each(function (btn) {
                    if (btn.value == filter) {
                        btn.disable();
                        return true;
                    }
                });
            }
        }
    },

    /**
     * Function description
     * @param {String} paramName parameter description
     * @return {String} Return value description
     */
    resetFilters: function (preFilter) {
        //console.log("BandFilter - resetFilters( %o )", preFilter);

        var filter = null;

        if (preFilter) {
            filter = preFilter;
        } else {
            filter = this.defaultFilter;
        }

        this.items.each(function (btn) {
            btn.enable();
            if (btn.value == filter) {
                if (!btn.pressed) {
                    btn.toggle();
                }
            }
        });

    },

    setAvailableFilters: function (availables) {
        var me = this, 
            items = me.items,
            filters = [],
            prevPressed, pressed, filter;

        if (availables.length == 0) {
            return false;

        }

        for (var i = 0; i < availables.length; i++) {
            filter = Ext.util.Format.lowercase(availables[i]);

            filters.push(filter);

        }        

        // Desabilita os botoes que ao estao na lista
        items.each(function (btn) {
            if (filters.indexOf(btn.value) != -1) {
                btn.enable(); 

            }
            else {
                btn.disable();

            }
        });

        // Seleciona um dos filtros 
        prevPressed = me.getFilter();

        if (filters.indexOf(prevPressed) != -1){
            // Se o filtro que estava pressionado antes estiver na lista 
            pressed = prevPressed;

        }
        else {
            // Se nao tiver na lista pressiona o primeiro da lista
            pressed = filters[0];

        }

        items.each(function (btn) {
            if (btn.value == pressed) {
                if (!btn.pressed) {
                    btn.toggle();

                }
            }
        });        

        // Seta os filtros que estao habilitados
        me.availableFilters = filters;
    }
});
