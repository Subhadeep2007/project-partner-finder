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
    getProjectE2EEKeys,
    getProjectById
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
const [replyingTo, setReplyingTo] =
    useState(null);

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

    const [project, setProject] =
        useState(null);

    const [onlineMembers, setOnlineMembers] =
        useState([]);

    const [lastSeenMap, setLastSeenMap] =
        useState({});

    const [typingUserIds, setTypingUserIds] =
        useState([]);

    const [notifyingMemberId, setNotifyingMemberId] =
        useState(null);

    const [notifiedMemberIds, setNotifiedMemberIds] =
        useState([]);

    const typingTimeoutsRef =
        useRef(new Map());

    const localTypingTimeoutRef =
        useRef(null);

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

    if (!projectId) {
        return;
    }

    let isMounted = true;

    const fetchProject = async() => {

        try {

            const response =
                await getProjectById(
                    projectId
                );

            if (isMounted) {
                setProject(
                    response.data
                );
            }

        } catch (error) {

            console.error(
                "Failed to load project members:",
                error
            );

        }

    };

    fetchProject();

    return () => {
        isMounted = false;
    };

}, [projectId]);


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


    // ==========================================
    // REPLY HELPERS
    // ==========================================

    const getReplyPreviewText = (message) => {
    if (!message) return "";

    if (message.isDeletedForEveryone) {
        return "This message was deleted";
    }

    if (message.messageType === "image") {
        return `📷 ${message.fileName || "Photo"}`;
    }

    if (message.messageType === "file") {
        return `📎 ${message.fileName || "File"}`;
    }

    return message.decryptedContent || message.content || "Encrypted message";
};


    const resolveReplyMessage = (message, sourceMessages = []) => {

        if (!message || !message.replyTo) {
            return message;
        }

        if (
            typeof message.replyTo === "object" &&
            message.replyTo !== null
        ) {
            return message;
        }

        const replyId = String(
            getId(message.replyTo)
        );

        if (!replyId) {
            return message;
        }

        const originalMessage =
            Array.isArray(sourceMessages)
                ? sourceMessages.find(
                    (item) =>
                        String(item?._id) === replyId
                )
                : null;

        if (!originalMessage) {
            return message;
        }

        return {
            ...message,
            replyTo: originalMessage
        };

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


        let decryptedReply = null;

        if (
            message.replyTo &&
            typeof message.replyTo === "object" &&
            message.replyTo !== null
        ) {

            try {

                if (message.replyTo.isDeletedForEveryone) {

                    decryptedReply = {
                        ...message.replyTo,
                        decryptedContent:
                            "This message was deleted"
                    };

                } else if (
                    message.replyTo.encryptedContent &&
                    message.replyTo.iv &&
                    Array.isArray(
                        message.replyTo.encryptedKeys
                    )
                ) {

                    decryptedReply =
                        await decryptSingleMessage(
                            message.replyTo,
                            currentUserId
                        );

                } else {

                    decryptedReply = {
                        ...message.replyTo,
                        decryptedContent:
                            getReplyPreviewText(
                                message.replyTo
                            )
                    };

                }

            } catch (replyError) {

                console.error(
                    "Reply message decryption failed:",
                    replyError
                );

            }

        }


        return {
            ...message,

            decryptedContent,

            replyTo:
                message.replyTo &&
                typeof message.replyTo === "object"
                    ? {
                        ...message.replyTo,

                        decryptedContent:
                            decryptedReply?.decryptedContent ||
                            getReplyPreviewText(
                                message.replyTo
                            )
                    }
                    : message.replyTo,

            replyPreviewText:
                decryptedReply?.decryptedContent ||
                (
                    message.replyTo &&
                    typeof message.replyTo === "object"
                        ? getReplyPreviewText(
                            message.replyTo
                        )
                        : ""
                )

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


            const messagesWithResolvedReplies =
                loadedMessages.map(
                    (message) =>
                        resolveReplyMessage(
                            message,
                            loadedMessages
                        )
                );


            const decryptedMessages =
    await decryptAllMessages(
        messagesWithResolvedReplies,
        currentUserId
    );


// Backend messages are returned
// newest -> oldest.
// Chat UI should display
// oldest -> newest.
const orderedMessages =
    [...decryptedMessages].reverse();


if (isMounted) {

    setMessages(
        orderedMessages
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
    const getProjectMembers = () => {

        if (!project) {
            return [];
        }

        const owner = project.owner || null;
        const members = Array.isArray(project.members)
            ? project.members
            : [];

        const users = [];

        if (owner) {
            users.push(owner);
        }

        members.forEach((member) => {

            const memberId = getId(member);

            if (!users.some((user) => getId(user) === memberId)) {
                users.push(member);
            }

        });

        return users;

    };


    const formatLastSeen = (value) => {

        if (!value) {
            return "Last seen unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Last seen unavailable";
        }

        return `Last seen ${date.toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        })}`;

    };


    const isUserOnline = (userId) => {

        return onlineMembers.some(
            (id) => String(id) === String(userId)
        );

    };


    const isUserTyping = (userId) => {

        return typingUserIds.some(
            (id) => String(id) === String(userId)
        );

    };


    // ==========================================
    // SEND COME ONLINE NOTIFICATION
    // ==========================================

    const handleNotifyMember = async(
        memberId
    ) => {

        if (
            !memberId ||
            !projectId ||
            String(memberId) === String(currentUserId)
        ) {
            return;
        }


        if (
            notifiedMemberIds.some(
                (id) =>
                    String(id) === String(memberId)
            )
        ) {
            return;
        }


        try {

            setNotifyingMemberId(
                String(memberId)
            );

            setError("");


            await api.post(
                "/notifications/come-online-request",
                {
                    projectId,
                    memberId
                }
            );


            setNotifiedMemberIds(
                (previousIds) => {

                    if (
                        previousIds.some(
                            (id) =>
                                String(id) === String(memberId)
                        )
                    ) {
                        return previousIds;
                    }


                    return [
                        ...previousIds,
                        String(memberId)
                    ];

                }
            );

        } catch (error) {

            setError(
                error &&
                error.response &&
                error.response.data &&
                error.response.data.message
                    ?
                    error.response.data.message
                    :
                    error &&
                    error.message
                        ?
                        error.message
                        :
                        "Failed to send notification"
            );

        } finally {

            setNotifyingMemberId(
                null
            );

        }

    };


    // ==========================================
    // LOAD ALL HISTORICAL MESSAGES FOR RE-KEY
    // ==========================================

    const getAllMessagesForRekey = async(
        targetProjectId
    ) => {

        const allMessages = [];
        let page = 1;
        let totalPages = 1;
        const limit = 100;

        do {

            const response =
                await getProjectMessages(
                    targetProjectId,
                    page,
                    limit
                );

            const pageMessages =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            allMessages.push(...pageMessages);

            totalPages = Number(
                response?.pagination?.totalPages || 1
            );

            page += 1;

        } while (page <= totalPages);

        return allMessages;
    };


    const refreshMessagesAfterRekey = async() => {

        if (!projectId || !currentUserId) {
            return;
        }

        await new Promise((resolve) =>
            setTimeout(resolve, 400)
        );

        try {

            const response =
                await getProjectMessages(projectId);

            const latestMessages =
                Array.isArray(response?.data)
                    ? response.data
                    : [];

            const decryptedMessages =
    await decryptAllMessages(
        latestMessages,
        currentUserId
    );


// Keep the same chat order after re-key refresh.
const orderedMessages =
    [...decryptedMessages].reverse();


setMessages(
    orderedMessages
);

            console.log(
                "Messages refreshed after E2EE re-key"
            );

        } catch (error) {

            console.error(
                "Failed to refresh messages after E2EE re-key:",
                error
            );

        }

    };


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


        const joinProject = async() => {

    setSocketStatus(
        "connected"
    );

    socket.emit(
        "join_project_chat",
        projectId,
        async(response) => {

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

            try {

                await syncCurrentUserE2EEKey(
                    currentUserId
                );

                socket.emit(
                    "request_message_rekey",
                    {
                        projectId,
                        targetUserId:
                            currentUserId
                    }
                );

            } catch (e2eeError) {

                console.error(
                    "Failed to sync E2EE key before re-key request:",
                    e2eeError
                );

            }

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
        const handleProjectOnlineMembers = (data) => {

            const onlineIds = Array.isArray(data?.onlineMembers)
                ? data.onlineMembers.map((id) => String(id))
                : [];

            setOnlineMembers(onlineIds);

        };


        const handleProjectMemberOnline = ({
            projectId: presenceProjectId,
            userId
        }) => {

            if (String(presenceProjectId) !== String(projectId)) {
                return;
            }

            const normalizedUserId = String(userId);

            setOnlineMembers((previous) => {

                if (previous.includes(normalizedUserId)) {
                    return previous;
                }

                return [...previous, normalizedUserId];

            });

        };


        const handleProjectMemberOffline = ({
            projectId: presenceProjectId,
            userId
        }) => {

            if (String(presenceProjectId) !== String(projectId)) {
                return;
            }

            const normalizedUserId = String(userId);

            setOnlineMembers((previous) =>
                previous.filter((id) => String(id) !== normalizedUserId)
            );

        };


        const handleUserOffline = ({
            userId,
            lastSeen
        }) => {

            if (!userId) {
                return;
            }

            const normalizedUserId = String(userId);

            setOnlineMembers((previous) =>
                previous.filter((id) => String(id) !== normalizedUserId)
            );

            if (lastSeen) {
                setLastSeenMap((previous) => ({
                    ...previous,
                    [normalizedUserId]: lastSeen
                }));
            }

        };


        const handleUserTyping = ({
            projectId: typingProjectId,
            userId,
            isTyping
        }) => {

            if (
                String(typingProjectId) !== String(projectId) ||
                !userId ||
                String(userId) === String(currentUserId)
            ) {
                return;
            }

            const normalizedUserId = String(userId);

            const existingTimeout =
                typingTimeoutsRef.current.get(normalizedUserId);

            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            if (!isTyping) {

                typingTimeoutsRef.current.delete(normalizedUserId);

                setTypingUserIds((previous) =>
                    previous.filter((id) => String(id) !== normalizedUserId)
                );

                return;

            }

            setTypingUserIds((previous) => {

                if (previous.includes(normalizedUserId)) {
                    return previous;
                }

                return [...previous, normalizedUserId];

            });

            const timeout = setTimeout(() => {

                setTypingUserIds((previous) =>
                    previous.filter((id) => String(id) !== normalizedUserId)
                );

                typingTimeoutsRef.current.delete(normalizedUserId);

            }, 3500);

            typingTimeoutsRef.current.set(
                normalizedUserId,
                timeout
            );

        };


        socket.on(
            "project_online_members",
            handleProjectOnlineMembers
        );

        socket.on(
            "project_member_online",
            handleProjectMemberOnline
        );

        socket.on(
            "project_member_offline",
            handleProjectMemberOffline
        );

        socket.on(
            "user_offline",
            handleUserOffline
        );

        socket.on(
            "user_typing",
            handleUserTyping
        );


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


                const messageWithReply =
                    resolveReplyMessage(
                        message,
                        messagesRef.current
                    );


                const decryptedMessage =
                    await decryptSingleMessage(
                        messageWithReply,
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


            const allMessages =
                await getAllMessagesForRekey(
                    projectId
                );

            for (
                const message of allMessages
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

            socket.emit(
                "message_rekey_completed",
                {
                    projectId,
                    targetUserId
                }
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
                                    String(message._id) === String(messageId)
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
            const allMessages =
                await getAllMessagesForRekey(
                    projectId
                );

            for (
                const message of allMessages
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

            socket.emit(
                "message_rekey_completed",
                {
                    projectId,
                    targetUserId: memberId
                }
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
        const handleMessageRekeyCompleted = async({
            projectId: rekeyProjectId,
            targetUserId
        }) => {

            if (
                String(rekeyProjectId) !==
                String(projectId)
            ) {
                return;
            }

            if (
                !currentUserId ||
                String(targetUserId) !==
                String(currentUserId)
            ) {
                return;
            }

            console.log(
                "E2EE re-key completed for current user:",
                targetUserId
            );

            await refreshMessagesAfterRekey();

        };

        socket.on(
            "message_rekey_completed",
            handleMessageRekeyCompleted
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

            if (localTypingTimeoutRef.current) {
                clearTimeout(
                    localTypingTimeoutRef.current
                );
                localTypingTimeoutRef.current = null;
            }

            socket.emit(
                "typing_stop",
                { projectId }
            );

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
                "project_online_members",
                handleProjectOnlineMembers
            );

            socket.off(
                "project_member_online",
                handleProjectMemberOnline
            );

            socket.off(
                "project_member_offline",
                handleProjectMemberOffline
            );

            socket.off(
                "user_offline",
                handleUserOffline
            );

            socket.off(
                "user_typing",
                handleUserTyping
            );

            if (localTypingTimeoutRef.current) {
                clearTimeout(localTypingTimeoutRef.current);
                localTypingTimeoutRef.current = null;
            }

            typingTimeoutsRef.current.forEach(
                (timeout) => clearTimeout(timeout)
            );

            typingTimeoutsRef.current.clear();

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
                "message_rekey_completed",
                handleMessageRekeyCompleted
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

const handleReplyToMessage = (
    message
) => {

    if (!message) {
        return;
    }

    setReplyingTo({
        _id: message._id,
        sender: message.sender,
        messageType: message.messageType,
        decryptedContent:
            message.decryptedContent ||
            message.content ||
            "Encrypted message",
        content: message.content || "",
        encryptedContent:
            message.encryptedContent || "",
        iv: message.iv || "",
        encryptedKeys:
            Array.isArray(message.encryptedKeys)
                ? message.encryptedKeys
                : [],
        isDeletedForEveryone:
            Boolean(
                message.isDeletedForEveryone
            )
    });

    setOpenMenuId(null);

};


const handleCancelReply = () => {

    setReplyingTo(null);

};
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
                            "text",

                        replyTo:
                            replyingTo
                                ? replyingTo._id
                                : null

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
                        setReplyingTo(null);

                        if (localTypingTimeoutRef.current) {
                            clearTimeout(
                                localTypingTimeoutRef.current
                            );
                            localTypingTimeoutRef.current = null;
                        }

                        socket.emit(
                            "typing_stop",
                            { projectId }
                        );

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

            const response =
                await uploadChatFile(
                    projectId,
                    file
                );

            const uploadedMessage =
                response?.data;

            if (uploadedMessage) {

                setMessages(
                    (previousMessages) => {

                        const alreadyExists =
                            previousMessages.some(
                                (message) =>
                                    String(message._id) ===
                                    String(uploadedMessage._id)
                            );

                        if (alreadyExists) {
                            return previousMessages;
                        }

                        return [
                            ...previousMessages,
                            uploadedMessage
                        ];
                    }
                );

            }

            event.target.value = "";

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to upload file"
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


               await new Promise(
    (
        resolve,
        reject
    ) => {

        if (!socket.connected) {

            reject(
                new Error(
                    "Chat connection is not available"
                )
            );

            return;

        }


        socket.emit(
            "delete_message_for_everyone",
            {
                messageId
            },
            (
                response
            ) => {

                if (
                    response &&
                    response.success
                ) {

                    resolve(
                        response
                    );

                    return;

                }


                reject(
                    new Error(
                        response &&
                        response.message
                            ? response.message
                            : "Failed to delete message for everyone"
                    )
                );

            }
        );

    }
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

    <main
        className="
            !flex
            !min-h-[calc(100vh-0px)]
            !w-full
            !flex-col
            !overflow-hidden
            !bg-[#060a0f]
            !text-white
        "
    >

        {/* ==========================================
            TOP HEADER
        ========================================== */}

        <header
            className="
                !shrink-0
                !border-b
                !border-white/10
                !bg-[#0a1016]/95
                !px-4
                !py-4
                !backdrop-blur-xl
                sm:!px-6
                lg:!px-8
            "
        >

            <div
                className="
                    !mx-auto
                    !flex
                    !w-full
                    !max-w-7xl
                    !flex-col
                    !gap-4
                    sm:!flex-row
                    sm:!items-center
                    sm:!justify-between
                "
            >

                <div>

                    <p
                        className="
                            !m-0
                            !font-mono
                            !text-[11px]
                            !font-bold
                            !uppercase
                            !tracking-[0.2em]
                            !text-emerald-400
                        "
                    >
                        ~/projects/chat
                    </p>


                    <div
                        className="
                            !mt-2
                            !flex
                            !items-center
                            !gap-3
                        "
                    >

                        <h1
                            className="
                                !m-0
                                !text-xl
                                !font-black
                                !tracking-tight
                                sm:!text-2xl
                            "
                        >
                            Project Chat
                        </h1>

                    </div>


                    <p
                        className="
                            !mt-1
                            !mb-0
                            !text-xs
                            !text-slate-500
                            sm:!text-sm
                        "
                    >
                        Communicate securely with your
                        project team.
                    </p>

                </div>


                {/* CONNECTION STATUS */}

                <div
                    className="
                        !inline-flex
                        !w-fit
                        !items-center
                        !gap-2
                        !rounded-full
                        !border
                        !border-white/10
                        !bg-white/[0.03]
                        !px-3
                        !py-2
                    "
                >

                    <span
                        className={`
                            !h-2
                            !w-2
                            !rounded-full
                            ${
                                socketStatus ===
                                "connected"
                                    ? "!bg-emerald-400"
                                    : socketStatus ===
                                      "connecting"
                                        ? "!bg-yellow-400"
                                        : "!bg-red-400"
                            }
                        `}
                    />


                    <span
                        className="
                            !text-xs
                            !font-semibold
                            !text-slate-300
                        "
                    >
                        {socketStatus ===
                        "connected"
                            ? "Live"
                            : socketStatus ===
                              "connecting"
                                ? "Connecting..."
                                : "Offline"}
                    </span>

                </div>



                {/* TEAM PRESENCE */}

                <div
                    className="
                        !mt-3
                        !w-full
                    "
                >

                    <div
                        className="
                            !rounded-2xl
                            !border
                            !border-white/10
                            !bg-white/[0.02]
                            !p-3
                        "
                    >

                        <div
                            className="
                                !flex
                                !items-center
                                !justify-between
                                !gap-3
                            "
                        >
                            <span
                                className="
                                    !font-mono
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-widest
                                    !text-slate-500
                                "
                            >
                                Team Presence
                            </span>

                            <span
                                className="
                                    !text-[10px]
                                    !font-semibold
                                    !text-slate-600
                                "
                            >
                                {onlineMembers.length} online
                            </span>
                        </div>

                        <div
                            className="
                                !mt-3
                                !flex
                                !max-h-28
                                !flex-wrap
                                !gap-2
                                !overflow-y-auto
                            "
                        >
                            {getProjectMembers().length === 0 ? (
                                <span
                                    className="
                                        !text-xs
                                        !text-slate-600
                                    "
                                >
                                    Loading team...
                                </span>
                            ) : (
                                getProjectMembers().map((member) => {

                                    const memberId = getId(member);
                                    const online = isUserOnline(memberId);
                                    const typing = isUserTyping(memberId);

                                    return (
                                        <div
                                            key={memberId}
                                            className="
                                                !flex
                                                !min-w-0
                                                !items-center
                                                !gap-2
                                                !rounded-xl
                                                !border
                                                !border-white/10
                                                !bg-black/10
                                                !px-2.5
                                                !py-2
                                            "
                                            title={
                                                online
                                                    ? typing
                                                        ? "Typing..."
                                                        : "Online"
                                                    : lastSeenMap[memberId]
                                                        ? formatLastSeen(lastSeenMap[memberId])
                                                        : member.lastSeen
                                                            ? formatLastSeen(member.lastSeen)
                                                            : "Offline"
                                            }
                                        >
                                            <span
                                                className={`
                                                    !h-2
                                                    !w-2
                                                    !shrink-0
                                                    !rounded-full
                                                    ${
                                                        online
                                                            ? "!bg-emerald-400"
                                                            : "!bg-slate-600"
                                                    }
                                                `}
                                            />

                                            <span
                                                className="
                                                    !max-w-[120px]
                                                    !truncate
                                                    !text-xs
                                                    !font-semibold
                                                    !text-slate-300
                                                "
                                            >
                                                {member.name || "User"}
                                            </span>

                                            {typing && (
                                                <span
                                                    className="
                                                        !ml-auto
                                                        !text-[10px]
                                                        !font-semibold
                                                        !text-emerald-300
                                                    "
                                                >
                                                    typing...
                                                </span>
                                            )}

                                            {!online && !typing && (
                                                <>
                                                    <span
                                                        className="
                                                            !ml-auto
                                                            !text-[9px]
                                                            !text-slate-600
                                                        "
                                                    >
                                                        offline
                                                    </span>


                                                    {String(memberId) !==
                                                        String(currentUserId) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotifyMember(
                                                                    memberId
                                                                )
                                                            }
                                                            disabled={
                                                                notifyingMemberId ===
                                                                    String(memberId) ||
                                                                notifiedMemberIds.some(
                                                                    (id) =>
                                                                        String(id) ===
                                                                        String(memberId)
                                                                )
                                                            }
                                                            className="
                                                                !rounded-lg
                                                                !border
                                                                !border-emerald-400/20
                                                                !bg-emerald-400/5
                                                                !px-2
                                                                !py-1
                                                                !text-[9px]
                                                                !font-bold
                                                                !text-emerald-300
                                                                !transition
                                                                hover:!border-emerald-400/40
                                                                hover:!bg-emerald-400/10
                                                                disabled:!cursor-not-allowed
                                                                disabled:!opacity-50
                                                            "
                                                        >
                                                            {notifyingMemberId ===
                                                            String(memberId)
                                                                ? "Sending..."
                                                                : notifiedMemberIds.some(
                                                                    (id) =>
                                                                        String(id) ===
                                                                        String(memberId)
                                                                )
                                                                    ? "✓ Sent"
                                                                    : "Notify"}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );

                                })
                            )}
                        </div>
                    </div>
                </div>            </div>

        </header>


        {/* ==========================================
            CHAT BODY
        ========================================== */}

        <section
            className="
                !min-h-0
                !flex-1
                !overflow-hidden
            "
        >

            <div
                className="
                    !mx-auto
                    !flex
                    !h-full
                    !w-full
                    !max-w-7xl
                    !flex-col
                "
            >

                {/* ERROR */}

                {error && (

                    <div
                        className="
                            !mx-4
                            !mt-4
                            !rounded-xl
                            !border
                            !border-red-400/20
                            !bg-red-400/5
                            !px-4
                            !py-3
                            !text-sm
                            !text-red-300
                            sm:!mx-6
                            lg:!mx-8
                        "
                    >

                        <div
                            className="
                                !flex
                                !items-center
                                !justify-between
                                !gap-4
                            "
                        >

                            <span>
                                {error}
                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                className="
                                    !text-lg
                                    !text-red-300
                                    !transition
                                    hover:!text-white
                                "
                            >
                                ×
                            </button>

                        </div>

                    </div>

                )}


                {/* ======================================
                    MESSAGE AREA
                ====================================== */}

                <div
                    className="
                        !min-h-0
                        !flex-1
                        !overflow-y-auto
                        !px-3
                        !py-5
                        sm:!px-6
                        sm:!py-6
                        lg:!px-8
                    "
                >

                    {loading && (

                        <div
                            className="
                                !flex
                                !h-full
                                !items-center
                                !justify-center
                            "
                        >

                            <div
                                className="
                                    !rounded-2xl
                                    !border
                                    !border-white/10
                                    !bg-[#0d151d]
                                    !px-6
                                    !py-5
                                    !text-sm
                                    !text-slate-400
                                "
                            >
                                Loading messages...
                            </div>

                        </div>

                    )}


                    {!loading &&
                    messages.length === 0 && (

                        <div
                            className="
                                !flex
                                !h-full
                                !items-center
                                !justify-center
                            "
                        >

                            <div
                                className="
                                    !max-w-md
                                    !rounded-3xl
                                    !border
                                    !border-white/10
                                    !bg-[#0d151d]
                                    !p-8
                                    !text-center
                                "
                            >

                                <div
                                    className="
                                        !mx-auto
                                        !flex
                                        !h-16
                                        !w-16
                                        !items-center
                                        !justify-center
                                        !rounded-2xl
                                        !bg-emerald-400/10
                                        !text-2xl
                                    "
                                >
                                    💬
                                </div>


                                <h2
                                    className="
                                        !mt-5
                                        !text-xl
                                        !font-black
                                    "
                                >
                                    No messages yet
                                </h2>


                                <p
                                    className="
                                        !mt-2
                                        !text-sm
                                        !leading-6
                                        !text-slate-500
                                    "
                                >
                                    Start a secure conversation
                                    with your project team.
                                </p>

                            </div>

                        </div>

                    )}


                    {!loading &&
                    messages.length > 0 && (

                        <div
                            className="
                                !mx-auto
                                !flex
                                !w-full
                                !max-w-5xl
                                !flex-col
                                !gap-4
                            "
                        >

                            {messages.map(
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
                                        message.sender
                                            .profileImage
                                    ) {

                                        profileImage =
                                            message.sender
                                                .profileImage;

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
                                            className={`
                                                !flex
                                                !w-full
                                                ${
                                                    isMyMessage
                                                        ? "!justify-end"
                                                        : "!justify-start"
                                                }
                                            `}
                                        >

                                            <article
                                                className={`
                                                    !w-fit
                                                    !max-w-[92%]
                                                    !overflow-visible
                                                    !rounded-2xl
                                                    !border
                                                    !p-3
                                                    !shadow-lg
                                                    sm:!max-w-[75%]
                                                    ${
                                                        isMyMessage
                                                            ? "!border-emerald-400/20 !bg-emerald-400/[0.05]"
                                                            : "!border-white/10 !bg-[#0d151d]"
                                                    }
                                                `}
                                            >

                                                {/* MESSAGE HEADER */}

                                                <div
                                                    className="
                                                        !flex
                                                        !items-center
                                                        !justify-between
                                                        !gap-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            !flex
                                                            !min-w-0
                                                            !items-center
                                                            !gap-3
                                                        "
                                                    >

                                                        {!isMyMessage && (

                                                            <div
                                                                className="
                                                                    !h-9
                                                                    !w-9
                                                                    !shrink-0
                                                                    !overflow-hidden
                                                                    !rounded-xl
                                                                    !border
                                                                    !border-white/10
                                                                    !bg-white/[0.03]
                                                                "
                                                            >

                                                                {profileImage ? (

                                                                    <img
                                                                        src={
                                                                            profileImage
                                                                        }
                                                                        alt={
                                                                            senderName
                                                                        }
                                                                        className="
                                                                            !h-full
                                                                            !w-full
                                                                            !object-cover
                                                                        "
                                                                    />

                                                                ) : (

                                                                    <div
                                                                        className="
                                                                            !flex
                                                                            !h-full
                                                                            !w-full
                                                                            !items-center
                                                                            !justify-center
                                                                            !font-bold
                                                                            !text-emerald-300
                                                                        "
                                                                    >
                                                                        {
                                                                            getAvatarLetter(
                                                                                message
                                                                            )
                                                                        }
                                                                    </div>

                                                                )}

                                                            </div>

                                                        )}


                                                        <div
                                                            className="
                                                                !min-w-0
                                                            "
                                                        >

                                                            <p
                                                                className={`
                                                                    !m-0
                                                                    !truncate
                                                                    !text-sm
                                                                    !font-bold
                                                                    ${
                                                                        isMyMessage
                                                                            ? "!text-emerald-400"
                                                                            : "!text-white"
                                                                    }
                                                                `}
                                                            >
                                                                {
                                                                    senderName
                                                                }
                                                            </p>


                                                            <p
                                                                className="
                                                                    !mt-0.5
                                                                    !mb-0
                                                                    !text-[10px]
                                                                    !text-slate-600
                                                                "
                                                            >
                                                                {
                                                                    formatTime(
                                                                        message.createdAt
                                                                    )
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {!message.isDeletedForEveryone && (

                                                        <div
                                                            className="
                                                                !relative
                                                            "
                                                        >

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setOpenMenuId(
                                                                        openMenuId ===
                                                                            message._id
                                                                            ? null
                                                                            : message._id
                                                                    )
                                                                }
                                                                className="
                                                                    !flex
                                                                    !h-8
                                                                    !w-8
                                                                    !items-center
                                                                    !justify-center
                                                                    !rounded-lg
                                                                    !text-slate-500
                                                                    !transition
                                                                    hover:!bg-white/5
                                                                    hover:!text-white
                                                                "
                                                            >
                                                                ⋮
                                                            </button>


                                                            {openMenuId ===
                                                                message._id && (

                                                                <div
                                                                    className="
                                                                        !absolute
                                                                        !right-0
                                                                        !top-9
                                                                        !z-50
                                                                        !w-48
                                                                        !overflow-hidden
                                                                        !rounded-xl
                                                                        !border
                                                                        !border-white/10
                                                                        !bg-[#101820]
                                                                        !shadow-2xl
                                                                    "
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
                                                                            className="
                                                                                !flex
                                                                                !w-full
                                                                                !px-4
                                                                                !py-3
                                                                                !text-left
                                                                                !text-sm
                                                                                !text-slate-200
                                                                                !transition
                                                                                hover:!bg-white/5
                                                                            "
                                                                        >
                                                                            ✏️ Edit
                                                                        </button>

                                                                    )}


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleReplyToMessage(
                                                                                message
                                                                            )
                                                                        }
                                                                        className="
                                                                            !flex
                                                                            !w-full
                                                                            !px-4
                                                                            !py-3
                                                                            !text-left
                                                                            !text-sm
                                                                            !text-slate-200
                                                                            !transition
                                                                            hover:!bg-white/5
                                                                        "
                                                                    >
                                                                        ↩ Reply
                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteForMe(
                                                                                message._id
                                                                            )
                                                                        }
                                                                        className="
                                                                            !flex
                                                                            !w-full
                                                                            !px-4
                                                                            !py-3
                                                                            !text-left
                                                                            !text-sm
                                                                            !text-slate-200
                                                                            !transition
                                                                            hover:!bg-white/5
                                                                        "
                                                                    >
                                                                        🗑 Delete for me
                                                                    </button>


                                                                    {isMyMessage && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteForEveryone(
                                                                                    message._id
                                                                                )
                                                                            }
                                                                            className="
                                                                                !flex
                                                                                !w-full
                                                                                !px-4
                                                                                !py-3
                                                                                !text-left
                                                                                !text-sm
                                                                                !text-red-300
                                                                                !transition
                                                                                hover:!bg-red-400/5
                                                                            "
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

                                                    <div
                                                        className="
                                                            !mt-3
                                                            !rounded-xl
                                                            !border
                                                            !border-white/5
                                                            !bg-black/10
                                                            !px-3
                                                            !py-2
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                !m-0
                                                                !text-sm
                                                                !italic
                                                                !text-slate-500
                                                            "
                                                        >
                                                            🚫 This message was deleted
                                                        </p>

                                                    </div>

                                                )}


                                                {/* TEXT */}

                                                {!message.isDeletedForEveryone &&
                                                message.messageType ===
                                                    "text" && (

                                                    editingMessageId ===
                                                    message._id ? (

                                                        <div
                                                            className="
                                                                !mt-3
                                                                !min-w-[240px]
                                                                sm:!min-w-[320px]
                                                            "
                                                        >

                                                            <input
                                                                type="text"
                                                                value={
                                                                    editingText
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setEditingText(
                                                                        event.target.value
                                                                    )
                                                                }
                                                                autoFocus
                                                                disabled={
                                                                    sending
                                                                }
                                                                onKeyDown={(
                                                                    event
                                                                ) => {

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

                                                                }}
                                                                className="
                                                                    !h-11
                                                                    !w-full
                                                                    !rounded-xl
                                                                    !border
                                                                    !border-emerald-400/30
                                                                    !bg-black/20
                                                                    !px-3
                                                                    !text-sm
                                                                    !text-white
                                                                    !outline-none
                                                                    focus:!border-emerald-400
                                                                "
                                                            />


                                                            <div
                                                                className="
                                                                    !mt-2
                                                                    !flex
                                                                    !gap-2
                                                                "
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
                                                                    className="
                                                                        !rounded-lg
                                                                        !bg-emerald-400
                                                                        !px-3
                                                                        !py-2
                                                                        !text-xs
                                                                        !font-bold
                                                                        !text-black
                                                                        disabled:!opacity-50
                                                                    "
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
                                                                    className="
                                                                        !rounded-lg
                                                                        !border
                                                                        !border-white/10
                                                                        !px-3
                                                                        !py-2
                                                                        !text-xs
                                                                        !font-bold
                                                                        !text-slate-300
                                                                    "
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <div
                                                            className="
                                                                !mt-3
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    !m-0
                                                                    !whitespace-pre-wrap
                                                                    !break-words
                                                                    !text-sm
                                                                    !leading-6
                                                                    !text-slate-200
                                                                "
                                                            >
                                                                {
                                                                    message.decryptedContent ||
                                                                    message.content ||
                                                                    "🔒 Encrypted message"
                                                                }


                                                                {message.isEdited && (

                                                                    <span
                                                                        className="
                                                                            !ml-2
                                                                            !text-[10px]
                                                                            !text-slate-600
                                                                        "
                                                                    >
                                                                        edited
                                                                    </span>

                                                                )}

                                                            </p>

                                                        </div>

                                                    )

                                                )}


                                                {/* REPLIED MESSAGE */}

                                                {message.replyTo && (

                                                    <div
                                                        className="
                                                            !mb-3
                                                            !rounded-xl
                                                            !border
                                                            !border-white/10
                                                            !bg-black/20
                                                            !px-3
                                                            !py-2.5
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                !m-0
                                                                !text-[10px]
                                                                !font-black
                                                                !uppercase
                                                                !tracking-[0.12em]
                                                                !text-emerald-400
                                                            "
                                                        >
                                                            Replying to{" "}
                                                            {message.replyTo.sender?.name ||
                                                                "message"}
                                                        </p>


                                                        <p
                                                            className="
                                                                !mt-1
                                                                !mb-0
                                                                !truncate
                                                                !text-xs
                                                                !text-slate-400
                                                            "
                                                        >
                                                            {message.replyPreviewText ||
                                                                (typeof message.replyTo === "object"
                                                                    ? message.replyTo.isDeletedForEveryone
                                                                        ? "This message was deleted"
                                                                        : message.replyTo.decryptedContent ||
                                                                          message.replyTo.content ||
                                                                          "Encrypted message"
                                                                    : "Original message unavailable")}
                                                        </p>

                                                    </div>

                                                )}


                                                {/* IMAGE */}

                                                {!message.isDeletedForEveryone &&
                                                message.messageType ===
                                                    "image" && (

                                                    <div
                                                        className="
                                                            !mt-3
                                                            !overflow-hidden
                                                            !rounded-xl
                                                            !border
                                                            !border-white/10
                                                        "
                                                    >

                                                        <img
                                                            src={
                                                                message.fileUrl
                                                            }
                                                            alt={
                                                                message.fileName ||
                                                                "Shared image"
                                                            }
                                                            className="
                                                                !block
                                                                !max-h-[420px]
                                                                !max-w-full
                                                                !object-contain
                                                            "
                                                        />

                                                    </div>

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
                                                        className="
                                                            !mt-3
                                                            !flex
                                                            !items-center
                                                            !gap-3
                                                            !rounded-xl
                                                            !border
                                                            !border-white/10
                                                            !bg-white/[0.03]
                                                            !px-4
                                                            !py-3
                                                            !text-sm
                                                            !font-semibold
                                                            !text-slate-200
                                                            !no-underline
                                                            !transition
                                                            hover:!border-emerald-400/20
                                                            hover:!text-emerald-300
                                                        "
                                                    >
                                                        <span>
                                                            📎
                                                        </span>

                                                        <span
                                                            className="
                                                                !truncate
                                                            "
                                                        >
                                                            {
                                                                message.fileName ||
                                                                "Download file"
                                                            }
                                                        </span>

                                                    </a>

                                                )}

                                            </article>

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

                    )}

                </div>


                {/* ======================================
                    TYPING INDICATOR
                ====================================== */}

                {typingUserIds.length > 0 && (
                    <div
                        className="
                            !shrink-0
                            !px-3
                            !pb-2
                            sm:!px-6
                            lg:!px-8
                        "
                    >
                        <div
                            className="
                                !mx-auto
                                !flex
                                !w-full
                                !max-w-5xl
                                !items-center
                                !gap-2
                                !text-xs
                                !text-slate-500
                            "
                        >
                            <span className="!flex !items-center !gap-1">
                                <span className="!animate-bounce !text-emerald-400">●</span>
                                <span className="!animate-bounce !text-emerald-400 [animation-delay:120ms]">●</span>
                                <span className="!animate-bounce !text-emerald-400 [animation-delay:240ms]">●</span>
                            </span>

                            <span>
                                {typingUserIds.length === 1
                                    ? "Someone is typing..."
                                    : `${typingUserIds.length} people are typing...`}
                            </span>
                        </div>
                    </div>
                )}


                {/* ======================================
                    MESSAGE COMPOSER
                ====================================== */}

                <div
                    className="
                        !shrink-0
                        !border-t
                        !border-white/10
                        !bg-[#080d12]/95
                        !px-3
                        !py-3
                        !backdrop-blur-xl
                        sm:!px-6
                        sm:!py-4
                        lg:!px-8
                    "
                >

                    {replyingTo && (

                        <div
                            className="
                                !mx-auto
                                !mb-2
                                !flex
                                !w-full
                                !max-w-5xl
                                !items-center
                                !justify-between
                                !gap-3
                                !rounded-xl
                                !border
                                !border-emerald-400/20
                                !bg-emerald-400/[0.04]
                                !px-3
                                !py-2.5
                            "
                        >

                            <div className="!min-w-0">

                                <p
                                    className="
                                        !m-0
                                        !text-[10px]
                                        !font-black
                                        !uppercase
                                        !tracking-[0.14em]
                                        !text-emerald-400
                                    "
                                >
                                    Replying to{" "}
                                    {replyingTo.sender?.name ||
                                        "message"}
                                </p>


                                <p
                                    className="
                                        !mt-1
                                        !mb-0
                                        !truncate
                                        !text-xs
                                        !text-slate-400
                                    "
                                >
                                    {replyingTo.isDeletedForEveryone
                                        ? "This message was deleted"
                                        : replyingTo.decryptedContent ||
                                          replyingTo.content ||
                                          "Encrypted message"}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCancelReply
                                }
                                title="Cancel reply"
                                className="
                                    !flex
                                    !h-8
                                    !w-8
                                    !shrink-0
                                    !items-center
                                    !justify-center
                                    !rounded-lg
                                    !text-lg
                                    !text-slate-500
                                    !transition
                                    hover:!bg-white/5
                                    hover:!text-white
                                "
                            >
                                ×
                            </button>

                        </div>

                    )}


                    <form
                        onSubmit={
                            handleSendMessage
                        }
                        className="
                            !mx-auto
                            !flex
                            !w-full
                            !max-w-5xl
                            !items-center
                            !gap-2
                        "
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


                        {/* FILE BUTTON */}

                        <button
                            type="button"
                            onClick={
                                handleFileButtonClick
                            }
                            disabled={
                                uploading ||
                                sending
                            }
                            title="Upload file"
                            className="
                                !flex
                                !h-12
                                !w-12
                                !shrink-0
                                !items-center
                                !justify-center
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-white/[0.03]
                                !text-lg
                                !text-slate-400
                                !transition
                                hover:!border-emerald-400/30
                                hover:!bg-emerald-400/5
                                hover:!text-emerald-300
                                disabled:!opacity-50
                            "
                        >
                            {uploading
                                ? "..."
                                : "📎"}
                        </button>


                        {/* MESSAGE INPUT */}

                        <input
                            type="text"
                            value={
                                messageText
                            }
                            onChange={(
                                event
                            ) => {

                                const value =
                                    event.target.value;

                                setMessageText(
                                    value
                                );

                                if (
                                    !socket.connected ||
                                    !projectId ||
                                    !currentUserId
                                ) {
                                    return;
                                }

                                if (localTypingTimeoutRef.current) {
                                    clearTimeout(
                                        localTypingTimeoutRef.current
                                    );
                                }

                                if (!value.trim()) {

                                    socket.emit(
                                        "typing_stop",
                                        { projectId }
                                    );

                                    return;

                                }

                                socket.emit(
                                    "typing_start",
                                    { projectId }
                                );

                                localTypingTimeoutRef.current =
                                    setTimeout(() => {

                                        socket.emit(
                                            "typing_stop",
                                            { projectId }
                                        );

                                    }, 2500);

                            }}
                            placeholder={
                                socketStatus ===
                                "connected"
                                    ? "Write an encrypted message..."
                                    : "Chat is connecting..."
                            }
                            disabled={
                                sending ||
                                uploading ||
                                socketStatus !==
                                    "connected"
                            }
                            className="
                                !h-12
                                !min-w-0
                                !flex-1
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-[#10171f]
                                !px-4
                                !text-sm
                                !text-white
                                !outline-none
                                placeholder:!text-slate-600
                                focus:!border-emerald-400/30
                                focus:!ring-2
                                focus:!ring-emerald-400/10
                            "
                        />


                        {/* SEND */}

                        <button
                            type="submit"
                            disabled={
                                sending ||
                                uploading ||
                                !messageText.trim() ||
                                socketStatus !==
                                    "connected"
                            }
                            className="
                                !hidden
                                !h-12
                                !shrink-0
                                !rounded-xl
                                !bg-emerald-400
                                !px-5
                                !text-sm
                                !font-black
                                !text-black
                                !transition
                                hover:!bg-emerald-300
                                disabled:!cursor-not-allowed
                                disabled:!opacity-40
                                sm:!block
                            "
                        >
                            {sending
                                ? "Sending..."
                                : "Send"}
                        </button>

                    </form>

                </div>

            </div>

        </section>

    </main>

);
};


export default ChatPage;