import RouterModal from "@/app/_shared/components/RouterModal/RouterModal";
import { ModalConfigurar } from "../../components/ModalConfigurar";

export default function Page() {
    
    return (
        <RouterModal>
            <p>MODAL</p>
            <ModalConfigurar />
        </RouterModal>
    );
}