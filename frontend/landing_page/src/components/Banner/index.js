import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { YouTube, Twitter, GitHub } from '@material-ui/icons';
import styles from './styles';

function Banner() {
  const classes = styles();

  const handlerClick = (socialMedia) => {
    let uri = '';
    switch (socialMedia) {
      case 'YouTube':
        uri = 'https://www.youtube.com/user/lineamcti';
        break;
      case 'Twitter':
        uri = 'https://twitter.com/LIneA_mcti';
        break;
      case 'GitHub':
        uri = 'https://github.com/linea-it/dri';
        break;
      default:
        uri = 'https://www.youtube.com/user/lineamcti';
    }
    window.open(uri, '_blank');
  };

  return (
    <>
      <div className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
          spacing={1}
          className={classes.container}
        >
          <Grid item xs={12} className={classes.titleWrapper}>
            <table className={classes.table}>
              <tbody>
                <tr>
                  <td>
                    <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Data Release Interface" className={classes.desLogo} />
                  </td>
                  <td className={classes.positionTitle}>
                    <h1 className={classes.title}>
                      LIneA Science Server
                    </h1>
                    <h4 className={classes.subtitle}>
                      Data Release Interface
                    </h4>
                  </td>
                </tr>
              </tbody>
            </table>
            <Grid item xs={12} sm={10} md={8} className={classes.descriptionWrapper}>
              <Typography variant="body2" component="p">
                Lorem Ipsum é simplesmente uma simulação de texto da indústria tipográfica e de impressos, e vem sendo utilizado desde o século XVI, quando um impressor desconhecido pegou uma bandeja de tipos e os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum sobreviveu não só a cinco séculos, como também ao salto para a editoração eletrônica, permanecendo essencialmente inalterado. Se popularizou na década de 60, quando a Letraset lançou decalques contendo passagens de Lorem Ipsum, e mais recentemente quando passou a ser integrado a softwares de editoração eletrônica como Aldus PageMaker.
              </Typography>
            </Grid>
          </Grid>
          <div className={classes.floarRight}>
            <div className={classes.separatorToolBar} />
            <IconButton
              onClick={() => { handlerClick('Youtube'); }}
              color="inherit"
              aria-label="YouTube"
              component="span"
            >
              <YouTube />
            </IconButton>
            <IconButton
              onClick={() => { handlerClick('Twitter'); }}
              color="inherit"
              aria-label="Twitter"
              component="span"
            >
              <Twitter />
            </IconButton>
            <IconButton
              onClick={() => { handlerClick('GitHub'); }}
              color="inherit"
              aria-label="GitHub"
              component="span"
            >
              <GitHub />
            </IconButton>
          </div>
        </Grid>
      </div>
    </>
  );
}

export default Banner;
