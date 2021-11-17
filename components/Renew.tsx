import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import { useState, useEffect } from 'react';

function TransitionUp (props) {
  return <Slide {...props} direction="up" />;
}

interface Props {
  enabled: boolean,
  renew: Function
}

// Currently disabled
export default function IdentityRenewal (props: Props) {
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);
  const [canRenew, setCanRenew] = useState<boolean>(true);

  const doRenew = () => {
    setHasTriggered(true);
    props.renew();
    setCanRenew(false);
    setTimeout(() => setCanRenew(true), 60000)
  };
  useEffect(() => {
    if (!hasTriggered) {
      setCanRenew(props.enabled);
    }
  });

  if (!canRenew) {
    return (
      <>
        <IconButton disabled={!canRenew} onClick={doRenew}>
          <AutorenewIcon />
        </IconButton>
        <Snackbar
          open={hasTriggered}
          onClose={() => setHasTriggered(false)}
          TransitionComponent={TransitionUp}
          autoHideDuration={2500}
          message="Renewed mailbox for another 10 minutes"
        />
      </>
    );
  }
  return (
    <>
      <Tooltip title="Renew Mailbox">
        <IconButton disabled={!canRenew} onClick={doRenew}>
          <AutorenewIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
