Ext.define('common.model.Dataset', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'tag', type:'int'},
        {name:'release', type:'int'},
        {name:'tite', type:'int'},
        {name:'run', type:'string'},

        {name:'tli_tilename', type:'string'},
        {name:'tli_ra', type:'float'},
        {name:'tli_ra', type:'float'},
        {name:'tli_dec', type:'float'},

        // Maping para as imagens Thumb
        {name:'image_src', type:'string'},
        {
            name:'g',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'g', record.get('tli_tilename') );
            }
        },
        {
            name:'r',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'r', record.get('tli_tilename'));
            }
        },
        {
            name:'i',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'i', record.get('tli_tilename'));

            }
        },
        {
            name:'z',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'z', record.get('tli_tilename'));

            }
        },
        {
            name:'y',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'y', record.get('tli_tilename'));

            }
        },
        {
            name:'irg',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src'), 'irg', record.get('tli_tilename') );
            }
        }        
    ]
});

