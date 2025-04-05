import RouterModal from '@/(infra)/components/RouterModal/RouterModal';
import { ModalConfigurar } from '../../components/ModalConfigurar';

export default function Page() {
  return (
    <RouterModal>
      <ModalConfigurar />
    </RouterModal>
  );
}
