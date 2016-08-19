Ext.define('common.model.Footprint', {

    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {name:'id', type:'int'},
        {name:'tag', type:'int'},
        {name:'release', type:'int'},
        {name:'release_display_name', type:'string'},
        {name:'tite', type:'int'},
        {name:'tli_tilename', type:'string'},
        {name:'tli_ra', type:'float'},
        {name:'tli_dec', type:'float'},
        {name:'tli_rall', type:'float'},
        {name:'tli_decll', type:'float'},
        {name:'tli_raul', type:'float'},
        {name:'tli_decul', type:'float'},
        {name:'tli_raur', type:'float'},
        {name:'tli_decur', type:'float'},
        {name:'tli_ralr', type:'float'},
        {name:'tli_declr', type:'float'},
        {name:'tli_urall', type:'float'},
        {name:'tli_udecll', type:'float'},
        {name:'tli_uraur', type:'float'},
        {name:'tli_udecur', type:'float'},

        // 4 Cantos da Tile
        {
            name:'raul',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_raul');
                if (value > 180) {
                    value = value - 360;
                }
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'decul',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_decul');
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'rall',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_rall');
                if (value > 180) {
                    value = value - 360;
                }
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'decll',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_decll');
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'ralr',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_ralr');
                if (value > 180) {
                    value = value - 360;
                }
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'declr',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_declr');
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'raur',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_raur');
                if (value > 180) {
                    value = value - 360;
                }
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        },
        {
            name:'decur',
            type:'float',
            convert: function (v, r) {
                value = r.get('tli_decur');
                value =  Ext.util.Format.number(value, '0.0000');
                return parseFloat(value);
            }
        }

    ]

});
