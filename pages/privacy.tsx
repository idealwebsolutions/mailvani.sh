import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';
import Link from 'next/link';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme: Theme) => createStyles({
    root: {
      display: 'flex',
      width: '100%'
    },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      marginLeft: theme.spacing(3),
      padding: theme.spacing(2)
    },
    policy: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      fontSize: theme.typography.pxToRem(18)
    }
  }),
);

export default function Privacy() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/" shallow>
            Inbox
          </Link>
          <Typography color="textPrimary">Privacy</Typography>
        </Breadcrumbs>
        <h1>Privacy</h1>
        <Paper className={classes.policy}>
          <p>Last updated: August 03, 2021</p>
          <p>This policy is a general overview of how this service is used. Absolutely <strong>no information</strong> is ever stored about you. All mailboxes are temporarily created and <strong>encrypted</strong> on our servers for up to <strong>30 minutes</strong> maximum. </p>
          <p>Using this service allows you to completely protect against the loss of your personal information. Your personal information may include: Your name, your personal e-mail address, users with whom you communicate with and IP address. 
            This means by using this service, you are protected from any and all unauthorized actions that may compromise your privacy.
          </p>
          <p>Privacy is the <strong>top priority</strong>, if any changes are made in regards to protecting user data it will be known to you prior to using this service.</p>
        </Paper>
        </Container>
      </main>
    </div>
  )
}
