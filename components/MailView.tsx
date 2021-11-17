import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import PageviewIcon from '@material-ui/icons/Pageview';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AttachmentIcon from '@material-ui/icons/Attachment';
import ImageIcon from '@material-ui/icons/Image';
import DescriptionIcon from '@material-ui/icons/Description';
import ArchiveIcon from '@material-ui/icons/Archive';
import MovieIcon from '@material-ui/icons/Movie';
import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';

import { 
  useState, 
  useEffect,
  useContext,
  useRef
} from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { useReactToPrint } from 'react-to-print';
// import DOMPurify from 'isomorphic-dompurify';
import cheerio from 'cheerio';
import { Markup } from 'interweave';

import { ThemeSettingsContext } from '../context/Theme';
import { Attachment, NameAddressPair } from '../data/types';
import { MailPropertiesContext } from '../context/MailProperties';

dayjs.extend(advancedFormat);

interface Props {
  readonly subject: string,
  readonly from: Array<NameAddressPair>,
  readonly date: string,
  readonly body: {
    plain: string,
    html: string,
  },
  readonly attachments: Array<object>,
  readonly raw: string,
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    maxWidth: '1440'
  },
  paddedView: {
    paddingLeft: 1,
    paddingRight: 1,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 14,
      paddingRight: 14,
    }
  },
  subject: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  depaddedToolbar: {
    padding: 0,
    flexGrow: 1
  },
  backButton: {
    flexGrow: 0,
  },
  menuOptions: {
    flexGrow: 2,
    width: '75%'
  },
  frameOptions: {
    width: '100%',
    border: 'none',
    overflow: 'hidden',
    // minHeight: '600px'
  },
  bold: {
    fontWeight: 600,
  },
  attachment: {
    marginRight: theme.spacing(1.5)
  }
}));

export default function MailView (props: Props) {
  const themeCtx = useContext(ThemeSettingsContext);
  const mailPropsCtx = useContext(MailPropertiesContext);
  const classes = useStyles();
  const frameStyles = `
    a {
      color: ${themeCtx.isDarkTheme ? 'red' : 'inherit'};
    }
    #email {
      position: relative;
      overflow: hidden;
    }
    .frame-content {
      position: 'absolute';
      top: 0;
      left: 0;
      border: 0;
      width: 100%;
      height: 100%;
      color: ${themeCtx.isDarkTheme ? 'white' : 'inherit'}; 
    }
  `;
  const [expanded, setExpanded] = useState<boolean>(props.attachments && props.attachments.length ? true : false);
  const [height, setHeight] = useState<number>(600); // default height
  const [viewSource, setViewSource] = useState<boolean>(false);
  const attachmentRefs = [];
  const createFileDownload = (attachment: Attachment) => {
    if (attachment.content.type !== 'Buffer') {
      throw new Error('Invalid content type encountered');
    }
    // console.log(attachment); 
    return URL.createObjectURL(
      new File([Uint8Array.from(attachment.content.data)], attachment.filename, { type: attachment.contentType })
    );
  };
  if (!props.from.length) {
    mailPropsCtx.changeOpened(-1);
    return null;
  }
  // console.log('height ' + height);
  useEffect(() => {
    return () => {
      for (const attachmentRef of attachmentRefs) {
        URL.revokeObjectURL(attachmentRef);
        console.log('detached attachment ref');
      }
    }
  });
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });
  const handleViewChange = () => {
    setViewSource(viewSource ? false : true);
  };
  return (
    <div className={classes.root}>
      <Toolbar className={classes.depaddedToolbar}>
        <IconButton className={classes.backButton} onClick={() => mailPropsCtx.changeOpened(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <ButtonGroup className={classes.menuOptions} size="large" color="inherit" variant="text" disableElevation fullWidth>
          <Button
            startIcon={viewSource ? <MailOutlineIcon /> : <PageviewIcon />}
            onClick={handleViewChange}
          >
            View { viewSource ? 'Email' : 'Source' }
          </Button>
          <Button 
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </ButtonGroup>
      </Toolbar>
      <div ref={componentRef} className={classes.paddedView}>
        <Divider />
        <Typography variant="h5" className={classes.subject}>
          { props.subject }
        </Typography>
        <Card>
          <CardHeader
            avatar={
              <Avatar aria-label="from">
                { props.from[0].name[0] }
              </Avatar>
            }
            action={
              props.attachments && props.attachments.length ? 
              <IconButton onClick={() => setExpanded(!expanded ? true : false)}>
                <AttachmentIcon />
              </IconButton> : null
            }
            title={
              <>
                <Typography component="span" className={classes.bold}>
                  { props.from[0].name }
                </Typography>
                {` <${props.from[0].address}>`}
              </>
            }
            subheader={formatDate(props.date)}
          />
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
            {
              props.attachments.map((attachment: Attachment) => {
                let icon = <DescriptionIcon />;
                if (attachment.contentType.indexOf('image') > -1) {
                  icon = <ImageIcon />;
                } else if (attachment.contentType.indexOf('zip') > -1) {
                  icon = <ArchiveIcon />;
                } else if (attachment.contentType.indexOf('video') > -1) {
                  icon = <MovieIcon />;
                }
                const urlRef = createFileDownload(attachment);
                attachmentRefs.push(urlRef);
                return (
                  <Chip
                    component="a"
                    className={classes.attachment}
                    icon={icon}
                    label={attachment.filename}
                    color="default"
                    href={urlRef}
                    download
                    clickable
                    outlined
                  />
                ); 
              })
            }
            </CardContent>
          </Collapse>
          {/* ref={componentRef} */}
          <CardContent>
            {
              viewSource ? props.raw.split('\n').map((text, index) => (
                <>
                  {text}
                  <br />
                </>
              )) : 
              <Frame id="email-content" initialContent={props.body.html || props.body.plain} head={<style>{frameStyles}</style>} style={{ height: height + 'px' }} className={classes.frameOptions}>
                <FrameContextConsumer>
                {
                  ({document, window}) => {
                    setTimeout(() => {
                      // console.log(document.body.scrollHeight);
                      // console.log(document.body.offsetHeight);
                      if (document.body.scrollHeight > 0) {
                        setHeight(document.body.scrollHeight + 20);
                      }
                    }, 200);
                    return (
                      <Markup content={correctLinks(document.body)} escapeHtml />
                    );
                    /*return (
                      <div ref={componentRef} dangerouslySetInnerHTML={{
                        __html: correctLinks(DOMPurify.sanitize(props.body.html || props.body.plain))
                      }} />
                    );*/
                  }
                }
                </FrameContextConsumer>
            </Frame>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate (date: string): string {
  return dayjs(date).format('MMMM Do YYYY hh:mm a');
}

function correctLinks (html: string) {
  const $ = cheerio.load(html);
  $('a').attr('target', '_blank');
  return $.html();
}
