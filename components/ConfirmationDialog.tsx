import { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props {
  readonly title: string,
  readonly content: string,
  onCancel?: Function,
  onSuccess: Function
};

export default function ConfirmationDialog(props: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const handleCancel = () => {
    setOpen(false);
    if (props.onCancel) {
      props.onCancel();
    }
  }

  const handleSuccess = () => {
    setOpen(false);
    props.onSuccess();
  };

  useEffect(() => setOpen(true), []);
  
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSuccess} color="inherit" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
