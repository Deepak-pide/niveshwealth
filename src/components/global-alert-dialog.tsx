
"use client";

import { useData } from "@/hooks/use-data";
import { SendAlertDialog } from "./send-alert-dialog";

export function GlobalAlertDialog() {
    const { alertRequest, setAlertRequest } = useData();

    return (
        <SendAlertDialog
            request={alertRequest}
            isOpen={!!alertRequest}
            onClose={() => setAlertRequest(null)}
        />
    )
}
