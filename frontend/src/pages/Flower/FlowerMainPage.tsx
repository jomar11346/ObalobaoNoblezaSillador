import { useEffect } from "react";
import AddFlowerForm from "./components/AddFlowerForm";
import { FlowerList } from "./components/FlowerList";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { useRefresh } from "../../hooks/useRefresh";
import { useLocation } from "react-router-dom";
import PageHeader from "../../components/Brand/PageHeader";

const FlowerMainPage = () => {
  const location = useLocation();

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false, false);

  const { refresh, handleRefresh } = useRefresh(false);

  useEffect(() => {
    document.title = "Yui Blooms - Flowers";
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      showToastMessage(location.state.message);
      handleRefresh();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToastMessage, handleRefresh]);

  return (
    <>
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />
      <PageHeader title="Flowers" subtitle="Manage inventory, pricing, and product images." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section className="yb-panel p-5">
          <h2 className="yb-eyebrow mb-4">Add flower</h2>
          <AddFlowerForm onFlowerAdded={showToastMessage} refreshKey={handleRefresh} />
        </section>
        <FlowerList refreshKey={refresh} />
      </div>
    </>
  );
};

export default FlowerMainPage;
