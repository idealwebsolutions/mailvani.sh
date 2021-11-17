import {
  useState,
  useEffect,
  useContext
} from 'react';
import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import RefreshIcon from '@material-ui/icons/Refresh';
import { mutate } from 'swr';
import ms from 'ms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import MailList from '../components/MailList';
import MailView from '../components/MailView';

import { MailContext } from '../context/Mail';
import { MailPropertiesContext } from '../context/MailProperties';
import { AccountContext } from '../context/Account';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      display: 'flex',
      width: '100%'
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    toolbarTypo: {
      marginTop: theme.spacing(0.5),
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      padding: theme.spacing(1)
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      marginTop: -15,
      maxWidth: '100%'
    },
    alert: {
      marginBottom: 10
    },
    recreateButtonIcon: {
      display: 'block'
    }
  }),
);

export default function Inbox() {
  const classes = useStyles();
  const accountCtx = useContext(AccountContext);
  const mailCtx = useContext(MailContext);
  const mailPropsCtx = useContext(MailPropertiesContext);
  // Holds current index of mail opened
  // Holds state of all alerts opened
  const [alertsOpen, setAlertsOpened] = useState<boolean>(true);
  // Holds state on whether mailbox can be refreshed
  const [canRefresh, setCanRefresh] = useState<boolean>(false);
  // Handle next refresh state
  const handleCanRefresh = () => {
    setCanRefresh(false);
    mutate('/api/mailbox');
    setTimeout(() => setCanRefresh(true), ms('15s'));
  }
  // Run only once on load
  useEffect(() => {
    setTimeout(() => setCanRefresh(true), ms('30s'));
  }, []);
  //
  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        { 
          alertsOpen ? 
            <Alert className={classes.alert} onClose={() => setAlertsOpened(false)} severity={!accountCtx.active ? 'error' : 'success'}>
              <AlertTitle>{!accountCtx.active ? 'Error' : 'Success'}</AlertTitle>
              {!accountCtx.active ? 'Your mailbox has expired — click below to create a new mailbox.' : 'New mailbox created — click the copy button above to get started!'}
            </Alert> : null 
        }
        <Hidden smUp>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            fullWidth
            onClick={handleCanRefresh}
            disabled={!accountCtx.active || !canRefresh}
          >
            Refresh
          </Button>
        </Hidden>
        {/* Switch pane depending on action: Either list or single view */}
        { 
          mailPropsCtx.currentOpened > -1 ? <MailView {...mailCtx.mail[mailPropsCtx.currentOpened]} /> : 
          <MailList mail={mailCtx.mail} opened={mailPropsCtx.allRead} active={accountCtx.active} />
        }
      </main>
    </div>
  )
}
