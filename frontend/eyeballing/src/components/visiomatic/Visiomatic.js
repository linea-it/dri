import React, { Component } from 'react';
import './Viewer.css';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
class VisiomaticPanel extends Component {
  static propTypes = {
    image: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = this.initialState;

    this.id = uniqueId('visiomatic-container-');

    // Instancia do Visiomatic linkado com a div
    this.visiomatic = null;

    // Verificar se a lib Aladin esta disponivel
    if (window.L) {
      this.libL = window.L;
      console.log('Leaflet Carregado');
    } else {
      console.log('Leaflet NÃO CARREGADO!');
    }
  }

  get initialState() {
    return {};
  }

  componentDidMount() {
    const map = this.libL.map(this.id, { fullscreenControl: true, zoom: 1 });

    this.libL.control.scale.wcs({ pixels: false }).addTo(map);
    this.libL.control.reticle().addTo(map);

    var wcsControl = this.libL.control
      .wcs({
        coordinates: [{ label: 'RA,Dec', units: 'HMS' }],
        position: 'topright',
      })
      .addTo(map);

    this.map = map;

    this.changeImage();
  }

  componentDidUpdate(nextProps) {
    this.changeImage();
  }

  changeImage = () => {
    if (this.props.image) {
      if (this.layer) {
        this.map.removeLayer(this.layer);
      }

      // var url = `${window.origin}/iipserver?FIF=${
      //   this.props.image
      //   }&WID=2000&CVT=jpeg`;

      var url = this.props.image;

      this.layer = this.libL.tileLayer.iip(url, {}).addTo(this.map);
    }
  };

  onBack = () => {
    const history = this.props.history;
    history.push({ pathname: `/` });
  };

  render() {
    // Ajuste no Tamanho do container
    return (
      <div
        id={this.id}
        className="visiomatic-container"
        style={{
          width: '100%',
          height: 'calc(100vh - 150px)',
          // height: '100%',
        }}
      />
    );
  }
}

export default VisiomaticPanel;
