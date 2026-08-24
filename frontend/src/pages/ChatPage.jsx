import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    getProjectMessages,
    uploadChatFile,
    deleteMessageForMe,
    deleteMessageForEveryone,
    addEncryptedKeyForUser
} from "../services/message.service";

import {
    socket,
    connectSocket
} from "../socket/socket";

import {
    encryptMessage,
    createEncryptedKeys,
    decryptMessage,
    getOrCreateUserKeys,
    encryptMessageKeyForUser,
    decryptMessageKey
} from "../utils/e2ee";

import api from "../api/axios";

import {
    getProjectE2EEKeys
} from "../services/project.service";


const ChatPage = () => {

    const {
        projectId
    } = useParams();


    const fileInputRef =
        useRef(null);


    const messagesEndRef =
        useRef(null);


    const [messages, setMessages] =
        useState([]);
const messagesRef =
    useRef([]);

    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [messageText, setMessageText] =
        useState("");


    const [sending, setSending] =
        useState(false);


    const [uploading, setUploading] =
        useState(false);


    const [openMenuId, setOpenMenuId] =
        useState(null);


    const [currentUserId, setCurrentUserId] =
        useState(null);


    const [socketStatus, setSocketStatus] =
        useState("connecting");
const [editingMessageId, setEditingMessageId] =
    useState(null);

const [editingText, setEditingText] =
    useState("");

    // ==========================================
    // GET ID
    // ==========================================

    const getId = (
        value
    ) => {

        if (!value) {

            return null;

        }


        if (
            typeof value === "object"
        ) {

            if (value._id) {

                return value._id.toString();

            }


            if (value.id) {

                return value.id.toString();

            }


            if (value.userId) {

                return value.userId.toString();

            }

        }


        return value.toString();

    };


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    useEffect(() => {

        try {

            const userData =
                localStorage.getItem(
                    "user"
                );


            if (!userData) {

                return;

            }


            const user =
                JSON.parse(
                    userData
                );


            const userId =
    user._id ||
    user.id ||
    user.userId ||
    (
        user.user &&
        (
            user.user._id ||
            user.user.id ||
            user.user.userId
        )
    );


            if (userId) {

                setCurrentUserId(
                    userId.toString()
                );

            }

        } catch (error) {

            console.error(
                "Failed to get current user:",
                error
            );

        }

    }, []);

useEffect(() => {

    messagesRef.current =
        messages;

}, [messages]);
    // ==========================================
    // AUTO SCROLL
    // ==========================================

    useEffect(() => {

        if (
            messagesEndRef.current
        ) {

            messagesEndRef.current.scrollIntoView({
                behavior: "smooth"
            });

        }

    }, [messages]);


    // ==========================================
    // GET SENDER ID
    // ==========================================

    const getSenderId = (
        message
    ) => {

        if (!message) {

            return null;

        }


        return getId(
            message.sender
        );

    };


    // ==========================================
    // FIND CURRENT USER ENCRYPTED KEY
    // ==========================================

    const getEncryptedKeyForCurrentUser =
        (
            message,
            userId
        ) => {

            if (
                !message ||
                !Array.isArray(
                    message.encryptedKeys
                )
            ) {

                return null;

            }


            for (
                let i = 0;
                i < message.encryptedKeys.length;
                i++
            ) {

                const keyItem =
                    message.encryptedKeys[i];


                if (!keyItem) {

                    continue;

                }


                const encryptedUserId =
                    getId(
                        keyItem.user
                    );


                if (
                    encryptedUserId &&
                    userId &&
                    encryptedUserId ===
                    userId.toString()
                ) {

                    return keyItem.encryptedKey;

                }

            }


            return null;

        };


    // ==========================================
    // ==========================================
    // SYNC CURRENT USER E2EE PUBLIC KEY
    // ==========================================
    const syncCurrentUserE2EEKey = async(
        userId
    ) => {

        if (!userId) {
            throw new Error(
                "Current user ID is required for E2EE"
            );
        }

        const keys =
            await getOrCreateUserKeys(
                userId
            );

        await api.post(
            "/auth/e2ee/public-key",
            {
                publicKey: keys.publicKey,
                keyVersion: 1
            }
        );

        return keys;
    };


    // DECRYPT SINGLE MESSAGE
    // ==========================================

    
const decryptSingleMessage = async(
    message,
    currentUserId
) => {

    if (!message) {

        return null;

    }


    // Deleted message
    if (
        message.isDeletedForEveryone
    ) {

        return {
            ...message,
            decryptedContent: ""
        };

    }


    // File / image message
    if (
        message.messageType !== "text"
    ) {

        return {
            ...message,
            decryptedContent: ""
        };

    }


    // Old/plain message support
    if (
        message.content &&
        !message.encryptedContent
    ) {

        return {
            ...message,

            decryptedContent:
                message.content
        };

    }


    if (
        !message.encryptedContent ||
        !message.iv ||
        !Array.isArray(
            message.encryptedKeys
        )
    ) {

        return {
            ...message,

            decryptedContent:
                ""
        };

    }


    // Find ONLY current user's encrypted AES key
    const myKey =
        message.encryptedKeys.find(
            (key) => {

                const keyUserId =
                    key.user &&
                    typeof key.user === "object"

                        ?

                        (
                            key.user._id ||
                            key.user.id ||
                            key.user.userId
                        )

                        :

                        key.user;


                return (
                    String(keyUserId) ===
                    String(currentUserId)
                );

            }
        );


    if (
        !myKey ||
        !myKey.encryptedKey
    ) {

        console.error(
            "Encrypted key for current user not found",
            {
                currentUserId,
                encryptedKeys:
                    message.encryptedKeys
            }
        );


        return {
            ...message,

            decryptedContent:
                "Unable to decrypt this message"
        };

    }


    try {

        const decryptedContent =
            await decryptMessage({

                encryptedContent:
                    message.encryptedContent,

                iv:
                    message.iv,

                encryptedKey:
                    myKey.encryptedKey,

                // THIS WAS MISSING
                userId:
                    currentUserId

            });


        return {
            ...message,

            decryptedContent

        };

    } catch (error) {

        console.error(
            "Message decryption failed:",
            error
        );


        return {
            ...message,

            decryptedContent:
                "Unable to decrypt this message"
        };

    }

};

    // ==========================================
    // DECRYPT ALL MESSAGES
    // ==========================================

    const decryptAllMessages =
        async(
            messageList,
            userId
        ) => {

            if (
                !Array.isArray(
                    messageList
                )
            ) {

                return [];

            }


            return await Promise.all(

                messageList.map(
                    async(message) => {

                        return await decryptSingleMessage(
                            message,
                            userId
                        );

                    }
                )

            );

        };


    // ==========================================
    // LOAD MESSAGES
    // ==========================================

    useEffect(() => {

    let isMounted = true;

    const fetchMessages = async() => {

        try {

            setLoading(true);
            setError("");

            if (!currentUserId) {

                if (isMounted) {
                    setMessages([]);
                    setError(
                        "Unable to identify the current user"
                    );
                }

                return;

            }


            await syncCurrentUserE2EEKey(
                currentUserId
            );


            const response =
                await getProjectMessages(
                    projectId
                );

            const loadedMessages =
                Array.isArray(response?.data)
                    ? response.data
                    : [];


            const decryptedMessages =
                await decryptAllMessages(
                    loadedMessages,
                    currentUserId
                );


            if (isMounted) {

                setMessages(
                    decryptedMessages
                );

            }

        } catch (error) {

            console.error(
                "Failed to load messages:",
                error
            );

            if (isMounted) {

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load messages"
                );

                setMessages([]);

            }

        } finally {

            if (isMounted) {

                setLoading(false);

            }

        }

    };


    if (projectId) {

        fetchMessages();

    } else {

        setLoading(false);

    }


    return () => {

        isMounted = false;

    };

}, [
    projectId,
    currentUserId
]);
    // ==========================================
    // SOCKET
    // ==========================================

    useEffect(() => {

        if (!projectId) {

            return;

        }


        setSocketStatus(
            socket.connected
                ? "connected"
                : "connecting"
        );


        connectSocket();


        const joinProject = () => {

    setSocketStatus(
        "connected"
    );

    socket.emit(
        "join_project_chat",
        projectId,
        (response) => {

            if (
                !response ||
                !response.success
            ) {

                setError(
                    response &&
                    response.message
                        ?
                        response.message
                        :
                        "Failed to join project chat"
                );

                return;

            }

            console.log(
                "Joined project chat:",
                projectId
            );
// IMPORTANT:
        // New/current user asks an existing
        // project member to re-key old messages.
        if (currentUserId) {

            socket.emit(
                "request_message_rekey",
                {
                    projectId,
                    targetUserId:
                        currentUserId
                }
            );

        }
        }
    );

};


        const handleDisconnect =
            () => {

                setSocketStatus(
                    "disconnected"
                );

            };


        const handleConnectError =
            (socketError) => {

                console.error(
                    "Socket connection error:",
                    socketError
                );


                setSocketStatus(
                    "disconnected"
                );

            };


        if (socket.connected) {

            joinProject();

        }


        socket.on(
            "connect",
            joinProject
        );


        socket.on(
            "disconnect",
            handleDisconnect
        );


        socket.on(
            "connect_error",
            handleConnectError
        );


        

        // ==========================================
        // RECEIVE MESSAGE
        // ==========================================

        const handleReceiveMessage =
            async(
                message
            ) => {

                if (!message) {

                    return;

                }


                const receivedProjectId =
                    getId(
                        message.project
                    );


                if (
                    !receivedProjectId ||
                    receivedProjectId !==
                    projectId.toString()
                ) {

                    return;

                }


                const decryptedMessage =
                    await decryptSingleMessage(
                        message,
                        currentUserId
                    );


                setMessages(
                    (previousMessages) => {

                        const exists =
                            previousMessages.some(
                                (existingMessage) =>
                                    existingMessage._id ===
                                    decryptedMessage._id
                            );


                        if (exists) {

                            return previousMessages;

                        }


                        return [
                            ...previousMessages,
                            decryptedMessage
                        ];

                    }
                );

            };

// ==========================================
// HANDLE MESSAGE REKEY REQUEST
// ==========================================

const handleMessageRekeyRequest =
    async({
        projectId: requestedProjectId,
        targetUserId
    }) => {

        if (
            String(requestedProjectId) !==
            String(projectId)
        ) {
            return;
        }


        if (
            !targetUserId ||
            String(targetUserId) ===
            String(currentUserId)
        ) {
            return;
        }


        try {

            console.log(
                "Re-key request received for:",
                targetUserId
            );


            const keysResponse =
                await getProjectE2EEKeys(
                    projectId
                );


            const projectUsers =
                Array.isArray(
                    keysResponse?.data
                )
                    ? keysResponse.data
                    : [];


            const targetUser =
                projectUsers.find(
                    (user) =>
                        String(
                            user.userId
                        ) ===
                        String(targetUserId)
                );


            if (
                !targetUser ||
                !targetUser.publicKey
            ) {

                console.error(
                    "Target user's public key not found:",
                    targetUserId
                );

                return;
            }


            for (
                const message of messagesRef.current
            ) {

                if (
                    !message ||
                    !message._id ||
                    !Array.isArray(
                        message.encryptedKeys
                    )
                ) {
                    continue;
                }


                const alreadyExists =
                    message.encryptedKeys.some(
                        (item) =>
                            String(
                                getId(item.user)
                            ) ===
                            String(targetUserId)
                    );


                if (alreadyExists) {
                    continue;
                }


                const myKey =
                    message.encryptedKeys.find(
                        (item) =>
                            String(
                                getId(item.user)
                            ) ===
                            String(currentUserId)
                    );


                if (
                    !myKey ||
                    !myKey.encryptedKey
                ) {
                    continue;
                }


                const rawMessageKey =
                    await decryptMessageKey(
                        myKey.encryptedKey,
                        currentUserId
                    );


                const encryptedKey =
                    await encryptMessageKeyForUser(
                        rawMessageKey,
                        targetUser.publicKey
                    );


                await addEncryptedKeyForUser(
                    projectId,
                    message._id,
                    targetUserId,
                    encryptedKey,
                    targetUser.keyVersion || 1
                );

            }


            console.log(
                "Re-key completed for:",
                targetUserId
            );

        } catch (error) {

            console.error(
                "Message re-key failed:",
                error
            );

        }

    };

    socket.on(
    "request_message_rekey",
    handleMessageRekeyRequest
);
        // ==========================================
        // MESSAGE EDITED SOCKET EVENT
        // ==========================================

        const handleMessageEdited = async(
            message
        ) => {

            if (!message) {
                return;
            }

            const receivedProjectId =
                getId(
                    message.project
                );

            if (
                !receivedProjectId ||
                receivedProjectId !==
                String(projectId)
            ) {
                return;
            }

            try {

                const decryptedMessage =
                    await decryptSingleMessage(
                        message,
                        currentUserId
                    );

                if (!decryptedMessage) {
                    return;
                }

                setMessages(
                    (previousMessages) =>
                        previousMessages.map(
                            (item) =>
                                String(item._id) ===
                                String(message._id)
                                    ? decryptedMessage
                                    : item
                        )
                );

            } catch (error) {

                console.error(
                    "Failed to process edited message:",
                    error
                );

            }

        };


        // ==========================================
        // DELETE FOR EVERYONE SOCKET EVENT
        // ==========================================

        const handleMessageDeletedForEveryone =
            ({
                messageId
            }) => {

                if (!messageId) {

                    return;

                }


                setMessages(
                    (previousMessages) =>

                        previousMessages.map(
                            (message) => {

                                if (
                                    message._id ===
                                    messageId
                                ) {

                                    return {

                                        ...message,

                                        isDeletedForEveryone:
                                            true,

                                        content:
                                            "",

                                        decryptedContent:
                                            "",

                                        encryptedContent:
                                            "",

                                        iv:
                                            "",

                                        fileUrl:
                                            "",

                                        fileName:
                                            ""

                                    };

                                }


                                return message;

                            }
                        )

                );

            };

// ==========================================
// MEMBER JOINED - REKEY OLD MESSAGES
// ==========================================

const handleMemberJoined =
    async ({
        projectId: joinedProjectId,
        memberId
    }) => {

        try {

            // Different project
            if (
                !joinedProjectId ||
                String(joinedProjectId) !==
                String(projectId)
            ) {
                return;
            }


            // New member khud hi hai
            // to re-key karne ke liye
            // uske paas old message keys nahi hain.
            if (
                !memberId ||
                String(memberId) ===
                String(currentUserId)
            ) {
                return;
            }


            console.log(
                "New member joined. Rekeying old messages:",
                memberId
            );


            // Get new member's public key
            const keysResponse =
                await getProjectE2EEKeys(
                    projectId
                );


            const projectUsers =
                Array.isArray(
                    keysResponse?.data
                )
                    ?
                    keysResponse.data
                    :
                    [];


            const newMember =
                projectUsers.find(
                    (user) =>
                        String(
                            user.userId
                        ) ===
                        String(memberId)
                );


            if (
                !newMember ||
                !newMember.publicKey
            ) {

                console.error(
                    "New member E2EE public key not found:",
                    memberId
                );

                return;

            }


            // Current messages already contain
            // encryptedContent, iv and encryptedKeys.
            // So yahin se old encrypted AES keys
            // ko re-wrap karenge.
            for (
                const message of messagesRef.current
            ) {

                try {

                    if (
                        !message ||
                        !message._id ||
                        !message.encryptedKeys
                    ) {
                        continue;
                    }


                    if (
                        !Array.isArray(
                            message.encryptedKeys
                        )
                    ) {
                        continue;
                    }


                    // Check whether new member
                    // already has encrypted key.
                    const alreadyHasKey =
                        message.encryptedKeys.some(
                            (keyItem) =>
                                String(
                                    getId(
                                        keyItem.user
                                    )
                                ) ===
                                String(memberId)
                        );


                    if (alreadyHasKey) {
                        continue;
                    }


                    // Find current user's encrypted AES key.
                    const myEncryptedKey =
                        message.encryptedKeys.find(
                            (keyItem) =>
                                String(
                                    getId(
                                        keyItem.user
                                    )
                                ) ===
                                String(currentUserId)
                        );


                    if (
                        !myEncryptedKey ||
                        !myEncryptedKey.encryptedKey
                    ) {

                        continue;

                    }


                    // Decrypt AES key using
                    // current user's private RSA key.
                    const rawMessageKey =
                        await decryptMessageKey(
                            myEncryptedKey.encryptedKey,
                            currentUserId
                        );


                    // Encrypt same AES key using
                    // new member's public RSA key.
                    const encryptedKey =
                        await encryptMessageKeyForUser(
                            rawMessageKey,
                            newMember.publicKey
                        );


                    // Save the new encrypted AES key.
                    await addEncryptedKeyForUser(
                        projectId,
                        message._id,
                        memberId,
                        encryptedKey,
                        newMember.keyVersion || 1
                    );


                } catch (messageError) {

                    console.error(
                        "Failed to re-key message:",
                        message?._id,
                        messageError
                    );

                }

            }


            console.log(
                "Old message re-key completed for:",
                memberId
            );


        } catch (error) {

            console.error(
                "Member re-key process failed:",
                error
            );

        }

    };

    socket.on(
        "message_edited",
        handleMessageEdited
    );

    socket.on(
        "member_joined",
        handleMemberJoined
    );
        socket.on(
            "receive_message",
            handleReceiveMessage
        );


        socket.on(
            "message_deleted_for_everyone",
            handleMessageDeletedForEveryone
        );


        return () => {

            socket.emit(
                "leave_project",
                {
                    projectId
                }
            );


            socket.off(
                "connect",
                joinProject
            );


            socket.off(
                "disconnect",
                handleDisconnect
            );


            socket.off(
                "connect_error",
                handleConnectError
            );

            socket.off(
                "request_message_rekey",
                handleMessageRekeyRequest
            );

            socket.off(
                "message_edited",
                handleMessageEdited
            );

            socket.off(
                "member_joined",
                handleMemberJoined
            );

            socket.off(
                "receive_message",
                handleReceiveMessage
            );


            socket.off(
                "message_deleted_for_everyone",
                handleMessageDeletedForEveryone
            );

        };

    }, [
        projectId,
        currentUserId
    ]);


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSendMessage =
        async(
            event
        ) => {

            event.preventDefault();


            const trimmedMessage =
                messageText.trim();


            if (!trimmedMessage) {

                return;

            }


            if (!socket.connected) {

                setError(
                    "Chat connection is not available"
                );

                return;

            }


            try {

                setSending(true);
                setError("");


                if (!currentUserId) {
                    throw new Error(
                        "Current user not available for E2EE"
                    );
                }

                await syncCurrentUserE2EEKey(
                    currentUserId
                );


                // Encrypt message

                const encryptedMessage =
                    await encryptMessage(
                        trimmedMessage
                    );


                // Get project users public keys

                const keysResponse =
                    await getProjectE2EEKeys(
                        projectId
                    );


                const projectUsers =
                    keysResponse &&
                    Array.isArray(
                        keysResponse.data
                    )

                        ?

                        keysResponse.data

                        :

                        [];


                if (
                    projectUsers.length === 0
                ) {

                    throw new Error(
                        "No E2EE public keys found for project members"
                    );

                }


                // Encrypt AES key for every participant

                const encryptedKeys =
                    await createEncryptedKeys(

                        encryptedMessage.rawMessageKey,

                        projectUsers

                    );


                socket.emit(

                    "send_message",

                    {

                        projectId,

                        encryptedContent:
                            encryptedMessage.encryptedContent,

                        iv:
                            encryptedMessage.iv,

                        encryptedKeys,

                        messageType:
                            "text"

                    },

                    (response) => {

                        if (
                            response &&
                            !response.success
                        ) {

                            setError(
                                response.message ||
                                "Failed to send message"
                            );

                            return;

                        }


                        setMessageText("");

                    }

                );

            } catch (error) {

                console.error(
                    "E2EE message error:",
                    error
                );


                let errorMessage =
                    "Failed to encrypt and send message";


                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    errorMessage =
                        error.response.data.message;

                } else if (
                    error.message
                ) {

                    errorMessage =
                        error.message;

                }


                setError(
                    errorMessage
                );

            } finally {

                setSending(false);

            }

        };


    // ==========================================
    // FILE BUTTON
    // ==========================================

    const handleFileButtonClick =
        () => {

            if (
                fileInputRef.current
            ) {

                fileInputRef.current.click();

            }

        };


    // ==========================================
    // FILE UPLOAD
    // ==========================================

    const handleFileUpload =
        async(
            event
        ) => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                setUploading(true);
                setError("");


                await uploadChatFile(
                    projectId,
                    file
                );


                event.target.value =
                    "";

            } catch (error) {

                let errorMessage =
                    "Failed to upload file";


                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    errorMessage =
                        error.response.data.message;

                }


                setError(
                    errorMessage
                );

            } finally {

                setUploading(false);

            }

        };

