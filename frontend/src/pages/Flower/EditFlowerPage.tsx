import { useEffect } from "react";
import EditFlowerForm from "./components/EditFlowerForm";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import PageHeader from "../../components/Brand/PageHeader";

const EditFlowerPage = () => {
    useEffect(() => {
        document.title = "Yui Blooms — Edit Flower";
    }, []);

    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false);

    return (
        <>
            <ToastMessage message={toastMessage} isVisible={toastMessageIsVisible} onClose={closeToastMessage} />
            <PageHeader title="Edit flower" subtitle="Update details, stock, or replace the product image." />
            <section className="yb-panel mx-auto max-w-2xl p-6">
                <EditFlowerForm onFlowerUpdated={showToastMessage} />
            </section>
        </>
    );
};

export default EditFlowerPage;
