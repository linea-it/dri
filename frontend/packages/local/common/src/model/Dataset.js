Ext.define('common.model.Dataset', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'tag', type:'int'},
        {name:'tag_display_name', type:'string'},
        {name:'release', type:'int'},
        {name:'release_name', type:'string'},
        {name:'release_display_name', type:'string'},
        {name:'tite', type:'int'},
        {name:'run', type:'string'},
        {name:'date', type:'string'},

        {name:'tli_tilename', type:'string'},
        {name:'tli_ra', type:'float'},
        {name:'tli_ra', type:'float'},
        {name:'tli_dec', type:'float'},
        {name:'tli_urall', type:'float'},
        {name:'tli_udecll', type:'float'},
        {name:'tli_uraur', type:'float'},
        {name:'tli_udecur', type:'float'},

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
    ],

    /**
     * Verifica se uma determinada coordenada esta dentro dessa instancia de Dataset
     * se tiver retorna true
     */
    isInsideTile: function (ra, dec) {
        // e necessario converter os cantos da tile em ra para -180 e 180
        // para que as tiles que ficam perto do 0 nao deem erro.

        var record = this,
            ra = parseFloat(ra),
            dec = parseFloat(dec),
            urall, uraur, udecll, udecur;


        if (ra > 180) {
            ra = (ra - 360);
        }

        urall =  record.get('tli_urall');
        uraur = record.get('tli_uraur');
        udecll = record.get('tli_udecll');
        udecur = record.get('tli_udecur');

        if (urall > 180) {
            urall = urall - 360;
        }

        if (uraur > 180) {
            uraur = uraur - 360;
        }

        // ra between urall, uraul
        // dec between udecll, udecul
        if (
            (ra > urall) &&
            (ra < uraur) &&
            (dec > udecll) &&
            (dec < udecur)){

            return true;

        } else {
            return false

        }

    }
});
