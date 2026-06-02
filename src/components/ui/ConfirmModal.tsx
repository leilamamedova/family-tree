'use client';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[360px]">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="
              px-4 py-2
              rounded-lg
              border
              text-gray-600
              hover:bg-gray-50
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-2
              rounded-lg
              bg-red-500
              text-white
              hover:bg-red-600
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
