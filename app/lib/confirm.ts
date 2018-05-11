import { openConfirmDialog } from '../components/common/Confirm';

export default function confirm({ message, onAnswer }: { message: string; onAnswer: Function }) {
  openConfirmDialog({ message, onAnswer });
}
