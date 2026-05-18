import { useEffect, useState, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import FlowerService from "../../../Services/FlowerService";
import Spinner from "../../../components/Spinner/Spinner";
import { useNavigate, useParams } from "react-router-dom";

const DeleteFlowerForm = () => {
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [flower, setFlower] = useState<any>(null);
    const [loadFinished, setLoadFinished] = useState(false);

    const { flower_id } = useParams();
    const navigate = useNavigate();

    const handleFlower = async (flowerId: string | number) => {
        try {
            setLoadingGet(true);

            const res = await FlowerService.getFlower(flowerId);

            if (res.status === 200) {
                setFlower(res.data?.flower);
            } else {
                console.error(
                    "Unexpected error status occured during getting flower:",
                    res.status,
                );
            }
        } catch (error) {
            console.error(
                "Unexpected server error occured during getting flower: ",
                error,
            );
        } finally {
            setLoadingGet(false);
            setLoadFinished(true);
        }
    };

    const handleDestroyFlower = async (e: FormEvent) => {
        e.preventDefault();
        if (!flower_id) return;

        try {
            setLoadingDestroy(true);

            const res = await FlowerService.destroyFlower(flower_id);

            if (res.status >= 200 && res.status < 300) {
                navigate("/flowers", { state: { message: res.data.message } });
            } else {
                console.error(
                    "Unexpected status error occured during deleting flower: ",
                    res.status,
                );
            }
        } catch (error) {
            console.error(
                "Unexpected server error occured during deleting flower: ",
                error,
            );
        } finally {
            setLoadingDestroy(false);
        }
    };

    useEffect(() => {
        if (flower_id) {
            const parsedFlowerId = Number(flower_id);
            if (Number.isNaN(parsedFlowerId)) {
                console.error(
                    "Unexpected error occured during getting flower: invalid flower id",
                    flower_id,
                );
                setLoadFinished(true);
                return;
            }
            handleFlower(parsedFlowerId);
        } else {
            console.error(
                "Unexpected error occured during getting flower: ",
                flower_id,
            );
            setLoadFinished(true);
        }
    }, [flower_id]);

    return (
        <>
            {loadingGet ? (
                <div className="flex justify-center items-center mt-52">
                    <Spinner size="lg" />
                </div>
            ) : flower ? (
                <form onSubmit={handleDestroyFlower}>
                    <div className="mb-4">
                        <FloatingLabelInput
                            label="Flower Name"
                            type="text"
                            name="name"
                            value={flower.name}
                            readOnly={true}
                            inputClassName="bg-gray-50 cursor-default"
                        />
                    </div>
                    <div className="mb-4">
                        {flower.image && (
                            <img src={flower.image} alt={flower.name} className="w-32 h-32 object-cover rounded mb-2" />
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        {!loadingDestroy && (
                            <BackButton label="Back" path="/flowers" />
                        )}
                        <SubmitButton
                            label="Delete Flower"
                            className="bg-red-600 hover:bg-red-700"
                            loading={loadingDestroy}
                            loadingLabel="Deleting Flower..."
                        />
                    </div>
                </form>
            ) : loadFinished ? (
                <p className="mt-8 text-center text-sm text-gray-600">
                    Flower not found or could not be loaded.
                </p>
            ) : (
                <div className="flex justify-center items-center mt-52">
                    <Spinner size="lg" />
                </div>
            )}
        </>
    );
};

export default DeleteFlowerForm;
