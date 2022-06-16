import runtime from "../env/runtime";

export const sendWsSync = (id) => {
    const ws = runtime.wsConn;
    if (runtime.isRealtimeRefreashPreview)
        setTimeout(() => {
            ws.send(`jmp ${runtime.currentEditScene} ${id+1}`);
        }, 500);
}
