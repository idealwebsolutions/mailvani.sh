import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Container from '@material-ui/core/Container';
import ButtonBase from '@material-ui/core/ButtonBase';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import Mail from '../components/MailItem';

import { MailItem } from '../data/types';
import { useContext } from 'react';
import { MailPropertiesContext } from '../context/MailProperties';

const useStyles = makeStyles((theme: Theme) => createStyles({
  loadingBackground: {
    backgroundImage: 'url(open.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '9rem',
    backgroundPosition: '50% 17.5%',
    position: 'relative',
    height: 400,
    textAlign: 'center'
  },
  loadingText: {
    margin: 0,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  recreateButtonContainer: {
    height: 400,
    position: 'relative',
    backgroundImage: 'url(closed.png)',
    backgroundPosition: '50% 13%',
    backgroundSize: '9rem',
    backgroundRepeat: 'no-repeat',
  },
  recreateButton: {
    margin: 0,
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  recreateButtonIcon: {
    display: 'block'
  }
}));

interface Props {
  readonly mail: Array<MailItem>,
  readonly opened: Array<number>,
  readonly active: boolean,
}

export default function MailList (props: Props) {
  const classes = useStyles();
  const mailPropsCtx = useContext(MailPropertiesContext);
  
  if (!props.active) {
    return (
      <Container maxWidth="sm">
        <div className={classes.recreateButtonContainer}>
          <ButtonBase
            focusRipple
            className={classes.recreateButton}
            onClick={() => window.location.reload()}
          >
            <Typography variant="h4" component="h4" align="center">Create a new mailbox</Typography>
          </ButtonBase>
        </div>
      </Container>
    );
  } else if (!props.mail.length && props.active) {
    return (
      <Backdrop open={true} className={classes.loadingBackground} invisible>
        <div className={classes.loadingText}>
          <CircularProgress color="inherit" />
          <Typography variant="h4" style={{ marginTop: 10 }}>Waiting for mail...</Typography>
        </div>
      </Backdrop>
    );
  }
  // Render decrypted mail items
  return (
    <List component="nav" aria-label="inbox navigation">
      { 
        props.mail.map((mail: MailItem, index: number) => 
          <Mail id={index} key={index} useDivider={index > 0 || index > (props.mail.length - 1)} opened={props.opened.indexOf(index) > -1} {...mail} />
        ).reverse()
      }
    </List>
  )
};
