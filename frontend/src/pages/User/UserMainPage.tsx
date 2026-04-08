import { useModal } from "../../hooks/useModals";
import AddUserFormModal from "./Components/AddUserFormModal";
import UserList from "./Components/UserList";

const UserMainPage = () => {
    const { isOpen, openModal, closeModal } = useModal(false);

    return (
        <>
            <AddUserFormModal isOpen={isOpen} onClose={closeModal} />
            <UserList onAddUser={openModal} />
        </>
    );
};

export default UserMainPage;