import Link from '../components/Link';
import { 
  useState,
  useContext
} from 'react';
import {
  makeStyles,
  createStyles,
  useTheme,
  Theme
} from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Snackbar from '@material-ui/core/Snackbar';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
// import ForwardIcon from '@material-ui/icons/Forward'; // Forwarding planned for future update
import InboxIcon from '@material-ui/icons/Inbox';
// import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
// import RefreshIcon from '@material-ui/icons/Refresh';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';

import { AccountContext } from '../context/Account';
import { MailContext } from '../context/Mail';
import { MailPropertiesContext } from '../context/MailProperties';
import { ThemeSettingsContext } from '../context/Theme';
import { AddressContext } from '../context/Address';

import AliasAddress from './Address';
import IdentityReset from './Identity'; // rename
// import IdentityRenewal from './Renew';
import Usage from './Usage';
import { ThemeToggle } from './Theme';

import packageInfo from '../package.json';
import TimedExpiration from './TimedExpiration';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  spacer: {
    flexGrow: 1,
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('xs')]: {
      marginRight: 0
    },
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
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  usageCounter: {
    position: 'fixed',
    bottom: 220,
    width: drawerWidth
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    width: drawerWidth
  },
}),
);

interface Props {
  readonly children: any
}

export default function Layout (props: Props) {
  const classes = useStyles();
  const theme = useTheme();
  // Contexts
  const accountCtx = useContext(AccountContext);
  const mailCtx = useContext(MailContext);
  const mailPropsCtx = useContext(MailPropertiesContext);
  const themeCtx = useContext(ThemeSettingsContext);
  const addressCtx = useContext(AddressContext);
  // Holds if drawer has been opened on mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  //
  const unreadCount: number = mailCtx.mail.length - mailPropsCtx.allRead.length;
  // Toggles state
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  // TODO: Add ad placement below div
  const drawer = (
    <div>
      <Typography variant="h4" className={classes.toolbarTypo} align="center" noWrap>
        { packageInfo.name }
      </Typography>
      <List>
        <ListItem style={{ color: 'inherit' }} component={Link} href="/" passHref shallow button>
          <>
            <ListItemIcon>
              {
                unreadCount > 0 ? <Badge badgeContent={unreadCount} color="error">
                  <InboxIcon />
                </Badge> : <InboxIcon />
              }
            </ListItemIcon>
            <ListItemText>Inbox</ListItemText>
          </>
        </ListItem>
        <Hidden smUp>
          <ListItem disabled={!accountCtx.active || !accountCtx.canReset} button>
            <ListItemIcon>
              <FingerprintOutlinedIcon />
            </ListItemIcon>
            <ListItemText style={{ color: !accountCtx.active ? 'grey' : 'inherit'}} onClick={accountCtx.reset}>Reset Identity</ListItemText>
          </ListItem>
        </Hidden>
      </List>
      <div className={classes.toolbar} />
      <div className={classes.usageCounter}>
        <Usage enabled={accountCtx.active} currentUsage={mailCtx.currentUsage} maxAllocated={mailCtx.maxAllocated} />
      </div>
      <nav className={classes.bottomNav}>
        <List>
        <ListItem style={{ color: 'inherit' }} component={Link} href="openapi" shallow button>
            <ListItemText>API</ListItemText>
          </ListItem>
          <ListItem style={{ color: 'inherit' }} component={Link} href="faq" shallow button>
            <ListItemText>FAQ</ListItemText>
          </ListItem>
          <ListItem style={{ color: 'inherit' }} component={Link} href="privacy" shallow button>
            <ListItemText>Privacy</ListItemText>
          </ListItem>
        </List>
        <Divider />
        <p style={{ textAlign: 'center' }}>v{ packageInfo.version } - Copyright { new Date().getFullYear() }</p>
      </nav>
    </div>
  );
  return (
    <>
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            {/*<IdentityRenewal enabled={accountCtx.active} renew={accountCtx.extend} />*/}
            <AliasAddress enabled={accountCtx.active} alias={accountCtx.alias} />
            <TimedExpiration enabled={accountCtx.active} initialDuration={mailCtx.expiration} />
            <div className={classes.spacer} />
            <Hidden xsDown implementation="css">
              <IdentityReset noToolTip={false} enabled={accountCtx.active} canReset={accountCtx.canReset} reset={accountCtx.reset} initialDuration={mailCtx.expiration} updateResetAbility={accountCtx.updateResetStatus} />
            </Hidden>
            <ThemeToggle isDarkTheme={themeCtx.isDarkTheme} toggle={themeCtx.toggleTheme} />
          </Toolbar>
          </AppBar>
          <nav className={classes.drawer} aria-label="main navigation">
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Hidden smUp implementation="css">
            <Drawer
              /*container={container}*/
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
              >
                {drawer}
              </Drawer>
            </Hidden>
          </nav>
          {props.children}
          {/*<Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'middle' }}
            open={addressCtx.copied}
            onClose={() => {}}
            autoHideDuration={10000}
            message={`${accountCtx.alias} was copied to clipboard`}
          />*/}
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={mailCtx.mail.length > 0 && (mailCtx.mail.length > mailPropsCtx.allRead.length)}
            onClose={() => {}}
            autoHideDuration={10000}
            /*onClick={() => props.closeTrigger(-1)}*/
          >
          <Alert severity="info">
            <AlertTitle>
              <strong>
                {mailCtx.mail.length ? mailCtx.mail[mailCtx.mail.length - 1].subject : 'New mail has arrived'}
              </strong>
            </AlertTitle>
              {mailCtx.mail.length ? mailCtx.mail[mailCtx.mail.length - 1].body.plain.slice(0, 64) : ''}
          </Alert>
        </Snackbar>
        </div>
      </>
    )
}
