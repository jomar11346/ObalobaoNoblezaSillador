import { useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/Button/SubmitButton";

interface AddUserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddUserFormModal: FC<AddUserFormModalProps> = ({ isOpen, onClose }) => {
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffixName, setSuffixName] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthDate] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const resetForm = () => {
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setSuffixName("");
        setGender("");
        setBirthDate("");
        setUsername("");
        setPassword("");
        setPasswordConfirmation("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleStoreUser = async (e: FormEvent) => {
        e.preventDefault();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} showCloseButton>
            <form onSubmit={handleStoreUser}>
                <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
                    Add User Form
                </h1>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <FloatingLabelInput label="First Name" type="text" name="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Middle Name" type="text" name="middle_name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Last Name" type="text" name="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Suffix Name" type="text" name="suffix_name" value={suffixName} onChange={(e) => setSuffixName(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelSelect label="Gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} required>
                                <option value="">Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                                <option value="3">Prefer not to say</option>
                            </FloatingLabelSelect>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <FloatingLabelInput label="Birth Date" type="date" name="birth_date" value={birthdate} onChange={(e) => setBirthDate(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Username" type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput label="Password Confirmation" type="password" name="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <SubmitButton label="Save User" />
                </div>
            </form>
        </Modal>
    );
};
export default AddUserFormModal;