import { Mail } from 'lucide-react';
import Button from '../ui/Button';

const ConnectEmailButton = ({ onClick, isLoading = false }) => (
  <Button variant="primary" onClick={onClick} disabled={isLoading}>
    <Mail size={16} />
    {isLoading ? 'Connecting...' : 'Connect Gmail'}
  </Button>
);

export default ConnectEmailButton;
