Ext.define('common.model.Dataset', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'tag', type:'int'},
        {name:'tag_display_name', type:'string'},
        {name:'release', type:'int'},
        {name:'release_display_name', type:'string'},
        {name:'tite', type:'int'},
        {name:'run', type:'string'},
        {name:'date', type:'string'},

        {name:'tli_tilename', type:'string'},
        {name:'tli_ra', type:'float'},
        {name:'tli_ra', type:'float'},
        {name:'tli_dec', type:'float'},

        {
            name:'release_tag',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0} - {1}',
                    record.get('release_display_name'), record.get('tag_display_name'));
            }
        },

        // Maping para as imagens Visiomatic PTIF
        {name:'image_src_ptif', type:'string'},

        // Maping para as imagens Thumb
        {name:'image_src_thumbnails', type:'string'},

        {
            name:'g',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'g', record.get('tli_tilename'));
            }
        },
        {
            name:'r',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'r', record.get('tli_tilename'));
            }
        },
        {
            name:'i',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'i', record.get('tli_tilename'));

            }
        },
        {
            name:'z',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'z', record.get('tli_tilename'));

            }
        },
        {
            name:'y',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'y', record.get('tli_tilename'));

            }
        },
        {
            name:'irg',
            type:'string',
            convert: function (value, record) {
                return Ext.String.format('{0}/{1}/{2}.png',
                    record.get('image_src_thumbnails'), 'irg', record.get('tli_tilename'));
            }
        }
    ]
});

