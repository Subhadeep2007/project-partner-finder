import {
    useEffect,
    useState
} from "react";

import {
    acceptJoinRequest,
    getIncomingJoinRequests,
    rejectJoinRequest
} from "../services/joinRequest.service";


const IncomingJoinRequestsPage = () => {

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [processingId, setProcessingId] =
        useState(null);


    useEffect(() => {

        const fetchRequests = async() => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getIncomingJoinRequests();

                setRequests(
                    response.data || []
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load join requests"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchRequests();

    }, []);


    const handleAccept = async(requestId) => {

        try {

            setProcessingId(requestId);
            setError("");

            await acceptJoinRequest(requestId);

            setRequests((previousRequests) =>
                previousRequests.filter(
                    (request) =>
                        request._id !== requestId
                )
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to accept join request"
            );

        } finally {

            setProcessingId(null);

        }

    };


    const handleReject = async(requestId) => {

        try {

            setProcessingId(requestId);
            setError("");

            await rejectJoinRequest(requestId);

            setRequests((previousRequests) =>
                previousRequests.filter(
                    (request) =>
                        request._id !== requestId
                )
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to reject join request"
            );

        } finally {

            setProcessingId(null);

        }

    };


    if (loading) {

        return (
            <div className="join-requests-state">
                Loading join requests...
            </div>
        );

    }


    return (

        <section className="join-requests-page">

            <div className="join-requests__header">

                <p>
                    ~/projects/requests
                </p>

                <h1>
                    Incoming Join Requests
                </h1>

                <span>
                    Manage users who want to join your projects.
                </span>

            </div>


            {error && (

                <div className="join-requests__error">
                    {error}
                </div>

            )}


            {requests.length === 0 ? (

                <div className="join-requests__empty">

                    No pending join requests.

                </div>

            ) : (

                <div className="join-requests__list">

                    {requests.map((request) => (

                        <div
                            key={request._id}
                            className="join-request-card"
                        >

                            <div className="join-request-card__info">

                                <h3>
                                    {request.user?.name ||
                                        "Unknown User"}
                                </h3>

                                <p>
                                    wants to join
                                </p>

                                <strong>
                                    {request.project?.title ||
                                        "Unknown Project"}
                                </strong>

                            </div>


                            <div className="join-request-card__actions">

                                <button
                                    type="button"
                                    className="join-request-button join-request-button--accept"
                                    onClick={() =>
                                        handleAccept(
                                            request._id
                                        )
                                    }
                                    disabled={
                                        processingId ===
                                        request._id
                                    }
                                >

                                    {processingId === request._id
                                        ? "Processing..."
                                        : "Accept"}

                                </button>


                                <button
                                    type="button"
                                    className="join-request-button join-request-button--reject"
                                    onClick={() =>
                                        handleReject(
                                            request._id
                                        )
                                    }
                                    disabled={
                                        processingId ===
                                        request._id
                                    }
                                >

                                    Reject

                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

};


export default IncomingJoinRequestsPage;