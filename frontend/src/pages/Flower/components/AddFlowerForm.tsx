import { useState, type FC, type FormEvent, } from "react";
import axios from "axios";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import SubmitButton from "../../../components/Button/SubmitButton";
import FlowerService from "../../../Services/FlowerService";
import type { FlowerFieldErrors } from "../../../interfaces/FlowerInterface";


interface AddFlowerFormProps {
  onFlowerAdded: (message: string) => void;
  refreshKey: () => void
}

const AddFlowerForm: FC<AddFlowerFormProps> = ({ onFlowerAdded, refreshKey }) => {
  const [loadingStore, setLoadingStore] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<FlowerFieldErrors>({});

  const handleStoreFlower = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setErrors({});

      if (!name.trim()) {
        setErrors({
          name: ["The name field is required."],
        });
        setLoadingStore(true);
        window.setTimeout(() => {
          setLoadingStore(false);
        }, 250);
        return;
      }

      setLoadingStore(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock_quantity', stockQuantity);
      if (image) formData.append('image', image);

      const res = await FlowerService.storeFlower(formData);

      if (res.status >= 200 && res.status < 300) {
        setName("");
        setPrice("");
        setStockQuantity("");
        setImage(null);
        setErrors({});
        onFlowerAdded(res.data.message);
        refreshKey();
      } else {
        console.error(
          "Unexpected error occurred during store flower: ",
          res.data,
        );
      }

      setLoadingStore(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        } else {
          console.error(
            "Unexpected server error occured during store flower:",
            error,
          );
        }
      } else {
        console.error("Unexpected error occured during store flower:", error);
      }

      setLoadingStore(false);
    }
  };

  return (
    <>
      <form onSubmit={handleStoreFlower} noValidate>
        <div className="mb-4">
          <FloatingLabelInput
            label="Flower Name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              const nextValue = e.target.value;
              setName(nextValue);
              if (nextValue.trim()) setErrors({});
            }}
            autoFocus
            errors={errors.name}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
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
        <div className="flex justify-end">
          <SubmitButton
            label="Save Flower"
            loading={loadingStore}
            loadingLabel="Saving Flower..."
          />
        </div>
      </form>
    </>
  );
};

export default AddFlowerForm;