const updateEditedMessage = async(
    messageId,
    encryptedContent,
    iv,
    encryptedKeys
) => {

    return await new Promise(
        (resolve, reject) => {

            if (!socket.connected) {

                reject(
                    new Error(
                        "Chat connection is not available"
                    )
                );

                return;
            }


            socket.emit(
                "edit_message",
                {
                    messageId,
                    encryptedContent,
                    iv,
                    encryptedKeys
                },
                (response) => {

                    if (
                        response &&
                        response.success
                    ) {

                        resolve(
                            response.data
                        );

                        return;
                    }


                    reject(
                        new Error(
                            response?.message ||
                            "Failed to edit message"
                        )
                    );

                }
            );

        }
    );

};


const handleStartEdit = (
    message
) => {

    if (!message) {
        return;
    }


    if (
        !currentUserId ||
        getSenderId(message) !==
        String(currentUserId)
    ) {
        return;
    }


    if (
        !message.decryptedContent
    ) {
        return;
    }


    setEditingMessageId(
        message._id
    );

    setEditingText(
        message.decryptedContent
    );

    setOpenMenuId(null);

};

const handleCancelEdit = () => {

    setEditingMessageId(null);
    setEditingText("");

};
const handleSaveEdit = async(
    message
) => {

    const trimmed =
        editingText.trim();


    if (!trimmed) {
        return;
    }


    try {

        setSending(true);
        setError("");


        // New AES key + new IV
        const encryptedMessage =
            await encryptMessage(
                trimmed
            );


        // Current project public keys
        const keysResponse =
            await getProjectE2EEKeys(
                projectId
            );


        const projectUsers =
            Array.isArray(
                keysResponse?.data
            )
                ?
                keysResponse.data
                :
                [];


        if (
            projectUsers.length === 0
        ) {

            throw new Error(
                "No E2EE public keys found for project members"
            );

        }


        // Encrypt new AES key for
        // every current participant
        const encryptedKeys =
            await createEncryptedKeys(

                encryptedMessage.rawMessageKey,

                projectUsers

            );


        await updateEditedMessage(
            message._id,
            encryptedMessage.encryptedContent,
            encryptedMessage.iv,
            encryptedKeys
        );


        // Local update
        setMessages(
            (previousMessages) =>
                previousMessages.map(
                    (item) => {

                        if (
                            item._id !==
                            message._id
                        ) {

                            return item;

                        }


                        return {

                            ...item,

                            encryptedContent:
                                encryptedMessage.encryptedContent,

                            iv:
                                encryptedMessage.iv,

                            encryptedKeys,

                            decryptedContent:
                                trimmed,

                            isEdited:
                                true,

                            editedAt:
                                new Date().toISOString()

                        };

                    }
                )
        );


        setEditingMessageId(
            null
        );

        setEditingText("");


    } catch (error) {

        console.error(
            "Message edit failed:",
            error
        );


        setError(
            error?.response?.data?.message ||
            error?.message ||
            "Failed to edit message"
        );

    } finally {

        setSending(false);

    }

};
    // ==========================================
    // DELETE FOR ME
    // ==========================================

    const handleDeleteForMe =
        async(
            messageId
        ) => {

            try {

                setError("");


                await deleteMessageForMe(
                    messageId
                );


                setMessages(
                    (previousMessages) =>

                        previousMessages.filter(
                            (message) =>
                                message._id !==
                                messageId
                        )

                );


                setOpenMenuId(
                    null
                );

            } catch (error) {

                setError(

                    error.response &&
                    error.response.data &&
                    error.response.data.message

                        ?

                        error.response.data.message

                        :

                        "Failed to delete message"

                );

            }

        };


    // ==========================================
    // DELETE FOR EVERYONE
    // ==========================================

    const handleDeleteForEveryone =
        async(
            messageId
        ) => {

            try {

                setError("");


                await deleteMessageForEveryone(
                    messageId
                );


                setMessages(
                    (previousMessages) =>

                        previousMessages.map(
                            (message) => {

                                if (
                                    message._id ===
                                    messageId
                                ) {

                                    return {

                                        ...message,

                                        isDeletedForEveryone:
                                            true,

                                        content:
                                            "",

                                        decryptedContent:
                                            "",

                                        encryptedContent:
                                            "",

                                        iv:
                                            "",

                                        fileUrl:
                                            "",

                                        fileName:
                                            ""

                                    };

                                }


                                return message;

                            }
                        )

                );


                setOpenMenuId(
                    null
                );

            } catch (error) {

                setError(

                    error.response &&
                    error.response.data &&
                    error.response.data.message

                        ?

                        error.response.data.message

                        :

                        "Failed to delete message"

                );

            }

        };


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime =
        (
            createdAt
        ) => {

            if (!createdAt) {

                return "";

            }


            return new Date(
                createdAt
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        };


    // ==========================================
    // AVATAR LETTER
    // ==========================================

    const getAvatarLetter =
        (
            message
        ) => {

            if (
                message.sender &&
                typeof message.sender ===
                "object" &&
                message.sender.name
            ) {

                return message.sender.name
                    .charAt(0)
                    .toUpperCase();

            }


            return "U";

        };


    // ==========================================
    // SENDER NAME
    // ==========================================

    const getSenderName =
        (
            message,
            isMyMessage
        ) => {

            if (isMyMessage) {

                return "You";

            }


            if (
                message.sender &&
                typeof message.sender ===
                "object" &&
                message.sender.name
            ) {

                return message.sender.name;

            }


            return "User";

        };


    return (

        <section
            className="chat-page"
        >

            {/* HEADER */}

            <div
                className="chat-page__header"
            >

                <p
                    className="chat-page__terminal"
                >
                    ~/projects/chat
                </p>


                <div>

                    <h1>
                        Project Chat
                    </h1>


                    <p>
                        Communicate with your project team.
                    </p>

                </div>


                <div
                    style={{
                        marginTop: "12px",
                        fontSize: "13px"
                    }}
                >

                    <span
                        style={{
                            color:

                                socketStatus ===
                                "connected"

                                    ?

                                    "#22c55e"

                                    :

                                    socketStatus ===
                                    "connecting"

                                        ?

                                        "#facc15"

                                        :

                                        "#ef4444"
                        }}
                    >
                        ●
                    </span>

                    {" "}

                    {socketStatus ===
                    "connected"

                        ?

                        "Live"

                        :

                        socketStatus ===
                        "connecting"

                            ?

                            "Connecting..."

                            :

                            "Offline"}

                </div>

            </div>


            {/* CHAT CONTAINER */}

            <div
                className="chat-page__container"
            >

                {/* ERROR */}

                {error && (

                    <div
                        className="chat-page__error"
                    >

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={
                                () =>
                                    setError("")
                            }
                            style={{
                                float: "right",
                                border: "none",
                                background: "transparent",
                                color: "inherit",
                                cursor: "pointer"
                            }}
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* MESSAGES */}

                <div
                    className="chat-page__messages"
                >

                    {loading && (

                        <div
                            className="chat-page__state"
                        >

                            Loading messages...

                        </div>

                    )}


                    {!loading &&
                    messages.length === 0 && (

                        <div
                            className="chat-page__empty"
                        >

                            <h2>
                                No messages yet
                            </h2>

                            <p>
                                Start the conversation
                                with your project team.
                            </p>

                        </div>

                    )}


                    {!loading &&

                        messages.map(
                            (message) => {

                                const senderId =
                                    getSenderId(
                                        message
                                    );


                                const isMyMessage =
                                    senderId &&
                                    currentUserId &&
                                    senderId ===
                                    currentUserId;


                                let profileImage =
                                    null;


                                if (
                                    message.sender &&
                                    typeof message.sender ===
                                    "object" &&
                                    message.sender.profileImage
                                ) {

                                    profileImage =
                                        message.sender.profileImage;

                                }


                                const senderName =
                                    getSenderName(
                                        message,
                                        isMyMessage
                                    );


                                return (

                                    <div
                                        key={
                                            message._id
                                        }
                                        style={{
                                            display: "flex",

                                            justifyContent:

                                                isMyMessage

                                                    ?

                                                    "flex-end"

                                                    :

                                                    "flex-start"
                                        }}
                                    >

                                        <div
                                            className="chat-message"
                                            style={{

                                                position:
                                                    "relative",

                                                marginLeft:

                                                    isMyMessage

                                                        ?

                                                        "auto"

                                                        :

                                                        "0",

                                                background:

                                                    isMyMessage

                                                        ?

                                                        "rgba(34, 197, 94, 0.08)"

                                                        :

                                                        undefined,

                                                borderColor:

                                                    isMyMessage

                                                        ?

                                                        "rgba(34, 197, 94, 0.35)"

                                                        :

                                                        undefined

                                            }}
                                        >

                                            {/* HEADER */}

                                            <div
                                                className="chat-message__header"
                                            >

                                                <div
                                                    className="chat-message__sender"
                                                >

                                                    {!isMyMessage && (

                                                        profileImage

                                                            ?

                                                            <img
                                                                className="chat-message__avatar"
                                                                src={
                                                                    profileImage
                                                                }
                                                                alt={
                                                                    senderName
                                                                }
                                                            />

                                                            :

                                                            <div
                                                                className="
                                                                    chat-message__avatar
                                                                    chat-message__avatar--fallback
                                                                "
                                                            >
                                                                {
                                                                    getAvatarLetter(
                                                                        message
                                                                    )
                                                                }
                                                            </div>

                                                    )}


                                                    <span>
                                                        {
                                                            senderName
                                                        }
                                                    </span>


                                                    <small>
                                                        {
                                                            formatTime(
                                                                message.createdAt
                                                            )
                                                        }
                                                    </small>

                                                </div>


                                                {!message.isDeletedForEveryone && (

                                                    <div
                                                        style={{
                                                            position:
                                                                "relative"
                                                        }}
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                () =>

                                                                    setOpenMenuId(

                                                                        openMenuId ===
                                                                        message._id

                                                                            ?

                                                                            null

                                                                            :

                                                                            message._id

                                                                    )
                                                            }
                                                            style={{
                                                                border:
                                                                    "none",

                                                                background:
                                                                    "transparent",

                                                                color:
                                                                    "inherit",

                                                                cursor:
                                                                    "pointer",

                                                                fontSize:
                                                                    "20px"
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>


                                                        {openMenuId ===
                                                        message._id && (

                                                            <div
                                                                style={{
                                                                    position:
                                                                        "absolute",

                                                                    right:
                                                                        "0",

                                                                    top:
                                                                        "30px",

                                                                    zIndex:
                                                                        50,

                                                                    width:
                                                                        "190px",

                                                                    padding:
                                                                        "6px",

                                                                    border:
                                                                        "1px solid rgba(255,255,255,0.15)",

                                                                    borderRadius:
                                                                        "8px",

                                                                    background:
                                                                        "#151d27"
                                                                }}
                                                            >

                                                                {isMyMessage &&
                                                                    message.messageType ===
                                                                        "text" &&
                                                                    !message.isDeletedForEveryone && (

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleStartEdit(
                                                                                message
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                "100%",
                                                                            padding:
                                                                                "10px",
                                                                            border:
                                                                                "none",
                                                                            background:
                                                                                "transparent",
                                                                            color:
                                                                                "white",
                                                                            textAlign:
                                                                                "left",
                                                                            cursor:
                                                                                "pointer"
                                                                        }}
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>

                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        () =>
                                                                            handleDeleteForMe(
                                                                                message._id
                                                                            )
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "100%",

                                                                        padding:
                                                                            "10px",

                                                                        border:
                                                                            "none",

                                                                        background:
                                                                            "transparent",

                                                                        color:
                                                                            "white",

                                                                        textAlign:
                                                                            "left",

                                                                        cursor:
                                                                            "pointer"
                                                                    }}
                                                                >
                                                                    🗑 Delete for me
                                                                </button>


                                                                {isMyMessage && (

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            () =>
                                                                                handleDeleteForEveryone(
                                                                                    message._id
                                                                                )
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                "100%",

                                                                            padding:
                                                                                "10px",

                                                                            border:
                                                                                "none",

                                                                            background:
                                                                                "transparent",

                                                                            color:
                                                                                "#ef4444",

                                                                            textAlign:
                                                                                "left",

                                                                            cursor:
                                                                                "pointer"
                                                                        }}
                                                                    >
                                                                        🗑 Delete for everyone
                                                                    </button>

                                                                )}

                                                            </div>

                                                        )}

                                                    </div>

                                                )}

                                            </div>


                                            {/* DELETED */}

                                            {message.isDeletedForEveryone && (

                                                <p
                                                    style={{
                                                        opacity:
                                                            "0.55",

                                                        fontStyle:
                                                            "italic"
                                                    }}
                                                >
                                                    🚫 This message was deleted
                                                </p>

                                            )}


                                            {/* TEXT / EDIT */}

                                            {!message.isDeletedForEveryone &&

                                                message.messageType ===
                                                "text" && (

                                                    editingMessageId ===
                                                    message._id ? (

                                                        <div>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    editingText
                                                                }
                                                                onChange={
                                                                    (event) =>
                                                                        setEditingText(
                                                                            event.target.value
                                                                        )
                                                                }
                                                                autoFocus
                                                                disabled={
                                                                    sending
                                                                }
                                                                onKeyDown={
                                                                    (event) => {

                                                                        if (
                                                                            event.key ===
                                                                            "Enter" &&
                                                                            !event.shiftKey
                                                                        ) {

                                                                            event.preventDefault();

                                                                            handleSaveEdit(
                                                                                message
                                                                            );

                                                                        }

                                                                        if (
                                                                            event.key ===
                                                                            "Escape"
                                                                        ) {

                                                                            handleCancelEdit();

                                                                        }

                                                                    }
                                                                }
                                                                style={{
                                                                    width:
                                                                        "100%",
                                                                    minWidth:
                                                                        "220px",
                                                                    padding:
                                                                        "10px 12px",
                                                                    border:
                                                                        "1px solid #22c55e",
                                                                    borderRadius:
                                                                        "8px",
                                                                    outline:
                                                                        "none",
                                                                    background:
                                                                        "rgba(255,255,255,0.05)",
                                                                    color:
                                                                        "inherit",
                                                                    fontSize:
                                                                        "14px"
                                                                }}
                                                            />

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap:
                                                                        "8px",
                                                                    marginTop:
                                                                        "8px"
                                                                }}
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleSaveEdit(
                                                                            message
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        sending ||
                                                                        !editingText.trim()
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            "7px 12px",
                                                                        border:
                                                                            "1px solid #22c55e",
                                                                        borderRadius:
                                                                            "6px",
                                                                        background:
                                                                            "#22c55e",
                                                                        color:
                                                                            "#fff",
                                                                        cursor:
                                                                            "pointer",
                                                                        opacity:
                                                                            sending ||
                                                                            !editingText.trim()
                                                                                ? 0.5
                                                                                : 1
                                                                    }}
                                                                >
                                                                    {sending
                                                                        ? "Saving..."
                                                                        : "Save"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleCancelEdit
                                                                    }
                                                                    disabled={
                                                                        sending
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            "7px 12px",
                                                                        border:
                                                                            "1px solid rgba(255,255,255,0.18)",
                                                                        borderRadius:
                                                                            "6px",
                                                                        background:
                                                                            "transparent",
                                                                        color:
                                                                            "inherit",
                                                                        cursor:
                                                                            "pointer"
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <p>

                                                            {
                                                                message.decryptedContent ||

                                                                message.content ||

                                                                "🔒 Encrypted message"
                                                            }

                                                            {message.isEdited && (

                                                                <small
                                                                    style={{
                                                                        marginLeft:
                                                                            "8px",
                                                                        opacity:
                                                                            "0.5"
                                                                    }}
                                                                >
                                                                    edited
                                                                </small>

                                                            )}

                                                        </p>

                                                    )

                                                )}


                                            {/* IMAGE */}

                                            {!message.isDeletedForEveryone &&

                                                message.messageType ===
                                                "image" && (

                                                    <img
                                                        src={
                                                            message.fileUrl
                                                        }
                                                        alt={
                                                            message.fileName ||
                                                            "Shared image"
                                                        }
                                                    />

                                                )}


                                            {/* FILE */}

                                            {!message.isDeletedForEveryone &&

                                                message.messageType ===
                                                "file" && (

                                                    <a
                                                        href={
                                                            message.fileUrl
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        📎{" "}

                                                        {
                                                            message.fileName ||
                                                            "Download file"
                                                        }

                                                    </a>

                                                )}

                                        </div>

                                    </div>

                                );

                            }

                        )}


                    <div
                        ref={
                            messagesEndRef
                        }
                    />

                </div>


                {/* MESSAGE FORM */}

                <form
                    onSubmit={
                        handleSendMessage
                    }
                    className="chat-page__form"
                >

                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        hidden
                        onChange={
                            handleFileUpload
                        }
                    />


                    <button
                        type="button"
                        className="chat-page__file-button"
                        onClick={
                            handleFileButtonClick
                        }
                        disabled={
                            uploading ||
                            sending
                        }
                        title="Upload file"
                    >
                        {uploading
                            ?

                            "..."

                            :

                            "📎"}
                    </button>


                    <input
                        type="text"

                        placeholder={
                            socketStatus ===
                            "connected"

                                ?

                                "Type an encrypted message..."

                                :

                                "Chat is connecting..."
                        }

                        value={
                            messageText
                        }

                        onChange={
                            (event) =>

                                setMessageText(
                                    event.target.value
                                )
                        }

                        disabled={
                            sending ||
                            uploading
                        }
                    />


                    <button
                        type="submit"

                        disabled={
                            sending ||
                            uploading ||
                            !messageText.trim() ||
                            socketStatus !==
                            "connected"
                        }
                    >

                        {sending

                            ?

                            "Sending..."

                            :

                            "Send"}

                    </button>

                </form>

            </div>

        </section>

    );

};


export default ChatPage;