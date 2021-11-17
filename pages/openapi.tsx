import {
  useState,
} from 'react';
import {
  makeStyles,
  createStyles,
  useTheme,
  Theme
} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Link from 'next/link';
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
  noSpacing: {
    marginTop: 0,
  },
  spacing: {
    marginTop: 10
  },
  questionHeading: {
    fontSize: theme.typography.pxToRem(18),
    flexBasis: '50%',
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%'
    }
  },
  answerHeading: {
    fontSize: theme.typography.pxToRem(16)
  }
}));

export default function API () {
  const classes = useStyles();
  const [acExpanded, setExpanded] = useState<number>(0);
  const handleChange = (contentItem: number) => setExpanded(contentItem);
  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/" shallow>
            Inbox
          </Link>
          <Typography color="textPrimary">API</Typography>
        </Breadcrumbs>
        <h1>API</h1>
        <p>Coming soon...</p>
        </Container>
      </main>
    </div>
  )
}
