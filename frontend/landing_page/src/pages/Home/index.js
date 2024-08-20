import React from 'react';
import Stars from '../../components/Stars';
import Banner from '../../components/Banner';
import Interfaces from './partials/Interfaces';
import styles from './styles';

function Main() {
  const classes = styles();

  return (
    <div>
      <Stars />
      <Banner />
      <div className={classes.root}>
        <Interfaces />
      </div>
    </div>
  );
}

export default Main;
