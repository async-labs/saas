import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';

export let openSnackbarFn;

class Notifier extends React.PureComponent {
  public state = {
    open: false,
    message: '',
  };

  constructor(props) {
    super(props);
    openSnackbarFn = this.openSnackbar;
  }

  public render() {
    const message = (
      <span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.message }} />
    );

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message={message}
        autoHideDuration={5000}
        onClose={this.handleSnackbarClose}
        open={this.state.open}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id',
        }}
      />
    );
  }

  public handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: '',
    });
  };

  public openSnackbar = ({ message }) => {
    this.setState({ open: true, message });
  };
}

export default Notifier;

// import Button from '@material-ui/core/Button';
// import Snackbar from '@material-ui/core/Snackbar';
// import React from 'react';

// class Notifier extends React.PureComponent {
//   public state = {
//     open: false,
//     message: '',
//   };

//   public render() {
//     const message = (
//       <span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.message }} />
//     );

//     return (
//       <React.Fragment>
//         <Button
//           onClick={() => {
//             this.openSnackbar({ message: 'test' });
//           }}
//         >
//           Open Notifier
//         </Button>
//         <Snackbar
//           anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//           message={message}
//           autoHideDuration={5000}
//           onClose={this.handleSnackbarClose}
//           open={this.state.open}
//           ContentProps={{
//             'aria-describedby': 'message-id',
//           }}
//         />
//       </React.Fragment>
//     );
//   }

//   public handleSnackbarClose = () => {
//     this.setState({
//       open: false,
//       message: '',
//     });
//   };

//   public openSnackbar = ({ message }) => {
//     this.setState({ open: true, message });
//   };
// }

// export default Notifier;
