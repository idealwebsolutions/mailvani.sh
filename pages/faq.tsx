import {
  useState,
} from 'react';
import {
  makeStyles,
  createStyles,
  useTheme,
  Theme
} from '@material-ui/core/styles';
import Accordian from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Divider from '@material-ui/core/Divider';
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

export default function About() {
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
          <Typography color="textPrimary">FAQ</Typography>
        </Breadcrumbs>
        <h1>FAQ</h1>
        <Accordian defaultExpanded expanded={acExpanded === 0} onChange={() => handleChange(0)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.questionHeading}>What is the purpose of <strong>Disposable</strong>/<strong>Temporary</strong> Mail?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              The purpose is to hide personal details from problematic websites that may or may not spam you or try to sell off your personal information to marketers. Privacy
              is the main goal of temporary mailboxes.
            </Typography>
          </AccordionDetails>
        </Accordian>
        <Accordian className={classes.spacing} expanded={acExpanded === 1} onChange={() => handleChange(1)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.questionHeading}>Why use <strong>mailvani.sh</strong> over generic temporary mail providers?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Many providers allow temporary email to live for as long as you keep your account. There are <strong>no long-term accounts</strong> or data stored long term, 
              you simply are given a <strong>read-only encrypted mailbox</strong> with a <strong>30 minute lifespan</strong> to use as you wish. Mail received only lasts for as long as the mailbox exists 
              and is deleted in encrypted form on our end. The advantage here is that the mail received remains private and only viewable by you, from source to destination since you own the keys. 
              You can always review the code yourself here.
            </Typography>
          </AccordionDetails>
        </Accordian>
        <Accordian className={classes.spacing} expanded={acExpanded === 2} onChange={() => handleChange(2)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.questionHeading}>What do you mean by <strong>read-only encrypted mailbox</strong>?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              All mail received is read only and encrypted at rest and in transit. This means that mail received is forwarded by our upstream service and is then 
              encrypted by a key only <strong>you</strong> have access to. This key remains in your possession for as long as the session is active and is recreated every time the mailbox expires. Feel free
              to audit the code yourself if you're curious.
            </Typography>
          </AccordionDetails>
        </Accordian>
        <Accordian className={classes.spacing} expanded={acExpanded === 3} onChange={() => handleChange(3)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.questionHeading}>Why am I given only <strong>30 minutes</strong>?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              This was considered as a suitable value in order to not sacrifice privacy for convenience. Most people who have used temporary email services in the past generally
              do not need long lasting mailboxes. If more time is a requirement, it is advised to use other services out there that fit your specific needs.
            </Typography>
          </AccordionDetails>
        </Accordian>
        <Accordian className={classes.spacing} expanded={acExpanded === 4} onChange={() => handleChange(4)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.questionHeading}>Can I <strong>send</strong> email?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <strong>No</strong>, this service only receives mail and is meant as a proxy between you and dubious companies that wish to profit off you and your information.
            </Typography>
          </AccordionDetails>
        </Accordian>
        </Container>
      </main>
    </div>
  )
}
