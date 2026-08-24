import {
    io
} from "socket.io-client";


const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:8080";


const getToken = () => {

    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token")
    );

};


const socket = io(
    SOCKET_URL, {
        autoConnect: false,
        withCredentials: true,
        transports: [
            "websocket",
            "polling"
        ]
    }
);


const connectSocket = () => {

    const token = getToken();


    if (!token) {

        console.error(
            "Socket connection failed: token not found"
        );

        return;

    }


    socket.auth = {
        token
    };


    if (!socket.connected) {

        socket.connect();

    }

};


const disconnectSocket = () => {

    if (socket.connected) {

        socket.disconnect();

    }

};


export {
    socket,
    connectSocket,
    disconnectSocket
};