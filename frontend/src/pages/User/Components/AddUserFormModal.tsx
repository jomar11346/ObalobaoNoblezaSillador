import { useEffect, useState, type FC, type FormEvent, type ChangeEvent } from "react";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/Button/SubmitButton";
import CloseButton from "../../../components/Button/CloseButton";
import GenderService from "../../../Services/GenderService";
import UserService from "../../../Services/UserService";
import type { UserFieldErrors } from "../../../interfaces/UserInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";
import UploadInput from "../../../components/Input/UploadInput";

interface AddUserFormModalProps {
    onUserAdded: (message: string) => void;
    refreshKey?: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const AddUserFormModal: FC<AddUserFormModalProps> = ({ 
    onUserAdded, 
    refreshKey,
    isOpen, 
    onClose
}) => {
    const [loadingGenders, setLoadingGenders] = useState(false);
    const [genders, setGenders] = useState<GenderColumns[]>([]);

    const [loadingStore, setLoadingStore] = useState(false);
    const [addUserProfilePicture, setAddUserProfilePicture] = 
        useState<File | null>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffixName, setSuffixName] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthDate] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<UserFieldErrors>({});

    const clearFieldError = (field: keyof UserFieldErrors) => {
        if (errors[field]?.length) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: undefined,
            }));
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "first_name") setFirstName(value);
        if (name === "middle_name") setMiddleName(value);
        if (name === "last_name") setLastName(value);
        if (name === "suffix_name") setSuffixName(value);
        if (name === "birth_date") setBirthDate(value);
        if (name === "username") setUsername(value);
        if (name === "password") setPassword(value);
        if (name === "password_confirmation") setPasswordConfirmation(value);

        clearFieldError(name as keyof UserFieldErrors);
    };

    const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value);
        clearFieldError("gender");
    };

    const handleStoreUser = async (e: FormEvent) => {
        try {
            e.preventDefault();
            const validationErrors: UserFieldErrors = {};

            if (!firstName.trim()) validationErrors.first_name = ["The first name field is required."];
            if (!lastName.trim()) validationErrors.last_name = ["The last name field is required."];
            if (!gender.trim()) validationErrors.gender = ["The gender field is required."];
            if (!birthdate.trim()) validationErrors.birth_date = ["The birth date field is required."];
            if (!username.trim()) validationErrors.username = ["The username field is required."];
            if (!password.trim()) validationErrors.password = ["The password field is required."];
            if (!passwordConfirmation.trim()) {
                validationErrors.password_confirmation = ["The password confirmation field is required."];
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setLoadingStore(true);
            setErrors({});

            const formData = new FormData()
            if (addUserProfilePicture) {
                formData.append('add_user_profile_picture', addUserProfilePicture);
            }
            formData.append('first_name', firstName);
            formData.append('middle_name', middleName || "");
            formData.append('last_name', lastName);
            formData.append('suffix_name', suffixName || "");
            formData.append('gender', gender);
            formData.append('birth_date', birthdate);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);

            const res = await UserService.storeUser(formData);

            if (res.status === 200) {
             onUserAdded(res.data.message);
            
             setAddUserProfilePicture(null);
             
             setFirstName("");
             setMiddleName("");
             setLastName("");
             setSuffixName("");
             setGender("");
             setBirthDate("");
             setUsername("");
             setPassword("");
             setPasswordConfirmation("");
             setErrors({});
             
             refreshKey?.();
             handleLoadGenders();
            } else {
                console.error(
                    "Unexpected status error occurred during adding user:", 
                    res.status
                );
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data?.errors);
            } else {
                console.log(
                    "Unexpected server error occurred during adding user:", 
                    error
                );
            }
        } finally {
            setLoadingStore(false);
        }
    };

    const handleLoadGenders = async () => {
        try {
            setLoadingGenders(true);

            const res = await GenderService.loadGenders();

            if (res.status === 200) {
                setGenders(res.data.genders);
            } else {
                console.error(
                    "Unexpected error status occurred during loading genders:", 
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected error occurred during loading genders:", 
                error
            );
        } finally {
            setLoadingGenders(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            handleLoadGenders();
        }

    }, [isOpen]);

    return (
        <>
         <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
            <form onSubmit={handleStoreUser} noValidate>
                <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
                    Add User Form
                </h1>
                <div className="mb-4">
                    <UploadInput
                        label="Profile Picture"
                        name="add_user_profile_picture"
                        value={addUserProfilePicture}
                        onChange={setAddUserProfilePicture}
                        errors={errors.add_user_profile_picture}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="First Name"
                                type="text"
                                name="first_name"
                                value={firstName}
                                onChange={handleInputChange}
                                required
                                autoFocus
                                errors={errors.first_name}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Middle Name"
                                type="text"
                                name="middle_name"
                                value={middleName}
                                onChange={handleInputChange}
                                errors={errors.middle_name}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Last Name"
                                type="text"
                                name="last_name"
                                value={lastName}
                                onChange={handleInputChange}
                                required
                                errors={errors.last_name}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Suffix Name"
                                type="text"
                                name="suffix_name"
                                value={suffixName}
                                onChange={handleInputChange}
                                errors={errors.suffix_name}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelSelect
                                label="Gender"
                                name="gender"
                                value={gender}
                                onChange={handleGenderChange}
                                required
                                errors={errors.gender}
                            >
                                <option value="">Select Gender</option>
                                {loadingGenders ? (
                                    <option value="" disabled>
                                        Loading...
                                    </option>
                                ) : (
                                    <>
                                        {genders.map((genderItem) => (
                                            <option value={String(genderItem.gender_id)} key={genderItem.gender_id}>
                                                {genderItem.gender}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </FloatingLabelSelect>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Birth Date"
                                type="date"
                                name="birth_date"
                                value={birthdate}
                                onChange={handleInputChange}
                                required
                                errors={errors.birth_date}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Username"
                                type="text"
                                name="username"
                                value={username}
                                onChange={handleInputChange}
                                required
                                errors={errors.username}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleInputChange}
                                required
                                errors={errors.password}
                            />
                        </div>
                        <div className="mb-4">
                            <FloatingLabelInput
                                label="Password Confirmation"
                                type="password"
                                name="password_confirmation"
                                value={passwordConfirmation}
                                onChange={handleInputChange}
                                required
                                errors={errors.password_confirmation}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    {!loadingStore && (
                        <CloseButton label="Close" onClose={onClose} />
                    )}
                    <SubmitButton label="Save User" loading={loadingStore} loadingLabel="Saving User..." />
                </div>
            </form>
         </Modal>
        </>
    );
};

export default AddUserFormModal;