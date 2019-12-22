import { openSnackbarExternal } from '../components/common/Notifier';

export default function notify(obj) {
  openSnackbarExternal({ message: obj.message || obj.toString() });
}
