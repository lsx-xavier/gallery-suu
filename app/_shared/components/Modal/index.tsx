import { X } from '@phosphor-icons/react/dist/ssr';
import * as Dialog from '@radix-ui/react-dialog';

type ModalProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
  whitCloseButton?: boolean;
};

export default function Modal({
  trigger,
  content,
  title,
  description,
  whitCloseButton = true,
}: ModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="cursor-pointer">{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <div className="fixed left-0 top-0 size-full">
          <Dialog.Overlay className="fixed inset-0 z-10 bg-[#0F1010] bg-opacity-85 backdrop-blur-[2px]" />

          <Dialog.Content>
            {whitCloseButton && (
              <Dialog.Close className="absolute right-2 top-2 z-20 rounded-full bg-[#0F1010] bg-opacity-75 p-2 hover:bg-opacity-100 [&>*]:hover:opacity-60">
                <X className="text-2xl text-white" />
              </Dialog.Close>
            )}

            {title && <Dialog.Title>{title}</Dialog.Title>}

            {description && (
              <Dialog.Description>{description}</Dialog.Description>
            )}

            {content}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
