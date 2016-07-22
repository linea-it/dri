Ext.define('Target.model.CatalogObject', {
    extend: 'Ext.data.Model',
    fields: [
        {name:'coadd_objects_id', type:'int'},
        {name:'tag_id', type:'string'},
        {name:'name', type:'string'},
        {name:'field_id', type:'string'},
        {name:'field_name', type:'string'},
        {name:'display_name', type:'string'},
        {name:'tiletag_id', type:'string'},
        {name:'tile_id', type:'string'},
        {name:'tilename', type:'string'},
        {name:'schema', type:'string'},
        {name:'table', type:'string'},
        // RA e Dec
        {name:'ra', type:'float'},
        {name:'dec', type:'float'},
        {
            name:'display_ra',
            convert: function (value, record) {
                value =  Ext.util.Format.number(record.get('ra'), '0.0000');
                return value;
            }
        },
        {
            name:'display_dec',
            convert: function (value, record) {
                value =  Ext.util.Format.number(record.get('dec'), '0.0000');
                return value;
            }
        },
        {
            name:'_meta_ra',
            convert: function (value, record) {
                return record.get('ra');
            }
        },
        {
            name:'_meta_dec',
            convert: function (value, record) {
                return record.get('dec');
            }
        },

        // L e B
        {name:'l', type:'float'},
        {name:'b', type:'float'},

        // record ModelTile
        {name: 'tile'},

        {name: 'type', type:'string', defaultValue: '---'},
        {name: 'photoz', type:'string', defaultValue: '---'},
        {name: 'extinction', type:'string', defaultValue: '---'},
        // Ellipse
        {name: 'a_image', type:'float', defaultValue: 0},
        {name: 'b_image', type:'float', defaultValue: 0},
        {name:'theta_image', type:'float', defaultValue: 0},
        {name: 'e', type:'float', convert: function (value, record) {
            var a = record.get('a_image');
            var b = record.get('b_image');
            var e = (1.0 - b / a);
            return Ext.util.Format.number(e, '0.00000');
        }},

        // FluxPlot
        {name: 'fluxplot', type:'string', defaultValue: ''},
        // SpectraPlot
        {name: 'spectra', type:'boolean', defaultValue: false},

        // Propriedades Spectroscopy Targets
        {name: 'id'},
        {
            name:'z',
            convert: function (value, record) { return Ext.util.Format.number(value, '0.00000');}
        },
        {
            name:'z_err',
            convert: function (value, record) { return Ext.util.Format.number(value, '0.000');}
        },
        {
            name:'flag',
            convert: function (value, record) { return Ext.util.Format.number(value, '0.0');}
        },
        {name:'source', type:'string'},

        // Imagens Zoomify
        {name:'zoom_g', type:'string'},
        {name:'zoom_r', type:'string'},
        {name:'zoom_i', type:'string'},
        {name:'zoom_z', type:'string'},
        {name:'zoom_y', type:'string'},
        {name:'zoom_gri', type:'string'},
        {name:'zoom_riz', type:'string'},
        {name:'zoom_izy', type:'string'},
        {name:'zoom_rgb', type:'string'},

        // Mags
        {
            name:'mag_auto_g',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.00');
                return value;
            }
        },
        {
            name:'mag_auto_i',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.00');
                return value;
            }
        },
        {
            name:'mag_auto_r',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.00');
                return value;
            }
        },
        {
            name:'mag_auto_y',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.00');
                return value;
            }
        },
        {
            name:'mag_auto_z',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.00');
                return value;
            }
        },
        // MagErr
        {
            name:'magerr_auto_g',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.000');
                return value;
            }
        },
        {
            name:'magerr_auto_i',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.000');
                return value;
            }
        },
        {
            name:'magerr_auto_r',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.000');
                return value;
            }
        },
        {
            name:'magerr_auto_y',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.000');
                return value;
            }
        },
        {
            name:'magerr_auto_z',
            convert: function (value, record) {
                value =  Ext.util.Format.number(value, '0.000');
                return value;
            }
        },

        // Mags With Mag Errors
        // Se tiver mag_auto e magerr_auto retorna <mag_auto> +- <magerr_auto>
        // ou retorna so mag_auto
        {
            name:'mag_auto_magerr_g',
            convert: function (value, record) {
                if (record.get('mag_auto_g') && record.get('magerr_auto_g')) {
                    return value = Ext.String.format('{0} +- {1}', record.get('mag_auto_g'), record.get('magerr_auto_g'));
                } else {
                    return record.get('mag_auto_g');
                }
            }
        },
        {
            name:'mag_auto_magerr_i',
            convert: function (value, record) {
                if (record.get('mag_auto_i') && record.get('magerr_auto_i')) {
                    return value = Ext.String.format('{0} +- {1}', record.get('mag_auto_i'), record.get('magerr_auto_i'));
                } else {
                    return record.get('mag_auto_i');
                }
            }
        },
        {
            name:'mag_auto_magerr_r',
            convert: function (value, record) {
                if (record.get('mag_auto_r') && record.get('magerr_auto_r')) {
                    return value = Ext.String.format('{0} +- {1}', record.get('mag_auto_r'), record.get('magerr_auto_r'));
                } else {
                    return record.get('mag_auto_r');
                }
            }
        },
        {
            name:'mag_auto_magerr_y',
            convert: function (value, record) {
                if (record.get('mag_auto_y') && record.get('magerr_auto_y')) {
                    return value = Ext.String.format('{0} +- {1}', record.get('mag_auto_y'), record.get('magerr_auto_y'));
                } else {
                    return record.get('mag_auto_y');
                }
            }
        },
        {
            name:'mag_auto_magerr_z',
            convert: function (value, record) {
                if (record.get('mag_auto_z') && record.get('magerr_auto_z')) {
                    return value = Ext.String.format('{0} +- {1}', record.get('mag_auto_z'), record.get('magerr_auto_z'));
                } else {
                    return record.get('mag_auto_z');
                }
            }
        },
        {
            name:'postage_stamps',
            type:'string'
        },
        {
            name:'timestamp',
            type:'string',
            convert: function () {
                timestamp = new Date().getTime();
                randon = Math.random();

                return timestamp + randon;
            }
        },
        {name:'comments', type:'int'},
        {name:'users', type:'int'},
        {
            name:'users_string',
            type:'string',
            convert: function (value, record) {
                if (value) {
                    return value.replace(', ','<br>');
                } else {
                    return value;
                }
            }
        },
        {
            name:'comment_user',
            convert: function (value, record) {
                if (record.get('comments') > 0) {
                    return Ext.String.format('{0}/{1}',record.get('comments'),record.get('users'));
                } else {
                    return '';
                }
            }
        }
    ]
});

