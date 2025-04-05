import { X } from '@phosphor-icons/react/dist/ssr';
import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { Button } from '../Button';

type ModalProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title?: string | React.ReactNode;
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
        <Dialog.Overlay className="fixed inset-0 bg-[#0F1010] bg-opacity-85 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed inset-0">
          {whitCloseButton && (
            <Dialog.Close className="absolute right-2 top-2 rounded-full">
              <Button className="!rounded-full">
                <X className="text-2xl text-white" />
              </Button>
            </Dialog.Close>
          )}

          {title && <Dialog.Title>{title}</Dialog.Title>}

          {description && <Dialog.Description>{description}</Dialog.Description>}

          {content}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
