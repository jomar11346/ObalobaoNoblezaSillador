import { useEffect, useState, type FC, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton"
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput"
import FlowerService from "../../../Services/FlowerService";
import { useParams } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner";
import axios from "axios";
import type { FlowerFieldErrors } from "../../../interfaces/FlowerInterface";

interface EditFlowerFromProps {
    onFlowerUpdated: (message: string) => void
}

const EditFlowerForm: FC<EditFlowerFromProps> = ({ onFlowerUpdated }) => {
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string>("");
    const [removeImage, setRemoveImage] = useState("0");
    const [errors, setErrors] = useState<FlowerFieldErrors>({});

    const { flower_id } = useParams();

    const handleFlower = async (flowerId: string | number) => {
        try {
            setLoadingGet(true)

            const res = await FlowerService.getFlower(flowerId)

            if (res.status === 200) {
                const flower = res.data?.flower
                if (flower) {
                    setName(flower.name || "")
                    setPrice(String(flower.price || ""))
                    setStockQuantity(String(flower.stock_quantity || ""))
                    setDescription(flower.description || "")
                    setCategory(flower.category || "")
                    setExistingImage(flower.image || "")
                }
            } else {
                console.error('Unexpected error status occured during getting flower:', res.status)
            }
        } catch (error) {
            console.error('Unexpected server error occured during getting flower: ', error)
        } finally {
            setLoadingGet(false)
        }
    };

    const handleUpdateFlower = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setErrors({})   
            if (!name.trim()) {
                setLoadingUpdate(true)
                setErrors({
                    name: ["The name field is required."]
                })
                window.setTimeout(() => {
                    setLoadingUpdate(false)
                }, 250)
                return
            }

            setLoadingUpdate(true)

            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock_quantity', stockQuantity);
            formData.append('category', category);
            if (description) formData.append('description', description);
            if (image) formData.append('image', image);
            formData.append('remove_image', removeImage);

            const res = await FlowerService.updateFlower(flower_id!, formData)

            if (res.status >= 200 && res.status < 300) {
                setErrors({})
                const updatedFlower = res.data?.flower
                if (updatedFlower) {
                    setName(updatedFlower.name || "")
                    setPrice(String(updatedFlower.price || ""))
                    setStockQuantity(String(updatedFlower.stock_quantity || ""))
                    setDescription(updatedFlower.description || "")
                    setCategory(updatedFlower.category || "")
                    setExistingImage(updatedFlower.image || "")
                }
                onFlowerUpdated(
                    typeof res.data?.message === "string"
                        ? res.data.message
                        : "Flower updated successfully.",
                )
            } else {
                console.error('Unexpected status error occured during updating flower: ')
            }
            setLoadingUpdate(false)
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                console.error('Unexpected server error occured during updating flower: ', error)
            }
            setLoadingUpdate(false);
        }
    }

    useEffect(() => {
        if (flower_id) {
            const parsedFlowerId = Number(flower_id)
            if (Number.isNaN(parsedFlowerId)) {
                console.error('Unexpected error occured during getting flower: invalid flower id', flower_id)
                return
            }
            handleFlower(parsedFlowerId)
        } else {
            console.error('Unexpected error occured during getting flower: ', flower_id)
        }
    }, [flower_id]);


    return (
        <>
            {loadingGet && !name ? (
                <div className="flex justify-center items-center mt-52">
                    <Spinner size="lg" />
                </div>
            ) : (
                <form onSubmit={handleUpdateFlower} noValidate>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Flower Name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => {
                                const nextValue = e.target.value
                                setName(nextValue)
                                if (nextValue.trim()) {
                                    setErrors({})
                                }
                            }}
                            errors={errors.name}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Price"
                            type="text"
                            name="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            errors={errors.price}
                        />
                    </div>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Stock Quantity"
                            type="text"
                            name="stock_quantity"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            errors={errors.stock_quantity}
                        />
                    </div>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Category"
                            type="text"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            errors={errors.category}
                        />
                    </div>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Description"
                            type="text"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            errors={errors.description}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Image
                        </label>
                        {existingImage ? (
                            <img src={existingImage} alt="Current flower" className="w-32 h-32 object-cover rounded mb-2" />
                        ) : (
                            <p className="text-gray-500 text-sm mb-2">No image</p>
                        )}
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Image
                        </label>
                        <input
                            type="file"
                            name="image"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.image && (
                            <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={removeImage === "1"}
                                onChange={(e) => setRemoveImage(e.target.checked ? "1" : "0")}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Remove current image</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        {!loadingUpdate &&
                            <BackButton label="Back" path="/flowers" />
                        }
                        <SubmitButton label="Update Flower" loading={loadingUpdate} loadingLabel="Updating Flower..." />
                    </div>
                </form>
            )}
        </>
    );
};

export default EditFlowerForm;