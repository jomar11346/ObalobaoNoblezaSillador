import { useEffect } from "react"
import DeleteFlowerForm from "./components/DeleteFlowerForm"

const DeleteFlowerPage = () => {
    useEffect(() => {
        document.title = "Flower Delete Page";
    }, []);
    return (
        <>
            <DeleteFlowerForm />
        </>
    )
}

export default DeleteFlowerPage