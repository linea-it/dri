Ext.define('common.model.Tile', {

    extend: 'Ext.data.Model',

    idProperty: 'id',

    fields: [
        {name:'id', type:'int'},
        {name:'tli_tilename', type:'string'},
        {name:'tli_project', type:'string'},
        {name:'tli_ra', type:'float'},
        {name:'tli_dec', type:'float'},
        {name:'tli_equinox', type:'float'},
        {name:'tli_pixelsize', type:'float'},
        {name:'tli_npix_ra', type:'float'},
        {name:'tli_npix_dec', type:'float'},
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

        //{name:'tag_id', type:'string'},
        //{name:'name', type:'string'},
        //{name:'version', type:'string'},
        //{name:'release_name', type:'string'},
        //{name:'release_display_name', type:'string'},
        //{name:'field_id', type:'string'},
        //{name:'field_name', type:'string'},
        //{name:'display_name', type:'string'},

        {name:'image_src', type:'string'},

        // tiletag_id

        // RA E DEC
        {
            name:'ra',
            type:'float',
            convert: function (v, r) {
                return parseFloat(Ext.util.Format.number(r.get('tli_ra'), '0.0000'));
            }
        },
        {
            name:'ra2',
            type:'float',
            convert: function (value, record) {
                var ra = record.get('tli_ra');
                if (ra > 180) {
                    ra = ra - 360;
                }
                value =  Ext.util.Format.number(ra, '0.0000');
                value = parseFloat(value);

                return value;
            }
        },
        {
            name:'dec',
            type:'float',
            convert: function (v, r) {
                return parseFloat(Ext.util.Format.number(r.get('tli_dec'), '0.0000'));
            }
        },

        // Display RA e Dec
        {
            name:'display_ra',
            convert: function (value, record) {
                value =  Ext.util.Format.number(record.get('tli_ra'), '0.0000');
                return value;
            }
        },
        {
            name:'display_dec',
            convert: function (value, record) {
                value =  Ext.util.Format.number(record.get('tli_dec'), '0.0000');
                return value;
            }
        },

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

        //
        //// L e B
        //{name:'l', type:'float'},
        //{name:'b', type:'float'},

        // Imagens Thumb
        //{
        //    name:'rgb',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //            record.get('image_src'), record.get('tli_tilename'), 'RGB');
        //    }
        //},
        //{
        //    name:'g',
        //    type:'string',
        //    convert: function (value, record) {
        //        var tile = record.get('tile');
        //
        //        if (tile) {
        //            return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //                record.get('image_src'), tile.tli_tilename, 'g');
        //        }
        //    }
        //},
        //{
        //    name:'r',
        //    type:'string',
        //    convert: function (value, record) {
        //        var tile = record.get('tile');
        //
        //        if (tile) {
        //            return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //                record.get('image_src'), tile.tli_tilename, 'r');
        //        }
        //    }
        //},
        //{
        //    name:'i',
        //    type:'string',
        //    convert: function (value, record) {
        //        var tile = record.get('tile');
        //
        //        if (tile) {
        //            return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //                record.get('image_src'), tile.tli_tilename, 'i');
        //        }
        //    }
        //},
        //{
        //    name:'z',
        //    type:'string',
        //    convert: function (value, record) {
        //        var tile = record.get('tile');
        //
        //        if (tile) {
        //            return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //                record.get('image_src'), tile.tli_tilename, 'z');
        //        }
        //    }
        //},
        //{
        //    name:'y',
        //    type:'string',
        //    convert: function (value, record) {
        //        var tile = record.get('tile');
        //
        //        if (tile) {
        //            return Ext.String.format('{0}/pngs/{1}_{2}_thumb.png',
        //                record.get('image_src'), tile.tli_tilename, 'Y');
        //        }
        //    }
        //}

        //{
        //    name:'g',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'g');
        //    }
        //},
        //{
        //    name:'r',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'r');
        //    }
        //},
        //{
        //    name:'i',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'i');
        //    }
        //},
        //{
        //    name:'z',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'z');
        //    }
        //},
        //{
        //    name:'y',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'Y');
        //    }
        //},
        //{
        //    name:'rgb',
        //    type:'string',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}_thumb.png', record.get('images_src'),
        //            record.get('name'), record.get('field_name'), record.get('tilename'), 'RGB');
        //    }
        //},
        //{
        //    name:'zoom_g',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'g');
        //    }
        //},
        //{
        //    name:'zoom_r',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'r');
        //    }
        //},
        //{
        //    name:'zoom_i',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'i');
        //    }
        //},
        //{
        //    name:'zoom_z',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'z');
        //    }
        //},
        //{
        //    name:'zoom_y',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'Y');
        //    }
        //},
        //{
        //    name:'zoom_rgb',
        //    convert: function (value, record) {
        //        return Ext.String.format('{0}{1}/{2}/pngs/{3}_{4}',record.get('images_src'),record.get('name'),record.get('field_name'), record.get('tilename'), 'RGB');
        //    }
        //},
        //
        //// Contador de Erros por Banda
        //{name:'defectBandg', type:'int'},
        //{name:'defectBandr', type:'int'},
        //{name:'defectBandi', type:'int'},
        //{name:'defectBandz', type:'int'},
        //{name:'defectBandy', type:'int'},
        //{name:'defectsCount', type:'int'},
        //{name:'defectsBand', type:'int'},
        //
        //{name:'comments', type:'int'},
        //{name:'users', type:'int'},
        //{
        //    name:'users_string',
        //    type:'string',
        //    convert: function (value, record) {
        //        if (value) {
        //            return value.replace(', ','<br>');
        //        } else {
        //            return value;
        //        }
        //    }
        //},
        //{
        //    name:'comment_user',
        //    convert: function (value, record) {
        //        if (record.get('comments') > 0) {
        //            return Ext.String.format('{0}/{1}',record.get('comments'),record.get('users'));
        //        } else {
        //            return '';
        //        }
        //    }
        //},
        //{name:'flag_reject', type:'boolean'},
        //{name:'flag_analized', type:'boolean'},
        //
        //// Fits Header Params used in zoomify
        //{name:'equinox', type:'float'},
        //{name:'crpix1' , type:'float'},
        //{name:'crpix2' , type:'float'},
        //{
        //    name:'crval1',
        //    type:'float',
        //    convert: function (value, record) {
        //        return record.get('ra');
        //    }
        //},
        //{
        //    name:'crval2',
        //    type:'float',
        //    convert: function (value, record) {
        //        return record.get('dec');
        //    }
        //},
        //{name:'naxis1' , type:'float'},
        //{name:'naxis2' , type:'float'},
        //{name:'lonpole', type:'float'},
        //{name:'naxis'  , type:'float'},
        //{name:'ctype2' , type:'string'},
        //{name:'ctype1' , type:'string'},
        //{name:'latpole', type:'float'},
        //{name:'cd1_1'  , type:'float'},
        //{name:'cd1_2'  , type:'float'},
        //{name:'cd2_1'  , type:'float'},
        //{
        //    name:'cd2_2',
        //    type:'float',
        //    convert: function (value, record) {
        //        // Colocar o cd2_2 com valor negativo
        //        if (value > 0) {
        //            return (value * -1);
        //        } else {
        //            return value;
        //        }
        //    }
        //},
        //
        //{name:'tiletag_process_id', type:'string'},
        //{name:'astrometry', type:'int'},
        //{name:'photometry', type:'int'},
        //{name:'image_quality', type:'int'}
    ]

});
