const arrayBufferToBase64 = (
    buffer
) => {

    const bytes =
        new Uint8Array(buffer);

    let binary = "";

    bytes.forEach(
        (byte) => {

            binary +=
                String.fromCharCode(byte);

        }
    );

    return btoa(binary);

};


const base64ToArrayBuffer = (
    base64
) => {

    const binary =
        atob(base64);

    const bytes =
        new Uint8Array(
            binary.length
        );

    for (
        let i = 0; i < binary.length; i++
    ) {

        bytes[i] =
            binary.charCodeAt(i);

    }

    return bytes.buffer;

};


// ==============================
// RSA USER KEY PAIR
// ==============================

const generateUserKeyPair = async() => {

    return await crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([
                1,
                0,
                1
            ]),
            hash: "SHA-256"
        },
        true, [
            "encrypt",
            "decrypt"
        ]
    );

};


// ==============================
// GET OR CREATE USER KEYS
// ==============================

const getOrCreateUserKeys = async(
    userId
) => {

    if (!userId) {

        throw new Error(
            "User ID is required for E2EE keys"
        );

    }


    const publicKeyStorageName =
        `e2eePublicKey_${userId}`;


    const privateKeyStorageName =
        `e2eePrivateKey_${userId}`;


    const savedPublicKey =
        localStorage.getItem(
            publicKeyStorageName
        );


    const savedPrivateKey =
        localStorage.getItem(
            privateKeyStorageName
        );


    if (
        savedPublicKey &&
        savedPrivateKey
    ) {

        return {

            publicKey: savedPublicKey,

            privateKey: savedPrivateKey

        };

    }


    const keyPair =
        await generateUserKeyPair();


    const exportedPublicKey =
        await crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );


    const exportedPrivateKey =
        await crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
        );


    const publicKey =
        arrayBufferToBase64(
            exportedPublicKey
        );


    const privateKey =
        arrayBufferToBase64(
            exportedPrivateKey
        );


    localStorage.setItem(
        publicKeyStorageName,
        publicKey
    );


    localStorage.setItem(
        privateKeyStorageName,
        privateKey
    );


    return {

        publicKey,
        privateKey

    };

};

// ==============================
// AES MESSAGE KEY
// ==============================

const generateMessageKey = async() => {

    return await crypto.subtle.generateKey({
            name: "AES-GCM",
            length: 256
        },
        true, [
            "encrypt",
            "decrypt"
        ]
    );

};


// ==============================
// ENCRYPT MESSAGE
// ==============================

const encryptMessage = async(
    message
) => {

    const encoder =
        new TextEncoder();


    const messageKey =
        await generateMessageKey();


    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const encryptedData =
        await crypto.subtle.encrypt({
                name: "AES-GCM",
                iv
            },
            messageKey,
            encoder.encode(message)
        );


    const rawKey =
        await crypto.subtle.exportKey(
            "raw",
            messageKey
        );


    return {

        encryptedContent: arrayBufferToBase64(
            encryptedData
        ),

        iv: arrayBufferToBase64(
            iv.buffer
        ),

        rawMessageKey: rawKey

    };

};


// ==============================
// ENCRYPT AES KEY
// FOR ONE USER
// ==============================

const encryptMessageKeyForUser = async(
    rawMessageKey,
    publicKeyBase64
) => {

    const publicKey =
        await crypto.subtle.importKey(
            "spki",

            base64ToArrayBuffer(
                publicKeyBase64
            ),

            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },

            false,

            [
                "encrypt"
            ]
        );


    const encryptedKey =
        await crypto.subtle.encrypt({
                name: "RSA-OAEP"
            },

            publicKey,

            rawMessageKey
        );


    return arrayBufferToBase64(
        encryptedKey
    );

};


// ==============================
// CREATE ENCRYPTED KEYS
// FOR PROJECT USERS
// ==============================

const createEncryptedKeys = async(
    rawMessageKey,
    projectUsers
) => {

    const encryptedKeys =
        await Promise.all(

            projectUsers.map(
                async(user) => {

                    const encryptedKey =
                        await encryptMessageKeyForUser(

                            rawMessageKey,

                            user.publicKey
                        );


                    return {

                        user: user.userId,

                        encryptedKey,

                        keyVersion: user.keyVersion

                    };

                }
            )

        );


    return encryptedKeys;

};

// ==============================
// GET PRIVATE KEY
// ==============================

const getUserPrivateKey = async(
    userId
) => {

    const {
        privateKey
    } =
    await getOrCreateUserKeys(
        userId
    );


    return await crypto.subtle.importKey(
        "pkcs8",

        base64ToArrayBuffer(
            privateKey
        ),

        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },

        false,

        [
            "decrypt"
        ]
    );

};


// ==============================
// DECRYPT AES MESSAGE KEY
// ==============================

const decryptMessageKey = async(
    encryptedKey,
    userId
) => {

    const privateKey =
        await getUserPrivateKey(
            userId
        );


    return await crypto.subtle.decrypt({
            name: "RSA-OAEP"
        },

        privateKey,

        base64ToArrayBuffer(
            encryptedKey
        )
    );

};

// ==============================
// IMPORT AES MESSAGE KEY
// ==============================

const importMessageKey = async(
    rawMessageKey
) => {

    const messageKey =
        await crypto.subtle.importKey(
            "raw",

            rawMessageKey,

            {
                name: "AES-GCM"
            },

            false,

            [
                "decrypt"
            ]
        );


    return messageKey;

};


// ==============================
// DECRYPT MESSAGE
// ==============================

const decryptMessage = async({
    encryptedContent,
    iv,
    encryptedKey,
    userId
}) => {

    if (!encryptedContent ||
        !iv ||
        !encryptedKey ||
        !userId
    ) {

        throw new Error(
            "Encrypted message data is incomplete"
        );

    }


    const rawMessageKey =
        await decryptMessageKey(
            encryptedKey,
            userId
        );


    const messageKey =
        await importMessageKey(
            rawMessageKey
        );


    const decryptedData =
        await crypto.subtle.decrypt({
                name: "AES-GCM",

                iv: new Uint8Array(
                    base64ToArrayBuffer(
                        iv
                    )
                )
            },

            messageKey,

            base64ToArrayBuffer(
                encryptedContent
            )
        );


    return new TextDecoder().decode(
        decryptedData
    );

};
export {

    arrayBufferToBase64,

    base64ToArrayBuffer,

    getOrCreateUserKeys,

    encryptMessage,

    createEncryptedKeys,
    decryptMessage,
    encryptMessageKeyForUser,

    decryptMessageKey

};