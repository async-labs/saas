import { openSnackbar } from '../components/common/Notifier';

export default function notify(obj) {
  openSnackbar({ message: obj.message || obj.toString() });
}
