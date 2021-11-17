import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import ConfirmationDialog from './ConfirmationDialog';

interface Props {
  readonly enabled: boolean,
  readonly noToolTip: boolean,
  readonly canReset: boolean,
  readonly initialDuration: number,
  readonly updateResetAbility: Function,
  readonly reset: Function
}

export default function IdentityReset (props: Props) {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [resetWait, setResetWait] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);

  const performReset = () => {
    props.updateResetAbility(false);
    setShowDialog(false);
    setResetWait(true);
    props.reset();
    // Wait at least 5 seconds
    setTimeout(() => setResetWait(false), 5000);
  };

  const cancelRequest = () => {
    setShowDialog(false);
    props.updateResetAbility(true);
  };

  const resetTime: number = Math.round((duration * 1000) - (duration * .8) * 1000);

  if (resetTime > 0 && !resetWait) {
    setTimeout(() => props.updateResetAbility(true), resetTime);
  }

  useEffect(() => {
    if (props.enabled && props.initialDuration > 0 && duration === 0) {
      const timestamp: Dayjs = dayjs.unix(props.initialDuration);
      const now: Dayjs = dayjs();
      const nextDuration: number = timestamp.diff(now) / 1000;
      setDuration(nextDuration);
    }
  });

  if (!props.enabled || !props.canReset) {
    return (
      <IconButton color="inherit" disabled={!props.canReset || !props.enabled}>
        <FingerprintOutlinedIcon />
      </IconButton>
    )
  }
  return (
    <>
      {
        props.noToolTip ?
        <IconButton color="inherit" disabled={!props.canReset || !props.enabled} onClick={() => {
          setShowDialog(true);
        }}>
          <FingerprintOutlinedIcon />
        </IconButton> :
        <Tooltip title="Generate New Identity">
          <IconButton color="inherit" onClick={() => {
            setShowDialog(true);
          }}>
            <FingerprintOutlinedIcon />
          </IconButton>
        </Tooltip>
      }
      {
        showDialog ? <ConfirmationDialog title="Are you sure?" content="This will delete all emails in this mailbox." onCancel={cancelRequest} onSuccess={performReset} /> : null
      }
    </>
  );
}
