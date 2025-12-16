import { Modal, Button } from "rsuite";

interface DeleteConfirmProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({ open, itemName, onClose, onConfirm }: DeleteConfirmProps) => {
  return (
    <Modal open={open} onClose={onClose} size="sm" backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>ຢືນຢັນການລຶບ</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-gray-600 mb-2">
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ {itemName}?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">
          ຍົກເລີກ
        </Button>
        <Button onClick={onConfirm} appearance="primary" color="red">
          ລຶບ
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
