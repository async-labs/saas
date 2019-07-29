// 3
// import Button from '@material-ui/core/Button';
// import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import React from 'react';

// let openConfirmDialogFn;

// class Confirm extends React.Component {
//   public state = {
//     open: false,
//     title: 'Are you sure?',
//     message: '',
//     successMessage: '',
//     onAnswer: a => a,
//   };

//   public render() {
//     return (
//       <Dialog
//         open={this.state.open}
//         onClose={this.handleClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">{this.state.message}</DialogContentText>
//         </DialogContent>
//         <DialogActions style={{ padding: '10px' }}>
//           <Button onClick={this.handleClose} variant="outlined" color="primary" autoFocus>
//             Cancel
//           </Button>
//           <Button onClick={this.handleYes} variant="contained" color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   }

//   public componentDidMount() {
//     openConfirmDialogFn = this.openConfirmDialog;
//   }

//   public handleClose = () => {
//     this.setState({ open: false });
//     this.state.onAnswer(false);
//   };

//   public handleYes = () => {
//     this.setState({ open: false });
//     this.state.onAnswer(true);
//   };

//   public openConfirmDialog = ({ title, message, onAnswer }) => {
//     this.setState({ open: true, title, message, onAnswer });
//   };
// }

// export function openConfirmDialog({
//   title,
//   message,
//   onAnswer,
// }: {
//   title: string;
//   message: string;
//   onAnswer: (answer) => void;
// }) {
//   openConfirmDialogFn({ title, message, onAnswer });
// }

// export default Confirm;
